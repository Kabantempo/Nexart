-- Run in Supabase SQL Editor

-- 1. Add visitor role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'visitor';

-- 2. Visitor inquiries (1 message per visitor-creator pair, editable until replied)
CREATE TABLE visitor_inquiries (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message      text NOT NULL,
  reply        text,
  replied_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(visitor_id, creator_id)
);

ALTER TABLE visitor_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vi_select" ON visitor_inquiries FOR SELECT
  USING (auth.uid() = visitor_id OR auth.uid() = creator_id);
CREATE POLICY "vi_insert" ON visitor_inquiries FOR INSERT
  WITH CHECK (auth.uid() = visitor_id);
CREATE POLICY "vi_update_visitor" ON visitor_inquiries FOR UPDATE
  USING (auth.uid() = visitor_id AND reply IS NULL);
CREATE POLICY "vi_update_creator" ON visitor_inquiries FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE INDEX idx_vi_visitor  ON visitor_inquiries(visitor_id);
CREATE INDEX idx_vi_creator  ON visitor_inquiries(creator_id);

-- Trigger updated_at
CREATE TRIGGER vi_updated_at
  BEFORE UPDATE ON visitor_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Favorites
CREATE TABLE favorite_events (
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id   uuid REFERENCES events(id)   ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);
ALTER TABLE favorite_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fev_all" ON favorite_events USING (auth.uid() = user_id);
CREATE POLICY "fev_insert" ON favorite_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fev_delete" ON favorite_events FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE favorite_creators (
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, creator_id)
);
ALTER TABLE favorite_creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fcr_all"    ON favorite_creators USING (auth.uid() = user_id);
CREATE POLICY "fcr_insert" ON favorite_creators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fcr_delete" ON favorite_creators FOR DELETE USING (auth.uid() = user_id);
