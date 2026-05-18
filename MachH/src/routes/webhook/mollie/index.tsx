import type { RequestHandler } from "@builder.io/qwik-city";
import { createServerClient } from "supabase-auth-helpers-qwik";
import { sendConfirmationEmails } from "~/util/mail";
import sanityClient from "~/cms/sanityClient";
import { retryWithBackoff } from "~/util/retryHelper";

export const onPost: RequestHandler = async (requestEvent) => {
    const startTime = Date.now();
    const logData: any = {
        timestamp: new Date().toISOString(),
        webhook: "mollie",
        step: "start"
    };

    try {
        // Skip CSRF for webhooks
        requestEvent.sharedMap.set("skipCSRF", true);
        // Get payment ID from request
        const body = await requestEvent.parseBody() as any;
        const paymentId = body?.id as string;
        logData.paymentId = paymentId;

        // Basic verification
        const { verifyWebhookRequest, getMolliePayment } = await import("~/services/mollie");
        if (!verifyWebhookRequest(paymentId)) {
            console.error("[MOLLIE WEBHOOK] Invalid payment ID format:", paymentId);
            requestEvent.json(400, { error: "Invalid payment ID" });
            return;
        }
        
        // Get Mollie API key
        const mollieApiKey = requestEvent.env.get("MOLLIE_API_KEY");
        if (!mollieApiKey) {
            requestEvent.json(500, { error: "Server configuration error" });
            return;
        }
        
        // Get payment details from Mollie
        const publicAppUrl = requestEvent.env.get("PUBLIC_APP_URL") || requestEvent.url.origin;
        const payment = await getMolliePayment(paymentId, publicAppUrl);

        if (!payment.metadata?.attendeeId) {
            console.error("[MOLLIE WEBHOOK] Missing attendeeId in metadata:", payment.metadata);
            requestEvent.json(400, { error: "Invalid payment metadata" });
            return;
        }
        
        // Initialize Supabase client
        const supabaseClient = createServerClient(
            requestEvent.env.get("SUPABASE_URL")!,
            requestEvent.env.get("SUPABASE_ANON_KEY")!,
            requestEvent
        );
        
        // Get attendee record
        const { data: attendee, error: attendeeError } = await supabaseClient
            .from("attendees")
            .select("*")
            .eq("id", payment.metadata.attendeeId)
            .single();
            
        if (attendeeError || !attendee) {
            requestEvent.json(404, { error: "Attendee not found" });
            return;
        }

        // Check if already processed
        if (attendee.payment_status === "confirmed" && payment.status === "paid") {
            requestEvent.json(200, { message: "Already processed" });
            return;
        }

        // Update attendee based on payment status
        const updateData: any = {
            payment_id: payment.id,
        };

        if (payment.status === "paid") {
            updateData.payment_status = "confirmed";
            updateData.paid_at = new Date().toISOString();
            
            // Update attendee with retry mechanism
            try {
                await retryWithBackoff(async () => {
                    const { error, data } = await supabaseClient
                        .from("attendees")
                        .update(updateData)
                        .eq("id", attendee.id)
                        .select();

                    if (error) {
                        throw error;
                    }
                    return data;
                }, 3, 1000, 2);

            } catch (updateError) {
                console.error("[MOLLIE WEBHOOK] Database update failed after retries:", {
                    error: updateError,
                    attendeeId: attendee.id,
                    updateData
                });
                requestEvent.json(500, { error: "Failed to update payment status after retries" });
                return;
            }
            
            // Fetch event details for confirmation email
            const [event] = await sanityClient.fetch(
                `*[_type == "event" && slug.current == "${attendee.event_slug}"]{confirmationMailSubject, confirmationMailBody}`
            );
            
            if (event?.confirmationMailSubject && event?.confirmationMailBody) {
                // Send confirmation emails
                await sendConfirmationEmails(
                    attendee,
                    {
                        subject: event.confirmationMailSubject,
                        body: event.confirmationMailBody,
                    },
                    requestEvent.env.get("RESEND_API_KEY")!
                );
            }
        } else if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
            updateData.payment_status = "failed";

            // Update attendee with retry mechanism
            try {
                await retryWithBackoff(async () => {
                    const { error } = await supabaseClient
                        .from("attendees")
                        .update(updateData)
                        .eq("id", attendee.id);

                    if (error) {
                        throw error;
                    }
                }, 3, 1000, 2);

            } catch (updateError) {
                console.error("[MOLLIE WEBHOOK] Failed to update failed payment status after retries:", updateError);
            }
        } else {
            // Log unexpected status
            console.warn("[MOLLIE WEBHOOK] Unexpected payment status received:", {
                status: payment.status,
                paymentId: payment.id,
                attendeeId: attendee.id
            });
        }

        requestEvent.json(200, { message: "Webhook processed successfully" });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error("[MOLLIE WEBHOOK] Fatal error after", duration, "ms:", {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error,
            logData
        });
        requestEvent.json(500, { error: "Internal server error" });
    }
};