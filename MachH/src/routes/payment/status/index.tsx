import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import type { RequestEventLoader } from "@builder.io/qwik-city";
import { createServerClient } from "supabase-auth-helpers-qwik";

export const usePaymentStatus = routeLoader$(async (requestEvent: RequestEventLoader) => {
    const paymentId = requestEvent.query.get("p");
    const attendeeId = requestEvent.query.get("attendeeId");
    
    if (!paymentId && !attendeeId) {
        return { success: false, error: "No payment ID or attendee ID provided" };
    }
    
    try {
        // Initialize Supabase client
        const supabaseClient = createServerClient(
            requestEvent.env.get("SUPABASE_URL")!,
            requestEvent.env.get("SUPABASE_ANON_KEY")!,
            requestEvent
        );
        
        let attendee;
        let actualPaymentId;
        
        if (attendeeId) {
            // Get attendee info and payment ID from database
            const { data: attendeeData, error: attendeeError } = await supabaseClient
                .from("attendees")
                .select("*")
                .eq("id", attendeeId)
                .single();
                
            if (attendeeError || !attendeeData) {
                return { success: false, error: "Attendee not found" };
            }
            
            attendee = attendeeData;
            actualPaymentId = attendeeData.payment_id;
        } else {
            actualPaymentId = paymentId;
        }
        
        if (!actualPaymentId) {
            return { success: false, error: "No payment ID found" };
        }
        
        // Get Mollie API key
        const mollieApiKey = requestEvent.env.get("MOLLIE_API_KEY");
        if (!mollieApiKey) {
            return { success: false, error: "Payment configuration error" };
        }
        
        // Get payment details from Mollie
        const { getMolliePayment } = await import("~/services/mollie");
        const publicAppUrl = requestEvent.env.get("PUBLIC_APP_URL") || requestEvent.url.origin;
        const payment = await getMolliePayment(actualPaymentId, publicAppUrl);
        
        if (!attendee) {
            // If we didn't get attendee from attendeeId, get it from payment metadata
            if (!payment.metadata?.attendeeId) {
                return { success: false, error: "Invalid payment metadata" };
            }
            
            const { data: attendeeData, error: attendeeError } = await supabaseClient
                .from("attendees")
                .select("*")
                .eq("id", payment.metadata.attendeeId)
                .single();
                
            if (attendeeError || !attendeeData) {
                return { success: false, error: "Attendee not found" };
            }
            
            attendee = attendeeData;
        }

        // Check if database is out of sync with Mollie (for when webhook hasn't arrived yet)
        if (payment.status === "paid" && attendee.payment_status !== "confirmed") {
            console.log("[PAYMENT STATUS PAGE] Database out of sync, updating now...");

            // Update the database to match Mollie status
            const { error: updateError } = await supabaseClient
                .from("attendees")
                .update({
                    payment_status: "confirmed",
                    paid_at: payment.paidAt || new Date().toISOString()
                })
                .eq("id", attendee.id);

            if (updateError) {
                console.error("[PAYMENT STATUS PAGE] Failed to sync status:", updateError);
            } else {
                console.log("[PAYMENT STATUS PAGE] Successfully synced payment status to confirmed");
                attendee.payment_status = "confirmed"; // Update local object

                // Send confirmation email if not already sent
                try {
                    const { sendConfirmationEmails } = await import("~/util/mail");
                    const sanityClient = (await import("~/cms/sanityClient")).default;

                    const [event] = await sanityClient.fetch(
                        `*[_type == "event" && slug.current == "${attendee.event_slug}"]{confirmationMailSubject, confirmationMailBody}`
                    );

                    if (event?.confirmationMailSubject && event?.confirmationMailBody) {
                        await sendConfirmationEmails(
                            attendee,
                            {
                                subject: event.confirmationMailSubject,
                                body: event.confirmationMailBody,
                            },
                            requestEvent.env.get("RESEND_API_KEY")!
                        );
                        console.log("[PAYMENT STATUS PAGE] Sent confirmation email");
                    }
                } catch (emailError) {
                    console.error("[PAYMENT STATUS PAGE] Failed to send confirmation email:", emailError);
                    // Don't fail the request if email fails
                }
            }
        }

        // Extract only serializable data from payment object
        const paymentData = {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            description: payment.description,
            metadata: payment.metadata,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt,
        };
        
        return { 
            success: true, 
            payment: paymentData,
            attendee,
            eventSlug: attendee.event_slug 
        };
        
    } catch (error) {
        console.error("Payment status check error:", error);
        return { success: false, error: "Failed to check payment status" };
    }
});

