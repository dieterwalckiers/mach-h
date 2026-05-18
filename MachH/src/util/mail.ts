import { server$ } from "@builder.io/qwik-city";
import { Resend } from "resend";

export const sendConfirmationEmails = server$(
    async function (
        data: {
            id: string;
            event_slug: string;
            first_name: string;
            last_name: string;
            email: string;
            subscribe_to_newsletter?: boolean;
        },
        confirmationMailInfo: {
            subject: string;
            body: string;
        },
        resendApiKey: string,
    ) {
        await Promise.all([
            sendInternalEmail(data, resendApiKey),
            sendSubscriberEmail(data, confirmationMailInfo, resendApiKey),
        ]);
    }
);

const sendInternalEmail = server$(
    async function (
        data: {
            id: string;
            event_slug: string;
            first_name: string;
            last_name: string;
            email: string;
            subscribe_to_newsletter?: boolean;
        },
        resendApiKey: string,
    ) {
        const newsletterText = data.subscribe_to_newsletter
            ? "JA"
            : "NEE";

        const resend = new Resend(resendApiKey);
        const response = await resend.emails.send({
            from: "Mach-H <inschrijvingen@transactional.mach-h.be>",
            replyTo: "inschrijvingen@mach-h.be",
            to: "inschrijvingen@mach-h.be",
            subject: `Nieuwe inschrijving voor ${data.event_slug}`,
            html: `<div><p>Nieuwe inschrijving voor ${data.event_slug} van ${data.first_name} ${data.last_name} (${data.email})!</p><p>Nieuwsbrief: ${newsletterText}</p><p>Bekijk alle inschrijvingen op supabase.com</p></div>`,
            text: `Nieuwe inschrijving voor ${data.event_slug} van ${data.first_name} ${data.last_name} (${data.email})! Nieuwsbrief: ${newsletterText}. Bekijk alle inschrijvingen op supabase.com`,
        });
        console.log("response.data?.id", response.data?.id);
    }
);

const sendSubscriberEmail = server$(
    async function (
        data: {
            id: string;
            event_slug: string;
            first_name: string;
            last_name: string;
            email: string;
        },
        confirmationMailInfo: {
            subject: string;
            body: string;
        },
        resendApiKey: string,
    ) {

        const resend = new Resend(resendApiKey);
        await resend.emails.send({
            from: "Mach-H <inschrijvingen@transactional.mach-h.be>",
            replyTo: "inschrijvingen@mach-h.be",
            to: data.email,
            subject: confirmationMailInfo.subject,
            html: confirmationMailInfo.body.replace(/(\r\n|\n|\r)/g, "<br>"),
            text: confirmationMailInfo.body,
        });
    }
);