-- Nexart — Storage Buckets + RLS Policies
-- Coller dans : Supabase Dashboard > SQL Editor > New query

-- ─── Buckets ──────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 Mo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  ),
  (
    'portfolios',
    'portfolios',
    true,
    10485760, -- 10 Mo par image
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  ),
  (
    'insurance-docs',
    'insurance-docs',
    false,
    10485760, -- 10 Mo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
ON CONFLICT (id) DO NOTHING;

-- ─── RLS — avatars (public read, owner write) ─────────────────────────────────

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── RLS — portfolios (public read, owner write) ──────────────────────────────

CREATE POLICY "portfolios_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolios');

CREATE POLICY "portfolios_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolios'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "portfolios_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolios'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "portfolios_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolios'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── RLS — insurance-docs (privé, owner uniquement) ──────────────────────────

CREATE POLICY "insurance_owner_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'insurance-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "insurance_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'insurance-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "insurance_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'insurance-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "insurance_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'insurance-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
