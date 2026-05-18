import { Link, routeAction$, routeLoader$, z, zod$ } from "@builder.io/qwik-city";
import { component$, useComputed$ } from "@builder.io/qwik";
import EventCard from "~/components/EventCard/EventCard";
import MachHTitle from "~/components/shared/machhtitle";
import type { RequestEventLoader } from "@builder.io/qwik-city";
import { createServerClient } from "supabase-auth-helpers-qwik";
import { normalizeEvent } from "~/util/normalizing";
import sanityClient from "~/cms/sanityClient";
import { sendConfirmationEmails } from "~/util/mail";

// TODO confirmation mail (pending data from frank), then mollie

export const useRouteInfo = routeLoader$(async (requestEvent: RequestEventLoader) => {
    const [event] = await sanityClient.fetch(`*[_type == "event" && slug.current == "${requestEvent.params.slug}"]{..., "imageUrl": image.asset->url,"imageRef": image.asset._ref, "photoUrls": photos[].asset->url, "photoRefs": photos[].asset._ref, linkedProjects[]->{name, slug, hexColor}, subscriptionIsPaid, subscriptionPrice}`);
    let isFull;
    if (event?.slug && event.subscribable) {
        const supabaseClient = createServerClient(
            requestEvent.env.get("SUPABASE_URL")!,
            requestEvent.env.get("SUPABASE_ANON_KEY")!,
            requestEvent
        );
        const rs = await supabaseClient
            .from("attendees")
            .select("id", { count: "exact" })
            .eq("event_slug", event.slug.current)
            .eq("payment_status", "confirmed");
        const { count } = rs;
        isFull = (count || 0) >= event!.subscriptionMaxParticipants;
    }
    return {
        event: normalizeEvent(event, false, { isFull }),
        source: requestEvent.query.get("s"),
        year: requestEvent.query.get("y"),
        monthIndex: requestEvent.query.get("mI"),
        from: requestEvent.query.get("f"),
        to: requestEvent.query.get("t"),
    };
})

