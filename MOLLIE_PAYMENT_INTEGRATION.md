# Mollie Payment Integration Analysis

## Overview
The MachH application implements a complete Mollie payment integration for handling paid event subscriptions. The system manages the lifecycle of payments from creation through webhook processing and status updates.

---

## 1. Mollie Payment Initialization & Creation

### Entry Point: Event Subscription (Event Page)
**File**: `/home/dyte/source/machh/MachH/src/routes/event/[slug]/index.tsx`

#### Flow:
1. User submits subscription form through SubscriptionForm component
2. `useSubscribe` routeAction$ handles the form submission

#### Key Code (Lines 39-152):
```typescript
export const useSubscribe = routeAction$(
    async (data, requestEvent) => {
        // 1. Fetch event details from Sanity CMS
        const [event] = await sanityClient.fetch(
            `*[_type == "event" && slug.current == "${data.eventSlug}"]{subscriptionIsPaid, subscriptionPrice, title}`
        );
        
        const isPaidEvent = event?.subscriptionIsPaid && event?.subscriptionPrice > 0;
        
        // 2. Create attendee in Supabase with INITIAL STATUS
        const { data: supabaseResponseData, error } = await supabaseClient.from("attendees")
            .insert({
                event_slug: data.eventSlug,
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                payment_status: isPaidEvent ? 'pending_payment' : 'confirmed', // KEY: Sets to 'pending_payment'
            })
            .select()
            .single();
        
        if (isPaidEvent) {
            // 3. Create Mollie payment
            const mollieApiKey = requestEvent.env.get("MOLLIE_API_KEY");
            const publicAppUrl = requestEvent.env.get("PUBLIC_APP_URL") || requestEvent.url.origin;
            const mollieWebhookUrl = requestEvent.env.get("MOLLIE_WEBHOOK_URL") || `${publicAppUrl}/api/webhook/mollie`;
            
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
                }
            }, publicAppUrl);
            
            // 4. Update attendee with payment ID
            await supabaseClient.from("attendees")
                .update({ payment_id: payment.id })
                .eq('id', supabaseResponseData.id);
            
            // 5. Return payment URL for redirect to Mollie checkout
            return {
                success: true,
                paymentUrl: payment.checkoutUrl,
            };
        }
    },
    zod$(z.object({...})) // Validation with math CAPTCHA
);
```

#### Database Initial State:
- `payment_status`: "pending_payment"
- `payment_id`: Set after payment creation
- Attendee is created BEFORE payment is actually charged

---

## 2. Mollie Payment API Routes

### A. Create Payment Route
**File**: `/home/dyte/source/machh/MachH/src/routes/api/mollie/create-payment/index.ts`

**Endpoint**: POST `/api/mollie/create-payment`

```typescript
export const onPost: RequestHandler = async ({ request, json, env }) => {
    // 1. Get API key from environment
    const mollieApiKey = env.get("MOLLIE_API_KEY");
    
    // 2. Parse request body
    const body = await request.json() as CreatePaymentRequest;
    
    // 3. Build Mollie API payload
    const paymentParams = {
        amount: {
            currency: "EUR",
            value: body.amount.toFixed(2)
        },
        description: body.description,
        redirectUrl: body.redirectUrl,      // → /payment/status?attendeeId={id}
        webhookUrl: body.webhookUrl,        // → /webhook/mollie
        metadata: body.metadata              // Contains attendeeId, eventSlug, email, etc.
    };
    
    // 4. Call Mollie API directly (v2)
    const response = await fetch("https://api.mollie.com/v2/payments", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${mollieApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentParams)
    });
    
    // 5. Return payment details
    return {
        id: payment.id,              // e.g., "tr_..."
        status: payment.status,      // e.g., "open"
        amount: payment.amount,
        description: payment.description,
        metadata: payment.metadata,
        checkoutUrl: payment._links.checkout?.href,  // Mollie hosted checkout
        createdAt: payment.createdAt,
    };
};
```

**Request Structure**:
```typescript
interface CreatePaymentRequest {
    amount: number;                    // Price in EUR
    description: string;               // "Inschrijving voor {event.title}"
    redirectUrl: string;               // https://domain.com/payment/status?attendeeId={id}
    webhookUrl: string;                // https://domain.com/webhook/mollie
    metadata: {
        attendeeId: string;
        eventSlug: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}
```

### B. Get Payment Route
**File**: `/home/dyte/source/machh/MachH/src/routes/api/mollie/get-payment/index.ts`

**Endpoint**: POST `/api/mollie/get-payment`

