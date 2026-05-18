# Mollie Payment Integration - File Index

## Core Payment Files

### Payment Initialization & Subscription
- **File**: `/home/dyte/source/machh/MachH/src/routes/event/[slug]/index.tsx`
- **Key Functions**: `useSubscribe()`, `useRouteInfo()`
- **Responsibility**: Handles event page, subscription form, creates attendee with `pending_payment` status, initiates Mollie payment creation
- **Lines of Interest**: 39-152 (useSubscribe action), 62 (pending_payment status), 77-114 (payment flow)

### Mollie Payment Creation API
- **File**: `/home/dyte/source/machh/MachH/src/routes/api/mollie/create-payment/index.ts`
- **Endpoint**: POST `/api/mollie/create-payment`
- **Responsibility**: Creates payment in Mollie system via API, returns payment ID and checkout URL
- **Key Details**: Calls `https://api.mollie.com/v2/payments`, handles currency conversion to EUR

### Mollie Payment Status Retrieval
- **File**: `/home/dyte/source/machh/MachH/src/routes/api/mollie/get-payment/index.ts`
- **Endpoint**: POST `/api/mollie/get-payment`
- **Responsibility**: Fetches current payment status from Mollie API
- **Used By**: Payment status page, webhook handler

### Mollie Webhook Handler
- **File**: `/home/dyte/source/machh/MachH/src/routes/webhook/mollie/index.tsx`
- **Endpoint**: POST `/webhook/mollie`
- **Responsibility**: Processes Mollie callbacks, updates database status, sends confirmation emails
- **Key Logic**:
  - Line 57: Idempotency check
  - Lines 67-96: Handle payment success (status = "confirmed")
  - Lines 98-106: Handle payment failure (status = "failed")

### Payment Status Page
- **File**: `/home/dyte/source/machh/MachH/src/routes/payment/status/index.tsx`
- **Endpoint**: GET `/payment/status?attendeeId={id}` or `/payment/status?p={paymentId}`
- **Responsibility**: Displays payment status, handles client-side polling, shows UI based on status
- **Key Features**:
  - `usePaymentStatus()` route loader (server-side)
  - `checkPaymentStatus()` server function (client calls)
  - Client polling: every 5 seconds, max 24 polls (2 minutes)

### Mollie Service Layer
- **File**: `/home/dyte/source/machh/MachH/src/services/mollie.ts`
- **Exports**:
  - `createMolliePayment()` - Client wrapper for payment creation
  - `getMolliePayment()` - Client wrapper for status retrieval
  - `verifyWebhookRequest()` - Basic payment ID validation
- **Responsibility**: Client-side abstractions and utilities

### Email Service
- **File**: `/home/dyte/source/machh/MachH/src/util/mail.ts`
- **Export**: `sendConfirmationEmails()`
- **Responsibility**: Sends confirmation emails via Resend service
- **Called From**: Webhook handler (paid) and subscription action (free events)

### Subscription Form Component
- **File**: `/home/dyte/source/machh/MachH/src/components/SubscriptionForm/SubscriptionForm.tsx`
- **Responsibility**: Renders subscription form UI, handles form submission
- **Features**: Math CAPTCHA, form validation, redirect to Mollie on success

## Database & Schema

### Migration File
- **File**: `/home/dyte/source/machh/MachH/supabase/migrations/20250623202016_add_payment_columns.sql`
- **Responsibility**: Defines payment-related database columns and constraints
- **Schema**:
  - `payment_status` (text): pending_payment | confirmed | failed
  - `payment_id` (text): Mollie ID reference
  - `paid_at` (timestamptz): Timestamp of confirmation
- **Index**: `idx_attendees_payment_id` for webhook lookups

### Type Definitions
- **File**: `/home/dyte/source/machh/MachH/src/contract.ts`
- **Types**:
  - `Attendee` interface (line 78-88)
  - `Event` interface with subscription fields (line 1-22)
- **Key Fields**: `paymentStatus`, `paymentId`, `paidAt`

## Configuration