export const useSubscribe = routeAction$(
    async (data, requestEvent) => {
        const supabaseClient = createServerClient(
            requestEvent.env.get("SUPABASE_URL")!,
            requestEvent.env.get("SUPABASE_ANON_KEY")!,
            requestEvent
        );
        
        try {
            // Fetch event details to check if it's a paid event
            const [event] = await sanityClient.fetch(
                `*[_type == "event" && slug.current == "${data.eventSlug}"]{subscriptionIsPaid, subscriptionPrice, title}`
            );
            
            const isPaidEvent = event?.subscriptionIsPaid && event?.subscriptionPrice > 0;
            
            // Insert attendee with appropriate payment status
            const { data: supabaseResponseData, error } = await supabaseClient.from("attendees")
                .insert({
                    event_slug: data.eventSlug,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    remarks: data.remarks || null,
                    payment_status: isPaidEvent ? 'pending_payment' : 'confirmed',
                    subscribe_to_newsletter: data.subscribeToNewsletter === "true",
                })
                .select()
                .single();
                
            if (error) {
                console.error("error", error);
                return { success: false, error };
            }
            
            if (!supabaseResponseData.id) {
                console.log("no id in response data, considering it an error");
                return { success: false };
            }
            
            if (isPaidEvent) {
                // Create Mollie payment
                const mollieApiKey = requestEvent.env.get("MOLLIE_API_KEY");
                const publicAppUrl = requestEvent.env.get("PUBLIC_APP_URL") || requestEvent.url.origin;

                // Note: For mollie callback to work in local development, you need to use ngrok or set MOLLIE_WEBHOOK_URL explicitly
                const mollieWebhookUrl = requestEvent.env.get("MOLLIE_WEBHOOK_URL") || `${publicAppUrl}/webhook/mollie`;

                // Log webhook URL for debugging
                console.log("[PAYMENT] Creating payment with webhook URL:", mollieWebhookUrl);

                if (mollieWebhookUrl.includes("localhost") || mollieWebhookUrl.includes("127.0.0.1")) {
                    console.warn("[PAYMENT] WARNING: Using localhost webhook URL - Mollie won't be able to reach this!");
                    console.warn("[PAYMENT] Consider using ngrok or setting MOLLIE_WEBHOOK_URL env variable");
                }
                
                if (!mollieApiKey) {
                    console.error("MOLLIE_API_KEY not configured");
                    return { success: false, error: "Payment configuration error" };
                }
                
                // Use API route to create payment
                const { createMolliePayment } = await import("~/services/mollie");
                
                const payment = await createMolliePayment({
                    amount: event.subscriptionPrice,
                    description: `Inschrijving voor ${event.title}`,
                    redirectUrl: `${publicAppUrl}/payment/status?attendeeId=${supabaseResponseData.id}`,
                    webhookUrl: mollieWebhookUrl,
                    metadata: {
                        attendeeId: supabaseResponseData.id.toString(),
                        eventSlug: data.eventSlug,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        remarks: data.remarks || "",
                    }
                }, publicAppUrl);
                
                // Update attendee with payment ID
                await supabaseClient.from("attendees")
                    .update({ payment_id: payment.id })
                    .eq('id', supabaseResponseData.id);
                
                // Return payment URL for redirect
                return {
                    success: true,
                    paymentUrl: payment.checkoutUrl,
                };
            } else {
                // Free event - send confirmation immediately
                await sendConfirmationEmails(
                    supabaseResponseData,
                    {
                        subject: data.eventConfirmationMailSubject,
                        body: data.eventConfirmationMailBody,
                    },
                    requestEvent.env.get("RESEND_API_KEY")!
                );
                
                return { success: true };
            }
        } catch (e) {
            console.error("caught error", e);
            return { success: false, error: e };
        }
    },
    zod$(
        z.object(
            {
                firstName: z.string().min(1, "Voornaam is verplicht"),
                lastName: z.string().min(1, "Achternaam is verplicht"),
                email: z.string().email("Ongeldig email adres"),
                eventSlug: z.string().min(1, "Event slug is verplicht"),
                mathQuestion: z.coerce.number().min(1, "Vul een getal in bij de rekensom"),
                mathSolution: z.coerce.number(),
                eventConfirmationMailSubject: z.string(),
                eventConfirmationMailBody: z.string(),
                remarks: z.string().optional(),
                subscribeToNewsletter: z.string().optional(),
            }
        ).refine((data) => {
            return data.mathSolution === data.mathQuestion;
        }, {
            message: "Er is een foutje geslopen in de rekensom",
            path: ["mathQuestion"],
        }),
    )
);

const Event = component$(() => {

    const routeInfoSignal = useRouteInfo();
    const { event, source, year, monthIndex, from, to } = routeInfoSignal.value;

    const backToCalendarLink = useComputed$(() => {
        if (source === "m") {
            return `/calendar-overview${year !== null && monthIndex !== null ? `?y=${year}&mI=${monthIndex}` : ""}`;
        } else {
            return `/calendar${from !== null && to !== null ? `?from=${from}&to=${to}` : ""}`;
        }
    });

    const subscribeAction = useSubscribe();

    return (
        <div class="w-full">
            <div class="header flex items-center justify-between w-full py-8 border-b-[3px] border-machh-primary">
                <MachHTitle size="text-6xl">
                    Activiteit
                </MachHTitle>
            </div>
            <EventCard event={event} showDetail subscribeAction={subscribeAction} />
            <Link href={backToCalendarLink.value} class="flex items-center text-machh-primary text-xl font-medium leading-none py-8 cursor-pointer">
                <label class="text-4xl pointer-events-none">&#x2190;</label>
                <div class="whitespace-break-spaces ml-2">
                    {`terug naar
kalender`}
                </div>
            </Link>
        </div>
    )
})

export default Event;