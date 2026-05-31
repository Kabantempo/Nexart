-- Nexart - Schema complet Supabase
-- Coller dans : Supabase Dashboard > SQL Editor > New query

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('creator', 'organizer');
CREATE TYPE travel_radius AS ENUM ('5', '10', '25', 'national');
CREATE TYPE event_type AS ENUM ('permanent', 'seasonal', 'popup', 'salon', 'fair');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'refused');
CREATE TYPE reviewer_role AS ENUM ('creator', 'organizer');

-- TABLES

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role        user_role NOT NULL,
  full_name   text NOT NULL,
  avatar_url  text,
  bio         text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE creator_profiles (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  disciplines         text[] NOT NULL DEFAULT '{}',
  city                text,
  region              text,
  department          text,
  travel_radius       travel_radius NOT NULL DEFAULT '25',
  portfolio_images    text[] NOT NULL DEFAULT '{}',
  website             text,
  instagram           text,
  etsy                text,
  siret_verified      bool NOT NULL DEFAULT false,
  insurance_verified  bool NOT NULL DEFAULT false,
  availability        jsonb NOT NULL DEFAULT '{"weekends": false, "custom": []}'
);

CREATE TABLE organizer_profiles (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name   text NOT NULL,
  website             text,
  instagram           text
);

CREATE TABLE events (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             text NOT NULL,
  description       text,
  event_type        event_type NOT NULL DEFAULT 'popup',
  theme             text[] NOT NULL DEFAULT '{}',
  location          text,
  city              text,
  region            text,
  department        text,
  lat               float,
  lng               float,
  start_date        date NOT NULL,
  end_date          date NOT NULL,
  start_time        time,
  end_time          time,
  stand_count       int NOT NULL DEFAULT 0,
  stand_price       numeric(10,2),
  stand_dimensions  text,
  discipline_tags   text[] NOT NULL DEFAULT '{}',
  cover_image       text,
  media             text[] NOT NULL DEFAULT '{}',
  rules             text,
  stripe_enabled    bool NOT NULL DEFAULT false,
  status            event_status NOT NULL DEFAULT 'draft',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE applications (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id          uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  creator_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message           text,
  status            application_status NOT NULL DEFAULT 'pending',
  stripe_payment_id text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, creator_id)
);

CREATE TABLE conversations (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  creator_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organizer_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, creator_id)
);

CREATE TABLE messages (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content           text NOT NULL,
  read_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reviewer_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_role   reviewer_role NOT NULL,
  rating          int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         text CHECK (char_length(comment) <= 100),
  tags            text[] NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, reviewer_id)
);

-- TRIGGERS

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'creator')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- INDEXES

CREATE INDEX idx_events_organizer     ON events(organizer_id);
CREATE INDEX idx_events_status        ON events(status);
CREATE INDEX idx_events_start_date    ON events(start_date);
CREATE INDEX idx_events_region        ON events(region);
CREATE INDEX idx_events_discipline    ON events USING GIN(discipline_tags);
CREATE INDEX idx_applications_event   ON applications(event_id);
CREATE INDEX idx_applications_creator ON applications(creator_id);
CREATE INDEX idx_applications_status  ON applications(status);
CREATE INDEX idx_messages_conv        ON messages(conversation_id, created_at);
CREATE INDEX idx_conversations_creator   ON conversations(creator_id);
CREATE INDEX idx_conversations_organizer ON conversations(organizer_id);
CREATE INDEX idx_reviews_reviewed     ON reviews(reviewed_id);

-- ROW LEVEL SECURITY

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "creator_profiles_select" ON creator_profiles FOR SELECT USING (true);
CREATE POLICY "creator_profiles_insert" ON creator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "creator_profiles_update" ON creator_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "organizer_profiles_select" ON organizer_profiles FOR SELECT USING (true);
CREATE POLICY "organizer_profiles_insert" ON organizer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "organizer_profiles_update" ON organizer_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "events_select_published" ON events FOR SELECT
  USING (status = 'published' OR auth.uid() = organizer_id);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "events_update" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "events_delete" ON events FOR DELETE USING (auth.uid() = organizer_id);

CREATE POLICY "applications_select_creator" ON applications FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "applications_select_organizer" ON applications FOR SELECT
  USING (auth.uid() IN (SELECT organizer_id FROM events WHERE id = applications.event_id));
CREATE POLICY "applications_insert" ON applications FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "applications_update_organizer" ON applications FOR UPDATE
  USING (auth.uid() IN (SELECT organizer_id FROM events WHERE id = applications.event_id));

CREATE POLICY "conversations_select" ON conversations FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = organizer_id);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (auth.uid() IN (
    SELECT creator_id FROM conversations WHERE id = messages.conversation_id
    UNION
    SELECT organizer_id FROM conversations WHERE id = messages.conversation_id
  ));
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND auth.uid() IN (
    SELECT creator_id FROM conversations WHERE id = messages.conversation_id
    UNION
    SELECT organizer_id FROM conversations WHERE id = messages.conversation_id
  ));

CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- STORAGE

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',     'avatars',     true),
  ('portfolios',  'portfolios',  true),
  ('event-media', 'event-media', true);

CREATE POLICY "avatars_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "portfolios_select" ON storage.objects FOR SELECT USING (bucket_id = 'portfolios');
CREATE POLICY "portfolios_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "portfolios_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "event_media_select" ON storage.objects FOR SELECT USING (bucket_id = 'event-media');
CREATE POLICY "event_media_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "event_media_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'event-media' AND auth.uid()::text = (storage.foldername(name))[1]);