### Environment Variables
- **File**: `/home/dyte/source/machh/MachH/.env.local.example`
- **Variables**:
  - `MOLLIE_API_KEY` - API authentication
  - `PUBLIC_APP_URL` - Application domain
  - `MOLLIE_WEBHOOK_URL` - Webhook endpoint (optional)
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` - Database
  - `RESEND_API_KEY` - Email service

## CMS Integration

### Sanity Client
- **File**: `/home/dyte/source/machh/MachH/src/cms/sanityClient.ts`
- **Used For**: Fetching event details, confirmation email templates
- **Data Fetched**: `subscriptionIsPaid`, `subscriptionPrice`, `confirmationMailSubject`, `confirmationMailBody`

## Complete Payment Flow Code References

### Step 1: User Subscribes
```
File: src/routes/event/[slug]/index.tsx
Lines: 53-65
Action: Form submission triggers useSubscribe()
```

### Step 2: Create Attendee
```
File: src/routes/event/[slug]/index.tsx
Lines: 56-65
Action: Insert with payment_status = 'pending_payment'
```

### Step 3: Create Payment
```
File: src/routes/event/[slug]/index.tsx
Lines: 88-103
Action: Call createMolliePayment()
```

### Step 4: Update Attendee with Payment ID
```
File: src/routes/event/[slug]/index.tsx
Lines: 105-108
Action: Set payment_id = tr_...
```

### Step 5: User Pays at Mollie
```
File: src/routes/api/mollie/create-payment/index.ts
Lines: 65-72
Result: User redirected to Mollie checkout
```

### Step 6: Mollie Sends Webhook
```
File: src/routes/webhook/mollie/index.tsx
Lines: 1-20
Receipt: POST /webhook/mollie with payment ID
```

### Step 7: Fetch Payment Details
```
File: src/routes/webhook/mollie/index.tsx
Lines: 28-30
Action: GET from Mollie API
```

### Step 8: Fetch Attendee
```
File: src/routes/webhook/mollie/index.tsx
Lines: 44-54
Action: SELECT from Supabase
```

### Step 9: Check Idempotency
```
File: src/routes/webhook/mollie/index.tsx
Lines: 56-60
Action: Prevent duplicate processing
```

### Step 10: Update Status
```
File: src/routes/webhook/mollie/index.tsx
Lines: 67-106
Action: UPDATE payment_status = 'confirmed' or 'failed'
```

### Step 11: Send Confirmation Email
```
File: src/routes/webhook/mollie/index.tsx
Lines: 82-97
Action: sendConfirmationEmails()
File: src/util/mail.ts
Lines: 4-24
```

### Step 12: User Checks Status
```
File: src/routes/payment/status/index.tsx
Lines: 6-99
Action: usePaymentStatus() loader fetches data
```

### Step 13: Client Polling
```
File: src/routes/payment/status/index.tsx
Lines: 199-232
Action: Poll every 5 seconds for status changes
```

## Error Handling

### Payment Creation Errors
- **File**: `src/routes/api/mollie/create-payment/index.ts`
- **Lines**: 74-78
- **Handling**: Log error, return 500

### Webhook Errors
- **File**: `src/routes/webhook/mollie/index.tsx`
- **Lines**: 110-113
- **Handling**: Log error, return 500

### Status Page Errors
- **File**: `src/routes/payment/status/index.tsx`
- **Lines**: 95-98, 186-190
- **Handling**: Return error state, display message

## Testing & Debugging

### Enable Console Logging
All key files have console.error() calls:
- `src/routes/event/[slug]/index.tsx` - line 129
- `src/routes/api/mollie/create-payment/index.ts` - lines 46, 76
- `src/routes/api/mollie/get-payment/index.ts` - line 67
- `src/routes/webhook/mollie/index.tsx` - line 111
- `src/routes/payment/status/index.tsx` - line 96, 188

### Mollie Test API
- Use Mollie test mode by setting MOLLIE_API_KEY to test key
- Payment IDs will still start with "tr_"
- Can test webhook delivery in Mollie dashboard

## Related Documentation

Additional files:
- `MOLLIE_PAYMENT_INTEGRATION.md` - Comprehensive analysis
- `PAYMENT_STATUS_QUICK_REFERENCE.md` - Quick reference guide
- `CLAUDE.md` - Project-level instructions