// Server function to check payment status (used by the polling mechanism)
export const checkPaymentStatus = server$(async function(paymentId: string | null, attendeeId: string | null) {
    const self = this; // Store context reference
    if (!paymentId && !attendeeId) {
        return { success: false, error: "No payment ID or attendee ID provided" };
    }
    
    try {
        // Initialize Supabase client
        const supabaseClient = createServerClient(
            this.env.get("SUPABASE_URL")!,
            this.env.get("SUPABASE_ANON_KEY")!,
            this
        );
        
        let attendee;
        let actualPaymentId;
        
        if (attendeeId) {
            // Get attendee info and payment ID from database
            const { data: attendeeData, error: attendeeError } = await supabaseClient
                .from("attendees")
                .select("*")
                .eq("id", attendeeId)
                .single();
                
            if (attendeeError || !attendeeData) {
                return { success: false, error: "Attendee not found" };
            }
            
            attendee = attendeeData;
            actualPaymentId = attendeeData.payment_id;
        } else {
            actualPaymentId = paymentId;
        }
        
        if (!actualPaymentId) {
            return { success: false, error: "No payment ID found" };
        }
        
        // Get Mollie API key
        const mollieApiKey = this.env.get("MOLLIE_API_KEY");
        if (!mollieApiKey) {
            return { success: false, error: "Payment configuration error" };
        }
        
        // Get payment details from Mollie
        const { getMolliePayment } = await import("~/services/mollie");
        const publicAppUrl = this.env.get("PUBLIC_APP_URL") || this.url.origin;
        const payment = await getMolliePayment(actualPaymentId, publicAppUrl);
        
        if (!attendee) {
            // If we didn't get attendee from attendeeId, get it from payment metadata
            if (!payment.metadata?.attendeeId) {
                return { success: false, error: "Invalid payment metadata" };
            }
            
            const { data: attendeeData, error: attendeeError } = await supabaseClient
                .from("attendees")
                .select("*")
                .eq("id", payment.metadata.attendeeId)
                .single();
                
            if (attendeeError || !attendeeData) {
                return { success: false, error: "Attendee not found" };
            }
            
            attendee = attendeeData;
        }

        // Check if database is out of sync with Mollie (for when webhook hasn't arrived yet)
        if (payment.status === "paid" && attendee.payment_status !== "confirmed") {
            console.log("[PAYMENT STATUS PAGE] Database out of sync, updating now...");

            // Update the database to match Mollie status
            const { error: updateError } = await supabaseClient
                .from("attendees")
                .update({
                    payment_status: "confirmed",
                    paid_at: payment.paidAt || new Date().toISOString()
                })
                .eq("id", attendee.id);

            if (updateError) {
                console.error("[PAYMENT STATUS PAGE] Failed to sync status:", updateError);
            } else {
                console.log("[PAYMENT STATUS PAGE] Successfully synced payment status to confirmed");
                attendee.payment_status = "confirmed"; // Update local object

                // Send confirmation email if not already sent
                try {
                    const { sendConfirmationEmails } = await import("~/util/mail");
                    const sanityClient = (await import("~/cms/sanityClient")).default;

                    const [event] = await sanityClient.fetch(
                        `*[_type == "event" && slug.current == "${attendee.event_slug}"]{confirmationMailSubject, confirmationMailBody}`
                    );

                    if (event?.confirmationMailSubject && event?.confirmationMailBody) {
                        await sendConfirmationEmails(
                            attendee,
                            {
                                subject: event.confirmationMailSubject,
                                body: event.confirmationMailBody,
                            },
                            self.env.get("RESEND_API_KEY")!
                        );
                        console.log("[PAYMENT STATUS PAGE] Sent confirmation email");
                    }
                } catch (emailError) {
                    console.error("[PAYMENT STATUS PAGE] Failed to send confirmation email:", emailError);
                    // Don't fail the request if email fails
                }
            }
        }

        // Extract only serializable data from payment object
        const paymentData = {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            description: payment.description,
            metadata: payment.metadata,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt,
        };
        
        return { 
            success: true, 
            payment: paymentData,
            attendee,
            eventSlug: attendee.event_slug 
        };
        
    } catch (error) {
        console.error("Payment status check error:", error);
        return { success: false, error: "Failed to check payment status" };
    }
});

