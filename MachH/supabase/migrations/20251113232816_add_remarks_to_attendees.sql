-- Add remarks column to attendees table
ALTER TABLE attendees
ADD COLUMN IF NOT EXISTS remarks text;

-- Add comment to explain the column
COMMENT ON COLUMN attendees.remarks IS 'Optional remarks/comments from the attendee during subscription';