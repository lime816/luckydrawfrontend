-- Add WhatsApp fields to contests table
-- Run this in your Supabase SQL Editor

ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_message TEXT;

-- Add comments for documentation
COMMENT ON COLUMN contests.whatsapp_number IS 'WhatsApp number for contest participation (with country code, no + or spaces)';
COMMENT ON COLUMN contests.whatsapp_message IS 'Custom welcome message for WhatsApp link';