const PaymentStatus = component$(() => {
    const paymentStatusSignal = usePaymentStatus();
    const result = useSignal(paymentStatusSignal.value);
    const pollCount = useSignal(0);
    const maxPolls = 24; // 24 * 5 seconds = 2 minutes max
    
    useVisibleTask$(({ cleanup }) => {
        // Get query parameters from URL - only available in browser
        const paymentId = new URLSearchParams(window.location.search).get("p");
        const attendeeId = new URLSearchParams(window.location.search).get("attendeeId");
        let intervalId: number | undefined;
        
        // Only start polling if payment is pending
        if (result.value.success && result.value.payment?.status === "pending") {
            intervalId = window.setInterval(async () => {
                if (pollCount.value >= maxPolls) {
                    // Stop polling after 2 minutes
                    if (intervalId) window.clearInterval(intervalId);
                    return;
                }
                
                try {
                    const updatedStatus = await checkPaymentStatus(paymentId, attendeeId);
                    result.value = updatedStatus;
                    pollCount.value++;
                    
                    // Stop polling if payment is no longer pending
                    if (updatedStatus.success && updatedStatus.payment?.status !== "pending") {
                        if (intervalId) window.clearInterval(intervalId);
                    }
                } catch (error) {
                    console.error("Error polling payment status:", error);
                }
            }, 5000); // Poll every 5 seconds
        }
        
        cleanup(() => {
            if (intervalId) window.clearInterval(intervalId);
        });
    });
    
    return (
        <div class="w-full">
            <div class="flex flex-col items-center justify-center min-h-[400px] text-center">
                {result.value.success ? (
                    <>
                        {result.value.payment?.status === "paid" ? (
                            <>
                                <div class="text-green-600 mb-4">
                                    <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-semibold mb-4 text-machh-primary">
                                    Bedankt voor je inschrijving!
                                </h2>
                                <p class="text-lg mb-8 text-machh-primary">
                                    Je betaling is succesvol verwerkt. Je ontvangt een bevestigingsmail met alle details.
                                </p>
                            </>
                        ) : result.value.payment?.status === "pending" ? (
                            <>
                                <div class="text-yellow-600 mb-4">
                                    <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-semibold mb-4 text-machh-primary">
                                    Betaling wordt verwerkt
                                </h2>
                                <p class="text-lg mb-8 text-machh-primary">
                                    Je betaling wordt nog verwerkt. We controleren automatisch de status...
                                </p>
                                {pollCount.value > 0 && (
                                    <p class="text-sm text-gray-600">
                                        Controle {pollCount.value} van {maxPolls}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <div class="text-red-600 mb-4">
                                    <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-semibold mb-4 text-machh-primary">
                                    Betaling mislukt
                                </h2>
                                <p class="text-lg mb-8 text-machh-primary">
                                    Je betaling is niet gelukt. Probeer het opnieuw of neem contact met ons op.
                                </p>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div class="text-red-600 mb-4">
                            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h2 class="text-2xl font-semibold mb-4 text-machh-primary">
                            Er is iets misgegaan
                        </h2>
                        <p class="text-lg mb-8 text-machh-primary">
                            {result.value.error || "We konden je betalingsinformatie niet vinden. Neem contact met ons op als dit probleem blijft bestaan."}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
});

export default PaymentStatus;