```typescript
export const onPost: RequestHandler = async ({ request, json, env }) => {
    // Retrieve payment status from Mollie
    const response = await fetch(`https://api.mollie.com/v2/payments/${body.paymentId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${mollieApiKey}`,
            "Content-Type": "application/json"
        }
    });
    
    // Return payment details including status
    return {
        id: payment.id,
        status: payment.status,         // "open", "pending", "paid", "failed", "canceled", "expired"
        amount: payment.amount,
        description: payment.description,
        metadata: payment.metadata,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt || undefined,
    };
};
```

---

## 3. Webhook Handler for Mollie Callbacks

**File**: `/home/dyte/source/machh/MachH/src/routes/webhook/mollie/index.tsx`

**Endpoint**: POST `/webhook/mollie`

### Core Webhook Flow:

```typescript
export const onPost: RequestHandler = async (requestEvent) => {
    try {
        // 1. SKIP CSRF FOR WEBHOOKS (Security Note)
        requestEvent.sharedMap.set("skipCSRF", true);
        
        // 2. Extract payment ID from webhook body
        const body = await requestEvent.parseBody() as any;
        const paymentId = body?.id as string;
        
        // 3. Basic verification - Mollie IDs start with "tr_"
        if (!verifyWebhookRequest(paymentId)) {
            requestEvent.json(400, { error: "Invalid payment ID" });
            return;
        }
        
        // 4. Fetch complete payment details from Mollie API
        const payment = await getMolliePayment(paymentId, publicAppUrl);
        
        if (!payment.metadata?.attendeeId) {
            requestEvent.json(400, { error: "Invalid payment metadata" });
            return;
        }
        
        // 5. Get attendee record from Supabase
        const supabaseClient = createServerClient(...);
        const { data: attendee, error: attendeeError } = await supabaseClient
            .from("attendees")
            .select("*")
            .eq("id", payment.metadata.attendeeId)
            .single();
        
        if (attendeeError || !attendee) {
            requestEvent.json(404, { error: "Attendee not found" });
            return;
        }
        
        // 6. Idempotency check - Don't reprocess
        if (attendee.payment_status === "confirmed" && payment.status === "paid") {
            requestEvent.json(200, { message: "Already processed" });
            return;
        }
        
        // 7. UPDATE DATABASE BASED ON PAYMENT STATUS
        const updateData: any = {
            payment_id: payment.id,
        };
        
        // *** KEY LOGIC: Payment Status Transitions ***
        
        if (payment.status === "paid") {
            // PAYMENT SUCCESSFUL
            updateData.payment_status = "confirmed";    // ← KEY: Update to "confirmed"
            updateData.paid_at = new Date().toISOString();
            
            // Update attendee in database
            const { error: updateError } = await supabaseClient
                .from("attendees")
                .update(updateData)
                .eq("id", attendee.id);
            
            if (updateError) {
                requestEvent.json(500, { error: "Failed to update payment status" });
                return;
            }
            
            // 8. SEND CONFIRMATION EMAIL
            // Fetch event details for confirmation email template
            const [event] = await sanityClient.fetch(
                `*[_type == "event" && slug.current == "${attendee.event_slug}"]{confirmationMailSubject, confirmationMailBody}`
            );
            
            if (event?.confirmationMailSubject && event?.confirmationMailBody) {
                // Send confirmation emails via Resend service
                await sendConfirmationEmails(
                    attendee,
                    {
                        subject: event.confirmationMailSubject,
                        body: event.confirmationMailBody,
                    },
                    requestEvent.env.get("RESEND_API_KEY")!
                );
            }
        } 
        else if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
            // PAYMENT FAILED
            updateData.payment_status = "failed";       // ← KEY: Update to "failed"
            
            // Update attendee in database
            await supabaseClient
                .from("attendees")
                .update(updateData)
                .eq("id", attendee.id);
        }
        
        requestEvent.json(200, { message: "Webhook processed successfully" });
        
    } catch (error) {
        console.error("Webhook error:", error);
        requestEvent.json(500, { error: "Internal server error" });
    }
};
```

### Webhook Verification
**File**: `/home/dyte/source/machh/MachH/src/services/mollie.ts`

```typescript
export function verifyWebhookRequest(paymentId: string | undefined): boolean {
    return !!(paymentId && paymentId.startsWith('tr_'));
}
```

**Note**: This is a basic check. Mollie recommends verifying webhook signatures for production.

---

## 4. Database Schema

**File**: `/home/dyte/source/machh/MachH/supabase/migrations/20250623202016_add_payment_columns.sql`

### Attendees Table Structure:

```sql
ALTER TABLE attendees 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'confirmed',
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Enum-like constraint
ALTER TABLE attendees 
ADD CONSTRAINT payment_status_check 
CHECK (payment_status IN ('pending_payment', 'confirmed', 'failed'));

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_attendees_payment_id ON attendees(payment_id);
```

### Payment Status States:

| Status | Meaning | When Set | Auto-confirm? |
|--------|---------|----------|---------------|
| `pending_payment` | Awaiting payment | When attendee created for paid event | No |
| `confirmed` | Payment successful OR free event | Webhook updates OR free event signup | Yes |
| `failed` | Payment failed/canceled/expired | Webhook updates | No |

### Attendee Record Schema (TypeScript):
```typescript
export interface Attendee {
    id: number,
    subscribedAt: Date,
    firstName: string,
    lastName: string,
    email: string,
    eventSlug: string,
    paymentStatus?: 'pending_payment' | 'confirmed' | 'failed',
    paymentId?: string,              // Mollie payment ID (e.g., "tr_...")
    paidAt?: Date,                   // When payment confirmed
}
```

---

## 5. Payment Status Checking

**File**: `/home/dyte/source/machh/MachH/src/routes/payment/status/index.tsx`

### Routes & Parameters:

```
GET /payment/status?p={paymentId}        (via Mollie redirect)
GET /payment/status?attendeeId={id}      (from subscription form)
```

### Status Check Flow:

```typescript
export const usePaymentStatus = routeLoader$(async (requestEvent) => {
    // 1. Get payment ID or attendee ID from query params
    const paymentId = requestEvent.query.get("p");
    const attendeeId = requestEvent.query.get("attendeeId");
    
    // 2. Fetch payment details from Mollie
    const payment = await getMolliePayment(actualPaymentId, publicAppUrl);
    
    // 3. Fetch attendee details from Supabase
    const { data: attendeeData } = await supabaseClient
        .from("attendees")
        .select("*")
        .eq("id", attendeeId)
        .single();
    
    return { 
        success: true, 
        payment: paymentData,        // Mollie payment status
        attendee: attendeeData,      // Database status
        eventSlug: attendee.event_slug 
    };
});

