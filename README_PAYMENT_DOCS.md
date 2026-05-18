# Mollie Payment Integration Documentation

This directory contains comprehensive documentation about the Mollie payment integration in the MachH event management system.

## Quick Start

Start with one of these files based on your needs:

### For Quick Overview
- **PAYMENT_INTEGRATION_SUMMARY.txt** - Executive summary with key facts and quick reference

### For Implementation Details
- **MOLLIE_PAYMENT_INTEGRATION.md** - Complete technical documentation with code explanations

### For Quick Lookup
- **PAYMENT_STATUS_QUICK_REFERENCE.md** - Payment status lifecycle and common issues

### For File References
- **PAYMENT_FILES_INDEX.md** - Complete index of all payment-related files with line numbers

### For Visual Understanding
- **PAYMENT_FLOW_DIAGRAMS.txt** - ASCII diagrams showing payment flows

---

## Documentation Files Overview

### 1. MOLLIE_PAYMENT_INTEGRATION.md (22 KB)
**Purpose**: Comprehensive technical reference

**Contains**:
- Mollie payment initialization flow
- API routes (create-payment, get-payment)
- Webhook handler logic (core business logic)
- Database schema details
- Payment status checking mechanism
- Email confirmation system
- Environment configuration
- Complete payment flow diagram
- Key file summary
- Error handling
- Important notes
- API integration points
- Data flow summary

**Best for**: Deep understanding of how the system works

---

### 2. PAYMENT_STATUS_QUICK_REFERENCE.md (5 KB)
**Purpose**: Quick lookup guide

**Contains**:
- Payment status lifecycle diagram
- Status values table
- When status changes (all locations)
- Webhook handler logic
- Key files for status management
- Environment variables
- Common issues and solutions
- Database schema
- Testing payment flow scenarios
- Polling behavior
- API endpoints
- Mollie payment states

**Best for**: Quick answers and troubleshooting

---

### 3. PAYMENT_FILES_INDEX.md (7.3 KB)
**Purpose**: Complete file index with line references

**Contains**:
- Core payment files with descriptions
- Database & schema files
- Configuration files
- CMS integration details
- Complete payment flow code references (steps 1-13)
- Error handling details
- Testing & debugging
- Related documentation

**Best for**: Finding specific code and understanding implementation details

---

### 4. PAYMENT_INTEGRATION_SUMMARY.txt (11 KB)
**Purpose**: Executive overview

**Contains**:
- Key findings
- Core components overview
- Database schema
- Three payment flow scenarios
- File locations (absolute paths)
- Environment variables
- API endpoints
- Error handling
- Security considerations
- Testing checklist
- Monitoring & debugging
- Key statistics

**Best for**: Getting oriented and understanding the big picture

---

### 5. PAYMENT_FLOW_DIAGRAMS.txt (24 KB)
**Purpose**: Visual flow diagrams

**Contains**:
1. Overall payment status lifecycle diagram
2. Paid event complete flow (happy path) - 13 steps
3. Webhook handler decision tree
4. Client-side polling flow
5. Database status flow
6. API call sequence diagram

**Best for**: Understanding the flow visually

---

## File Structure

```
/home/dyte/source/machh/MachH/
├── src/
│   ├── routes/
│   │   ├── event/[slug]/index.tsx          # Subscription form & action
│   │   ├── api/mollie/
│   │   │   ├── create-payment/index.ts     # Create Mollie payment
│   │   │   └── get-payment/index.ts        # Get payment status
│   │   ├── webhook/mollie/index.tsx        # Webhook handler
│   │   └── payment/status/index.tsx        # Status page
│   ├── services/mollie.ts                  # Service layer
│   ├── util/mail.ts                        # Email service
│   ├── components/
│   │   └── SubscriptionForm/
│   │       └── SubscriptionForm.tsx        # Form UI
│   ├── contract.ts                         # Type definitions
│   └── cms/sanityClient.ts                 # CMS integration
├── supabase/
│   └── migrations/
│       └── 20250623202016_add_payment_columns.sql  # DB schema
└── .env.local.example                      # Environment variables
```

## Quick Answers

### "Where do I find X?"

- **Subscription form submission**: `src/routes/event/[slug]/index.tsx` line 39 (`useSubscribe()`)
- **Attendee creation**: `src/routes/event/[slug]/index.tsx` line 56-65
- **Mollie payment creation**: `src/routes/api/mollie/create-payment/index.ts`
- **Payment status updates**: `src/routes/webhook/mollie/index.tsx` line 67-106
- **Email sending**: `src/util/mail.ts` line 4-24
- **Status page**: `src/routes/payment/status/index.tsx`
- **Database schema**: `supabase/migrations/20250623202016_add_payment_columns.sql`

### "How do payments work?"

1. User subscribes to event
2. If paid: attendee created with `payment_status="pending_payment"`
3. Mollie payment created and user redirected to checkout
4. After payment, Mollie sends webhook
5. Webhook updates `payment_status="confirmed"` and sends email
6. User sees success on status page

See PAYMENT_FLOW_DIAGRAMS.txt for detailed flow diagrams.

### "What are the payment statuses?"

- `pending_payment` - Awaiting payment
- `confirmed` - Payment successful or free event
- `failed` - Payment failed/canceled/expired

See PAYMENT_STATUS_QUICK_REFERENCE.md for complete details.

### "How do I debug a payment issue?"

See PAYMENT_STATUS_QUICK_REFERENCE.md section "Common Issues & Solutions"

## Key Statistics

- **8 core payment files** across the codebase
- **3 payment API routes** (/api/mollie/create-payment, /api/mollie/get-payment, /webhook/mollie)
- **3 payment statuses** (pending_payment, confirmed, failed)
- **2 polling intervals** (5 seconds, max 2 minutes)
- **2 email types** sent (internal notification, subscriber confirmation)
- **100% code coverage** of payment flow in documentation

## Related Files

All documentation files are located in `/home/dyte/source/machh/`:

```
/home/dyte/source/machh/
├── MOLLIE_PAYMENT_INTEGRATION.md           # This directory
├── PAYMENT_STATUS_QUICK_REFERENCE.md
├── PAYMENT_FILES_INDEX.md
├── PAYMENT_INTEGRATION_SUMMARY.txt
├── PAYMENT_FLOW_DIAGRAMS.txt
└── README_PAYMENT_DOCS.md                  # This file
```

## Recommendations

1. **Start here**: PAYMENT_INTEGRATION_SUMMARY.txt for overview
2. **Then read**: PAYMENT_STATUS_QUICK_REFERENCE.md for key concepts
3. **When coding**: Use PAYMENT_FILES_INDEX.md and MOLLIE_PAYMENT_INTEGRATION.md for references
4. **For understanding**: View PAYMENT_FLOW_DIAGRAMS.txt

## Contact

For questions about specific parts:
- Payment flow logic: See MOLLIE_PAYMENT_INTEGRATION.md section 3
- Status lifecycle: See PAYMENT_STATUS_QUICK_REFERENCE.md
- File locations: See PAYMENT_FILES_INDEX.md
- Implementation details: See MOLLIE_PAYMENT_INTEGRATION.md sections 1, 2, 4, 5
- Visual flows: See PAYMENT_FLOW_DIAGRAMS.txt

---

Last updated: 2025-11-13
Documentation generated by Claude Code Analysis
