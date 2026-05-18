# Payment Status Quick Reference

## Payment Status Lifecycle

```
PENDING_PAYMENT → CONFIRMED (or FAILED)
      ↓              ↑
  Initial state   Success or
  (Paid events)   Free event
```

## Status Values

| Value | Database | Mollie | Meaning | Email Sent |
|-------|----------|--------|---------|-----------|
| `pending_payment` | Yes | N/A | Awaiting payment | No |
| `confirmed` | Yes | (paid) | Payment done or free event | Yes |
| `failed` | Yes | (failed/canceled/expired) | Payment issue | No |

## When Status Changes

### To "pending_payment"
- Location: `src/routes/event/[slug]/index.tsx` line 62
- Trigger: User subscribes to PAID event
- Action: `insert { payment_status: 'pending_payment' }`

### To "confirmed"
**Location 1**: Free event signup
- File: `src/routes/event/[slug]/index.tsx` line 62
- Action: `insert { payment_status: 'confirmed' }`
- Email: Sent immediately

**Location 2**: Webhook receives "paid" status
- File: `src/routes/webhook/mollie/index.tsx` lines 67-96
- Trigger: Mollie webhook with `payment.status === "paid"`
- Action: `update { payment_status: 'confirmed', paid_at: now() }`
- Email: Sent after update

### To "failed"
- Location: `src/routes/webhook/mollie/index.tsx` lines 98-106
- Trigger: Mollie webhook with failed/canceled/expired status
- Action: `update { payment_status: 'failed' }`
- Email: Not sent

## Webhook Handler Logic

File: `/home/dyte/source/machh/MachH/src/routes/webhook/mollie/index.tsx`

```javascript
if (payment.status === "paid") {
    updateData.payment_status = "confirmed";
    updateData.paid_at = new Date().toISOString();
    // Send confirmation emails
} else if (["failed", "canceled", "expired"].includes(payment.status)) {
    updateData.payment_status = "failed";
    // No email sent
}
```

## Key Files for Status Management

| File | Line(s) | Action |
|------|---------|--------|
| `src/routes/event/[slug]/index.tsx` | 62 | Create attendee with initial status |
| `src/routes/api/mollie/create-payment/index.ts` | 65-72 | Create Mollie payment |
| `src/routes/webhook/mollie/index.tsx` | 67-106 | Update status from webhook |
| `src/routes/payment/status/index.tsx` | 206-226 | Poll for status changes |
| `src/util/mail.ts` | 4-24 | Send confirmation emails |

## Environment Variables

```
MOLLIE_API_KEY          # Mollie API key
PUBLIC_APP_URL          # App domain
MOLLIE_WEBHOOK_URL      # Webhook endpoint (optional, defaults to /webhook/mollie)
SUPABASE_URL            # Database
SUPABASE_ANON_KEY       # Database access
RESEND_API_KEY          # Email service
```

## Common Issues & Solutions

### Issue: Webhook not received
- Check `MOLLIE_WEBHOOK_URL` is correct
- Verify webhook is accessible from internet
- Check firewall rules

### Issue: Status stays "pending_payment"
- Webhook not received - check above
- Payment not actually paid in Mollie
- Database update failed - check logs

### Issue: Confirmation email not sent
- Payment status must be "confirmed" for webhook handler to send
- Resend API key might be invalid
- Email content is from Sanity CMS

### Issue: Attendee not found in webhook
- metadata.attendeeId missing from payment
- Attendee deleted from database
- Wrong database connected

## Database Schema

```sql
attendees table:
- payment_status: text (pending_payment | confirmed | failed)
- payment_id: text (Mollie ID like "tr_...")
- paid_at: timestamptz (when confirmed)

Index: idx_attendees_payment_id (speeds webhook lookups)
```

## Testing Payment Flow

### Free Event (No Payment)
1. Subscribe to free event
2. Status set to "confirmed" immediately
3. Confirmation email sent
4. No Mollie involvement

### Paid Event (Full Flow)
1. Subscribe to paid event
2. Status set to "pending_payment"
3. Redirect to Mollie checkout
4. User completes payment
5. Mollie sends webhook
6. Status updated to "confirmed"
7. Confirmation email sent
8. Status page shows success

### Paid Event (Payment Fails)
1. Subscribe to paid event
2. Redirect to Mollie checkout
3. User cancels or payment fails
4. Mollie sends webhook
5. Status updated to "failed"
6. No email sent

## Polling Behavior

File: `src/routes/payment/status/index.tsx` lines 206-226

- Polls every 5 seconds
- Max 24 polls = 2 minutes
- Stops when status changes from "pending"
- User sees real-time updates

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/mollie/create-payment` | POST | Create Mollie payment |
| `/api/mollie/get-payment` | POST | Get payment status from Mollie |
| `/webhook/mollie` | POST | Receive Mollie webhooks |
| `/payment/status` | GET | Display status page |

## Mollie Payment States

From Mollie API:
- `open` - User hasn't completed payment
- `pending` - Payment pending completion
- `paid` - Payment successful
- `failed` - Payment failed
- `canceled` - User canceled
- `expired` - Payment expired

We handle these as:
- `open/pending` → Show "Betaling wordt verwerkt" with polling
- `paid` → Update to "confirmed", send email
- `failed/canceled/expired` → Update to "failed"