// Client-side polling for pending status
useVisibleTask$(({ cleanup }) => {
    if (result.value.success && result.value.payment?.status === "pending") {
        // Poll every 5 seconds for up to 2 minutes
        const intervalId = window.setInterval(async () => {
            const updatedStatus = await checkPaymentStatus(paymentId, attendeeId);
            result.value = updatedStatus;
            
            // Stop polling when payment is no longer pending
            if (updatedStatus.success && updatedStatus.payment?.status !== "pending") {
                window.clearInterval(intervalId);
            }
        }, 5000);
    }
});
```

### UI States Displayed:

1. **Paid** (`status === "paid"`):
   - Green checkmark
   - "Bedankt voor je inschrijving!"
   - Confirmation email notification

2. **Pending** (`status === "pending"`):
   - Yellow clock icon
   - "Betaling wordt verwerkt"
   - Client polls every 5 seconds
   - Max 24 polls (2 minutes)

3. **Failed/Canceled/Expired**:
   - Red X icon
   - "Betaling mislukt"
   - Error message

---

## 6. Email Confirmation

**File**: `/home/dyte/source/machh/MachH/src/util/mail.ts`

### Sent When:
1. Payment confirmed (webhook)
2. Free event subscription

### Email Structure:

```typescript
export const sendConfirmationEmails = server$(
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
        // 1. Send internal notification email
        await resend.emails.send({
            from: "Mach-H <inschrijvingen@transactional.mach-h.be>",
            replyTo: "inschrijvingen@mach-h.be",
            to: "inschrijvingen@mach-h.be",
            subject: `Nieuwe inschrijving voor ${data.event_slug}`,
            html: `<div><p>Nieuwe inschrijving van ${data.first_name} ${data.last_name} (${data.email})!</p></div>`,
        });
        
        // 2. Send subscriber confirmation email
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
```

---

## 7. Environment Configuration

**File**: `/home/dyte/source/machh/MachH/.env.local.example`

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Email
RESEND_API_KEY=your_resend_api_key

# Mollie Payment
MOLLIE_API_KEY=your_mollie_api_key
PUBLIC_APP_URL=https://your-app-domain.com
MOLLIE_WEBHOOK_URL=https://your-app-domain.com/webhook/mollie
```

---

## 8. Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SUBSCRIPTION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. USER SUBSCRIBES
   └→ SubscriptionForm submitted
      └→ useSubscribe() action triggered

2. ATTENDEE CREATION
   └→ Insert into "attendees" table
      └→ payment_status = "pending_payment"
      └→ payment_id = NULL (initially)

3. PAYMENT CREATION (Paid Events Only)
   └→ POST /api/mollie/create-payment
      └→ Call Mollie API v2
      └→ Returns: payment ID (tr_...), checkout URL

4. UPDATE ATTENDEE
   └→ Set payment_id = tr_...

5. REDIRECT USER
   └→ Send to Mollie checkout URL
   └→ User completes payment or cancels

6. MOLLIE POSTS TO WEBHOOK
   └→ POST /webhook/mollie
      └→ Includes: id = tr_...

7. WEBHOOK PROCESSES
   └→ Fetch payment from Mollie API
   └→ Fetch attendee from Supabase
   └→ Check payment.status

   IF payment.status === "paid":
      └→ Update attendee: payment_status = "confirmed"
      └→ Set paid_at = now()
      └→ Send confirmation emails

   IF payment.status === "failed|canceled|expired":
      └→ Update attendee: payment_status = "failed"

8. USER REDIRECTED
   └→ Browser navigated to /payment/status?attendeeId={id}
   └→ Page polls for status updates every 5 seconds
   └→ Shows confirmation when status changes

9. CONFIRMATION EMAIL SENT (via Resend)
   └→ Internal notification to inschrijvingen@mach-h.be
   └→ Confirmation email to subscriber
```

---

## 9. Key Code Files Summary

| File | Purpose | Key Functions |
|------|---------|---------------|
| `src/routes/event/[slug]/index.tsx` | Event page & subscription | `useSubscribe()` - initiates payment flow |
| `src/routes/api/mollie/create-payment/index.ts` | Mollie API integration | Creates payment with Mollie |
| `src/routes/api/mollie/get-payment/index.ts` | Payment status retrieval | Fetches payment status from Mollie |
| `src/routes/webhook/mollie/index.tsx` | Webhook handler | Processes Mollie callbacks |
| `src/routes/payment/status/index.tsx` | Status page & polling | Displays payment status with client polling |
| `src/services/mollie.ts` | Service layer | Client-side API wrappers & verification |
| `src/util/mail.ts` | Email service | Sends confirmation emails via Resend |
| `supabase/migrations/20250623202016_add_payment_columns.sql` | Database schema | Payment-related table structure |
| `src/contract.ts` | Type definitions | `Attendee`, `Event` interfaces |

---

## 10. Error Handling

### Payment Creation Errors:
- Missing MOLLIE_API_KEY → 500 with "Server configuration error"
- Invalid request body → 400 with "Missing required fields"
- Mollie API error → Logs error, returns 500

### Webhook Errors:
- Invalid payment ID format → 400 "Invalid payment ID"
- Attendee not found → 404 "Attendee not found"
- Database update fails → 500 "Failed to update payment status"
- Webhook already processed → 200 "Already processed" (idempotent)

### Status Page Errors:
- No payment ID/attendee ID → Error message
- Payment not found → Error message
- Polling times out → Stops after 2 minutes

---

## 11. Important Notes

1. **Webhook Signature Verification**: The current implementation only checks if payment ID starts with "tr_". Production should verify webhook signatures using Mollie's key.

2. **Idempotency**: Webhook handler checks if payment already processed to prevent duplicate confirmations.

3. **Email Timing**: Confirmation emails are sent after database update confirms success.

4. **Client Polling**: Status page polls every 5 seconds for up to 2 minutes, allowing time for webhook processing.

5. **Free Events**: Automatically set to "confirmed" at subscription time, bypassing payment flow.

6. **Database Indexes**: `idx_attendees_payment_id` speeds up webhook lookups.

---

## 12. API Integration Points

### Mollie API Calls:

1. **Create Payment**:
   ```
   POST https://api.mollie.com/v2/payments
   Header: Authorization: Bearer {MOLLIE_API_KEY}
   ```

2. **Get Payment Status**:
   ```
   GET https://api.mollie.com/v2/payments/{paymentId}
   Header: Authorization: Bearer {MOLLIE_API_KEY}
   ```

### Webhook Callback from Mollie:

```
POST /webhook/mollie
Body: { id: "tr_..." }
```

Mollie sends webhook when payment status changes.

---

## 13. Data Flow Summary

### Successful Payment Path:
```
Form Submit → Create Attendee (pending_payment) → Create Mollie Payment 
→ Update Attendee with payment_id → Redirect to Mollie → User Pays 
→ Mollie webhook → Fetch Payment → Update to "confirmed" → Send Email 
→ User sees success on status page
```

### Free Event Path:
```
Form Submit → Create Attendee (confirmed) → Send Email immediately 
→ Show success message
```

### Failed Payment Path:
```
User cancels or payment fails → Mollie webhook 
→ Update to "failed" → User sees error message
```

