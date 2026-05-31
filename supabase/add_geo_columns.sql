-- Run in Supabase SQL Editor
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS lat float;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS lng float;
