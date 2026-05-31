-- Run this in Supabase SQL Editor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;
