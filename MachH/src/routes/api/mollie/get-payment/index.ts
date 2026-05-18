import type { RequestHandler } from "@builder.io/qwik-city";

export interface GetPaymentRequest {
    paymentId: string;
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
    paidAt?: string;
}

export const onPost: RequestHandler = async ({ request, json, env }) => {
    try {
        const mollieApiKey = env.get("MOLLIE_API_KEY");
        if (!mollieApiKey) {
            json(500, { error: "Server configuration error" });
            return;
        }

        const body = await request.json() as GetPaymentRequest;
        
        // Validate required fields
        if (!body.paymentId) {
            console.error("Invalid request body:", body);
            json(400, { error: "Missing payment ID" });
            return;
        }
        
        // Use fetch directly instead of Mollie SDK
        const response = await fetch(`https://api.mollie.com/v2/payments/${body.paymentId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${mollieApiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Mollie API error:", errorData);
            json(response.status, { error: "Payment retrieval failed", details: errorData });
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
            createdAt: payment.createdAt,
            paidAt: payment.paidAt || undefined,
        });

    } catch (error) {
        console.error("Mollie payment retrieval error:", error);
        json(500, { 
            error: "Failed to get payment", 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
};