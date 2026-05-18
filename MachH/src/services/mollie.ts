export interface CreatePaymentParams {
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

export interface PaymentData {
    id: string;
    status: string;
    amount: any;
    description: string;
    metadata: any;
    createdAt: string;
    paidAt?: string;
    checkoutUrl?: string;
}

export async function createMolliePayment(params: CreatePaymentParams, baseUrl: string): Promise<PaymentData> {
    const response = await fetch(`${baseUrl}/api/mollie/create-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        // Enhanced error logging for debugging
        const errorBody = await response.text().catch(() => 'Unable to read response body');
        console.error('Mollie payment creation failed:', {
            status: response.status,
            statusText: response.statusText,
            url: `${baseUrl}/api/mollie/create-payment`,
            responseBody: errorBody,
            requestParams: {
                ...params,
                // Don't log sensitive data like payment amounts in production
                amount: process.env.NODE_ENV === 'production' ? '[REDACTED]' : params.amount
            }
        });
        
        throw new Error(`Failed to create payment: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return await response.json();
}

export async function getMolliePayment(paymentId: string, baseUrl: string): Promise<PaymentData> {
    const response = await fetch(`${baseUrl}/api/mollie/get-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
    });

    if (!response.ok) {
        // Enhanced error logging for debugging
        const errorBody = await response.text().catch(() => 'Unable to read response body');
        console.error('Mollie payment retrieval failed:', {
            status: response.status,
            statusText: response.statusText,
            url: `${baseUrl}/api/mollie/get-payment`,
            responseBody: errorBody,
            requestParams: { paymentId }
        });
        
        throw new Error(`Failed to get payment: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return await response.json();
}

export function verifyWebhookRequest(paymentId: string | undefined): boolean {
    return !!(paymentId && paymentId.startsWith('tr_'));
}