import type { RequestHandler } from "@builder.io/qwik-city";

export interface CreatePaymentRequest {
    amount: number;
    description: string;
    redirectUrl: string;
    webhookUrl: string;
    metadata: {
        attendeeId: string;
        eventSlug: string;
        firstName: string;
        lastName: string;
        email: string;
        remarks?: string;
    };
}

interface MolliePaymentResponse {
    id: string;
    status: string;
    amount: {
        currency: string;
        value: string;
    };
    description: string;
    metadata: any;
    createdAt: string;
    _links: {
        checkout?: {
            href: string;
        };
    };
}

export const onPost: RequestHandler = async ({ request, json, env }) => {
    try {
        const mollieApiKey = env.get("MOLLIE_API_KEY");
        if (!mollieApiKey) {
            json(500, { error: "Server configuration error" });
            return;
        }

        const body = await request.json() as CreatePaymentRequest;
        
        // Validate required fields
        if (typeof body.amount !== "number" || !body.description || !body.redirectUrl || !body.webhookUrl) {
            console.error("Invalid request body:", body);
            json(400, { error: "Missing required fields" });
            return;
        }
        
        console.log("Creating payment with Mollie API");

        const paymentParams = {
            amount: {
                currency: "EUR",
                value: body.amount.toFixed(2)
            },
            description: body.description,
            redirectUrl: body.redirectUrl,
            webhookUrl: body.webhookUrl,
            metadata: body.metadata
        };
        
        // Use fetch directly instead of Mollie SDK
        const response = await fetch("https://api.mollie.com/v2/payments", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${mollieApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentParams)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Mollie API error:", errorData);
            json(response.status, { error: "Payment creation failed", details: errorData });
            return;
        }

        const payment: MolliePaymentResponse = await response.json();

        // Return serializable payment data
        json(200, {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            description: payment.description,
            metadata: payment.metadata,
            checkoutUrl: payment._links.checkout?.href,
            createdAt: payment.createdAt,
        });

    } catch (error) {
        console.error("Mollie payment creation error:", error);
        console.error("Request body:", await request.text().catch(() => "Unable to read body"));
        json(500, { 
            error: "Failed to create payment", 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
};