-- Add payment-related columns to attendees table
ALTER TABLE attendees 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'confirmed',
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add check constraint for payment_status values
ALTER TABLE attendees 
ADD CONSTRAINT payment_status_check 
CHECK (payment_status IN ('pending_payment', 'confirmed', 'failed'));

-- Create index on payment_id for faster lookups from webhooks
CREATE INDEX IF NOT EXISTS idx_attendees_payment_id ON attendees(payment_id);

-- Add comment to explain the columns
COMMENT ON COLUMN attendees.payment_status IS 'Payment status: pending_payment, confirmed, or failed';
COMMENT ON COLUMN attendees.payment_id IS 'Mollie payment ID reference';
COMMENT ON COLUMN attendees.paid_at IS 'Timestamp when payment was confirmed';