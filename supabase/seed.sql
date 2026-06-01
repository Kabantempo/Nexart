-- ============================================================
-- NEXART — Seed de démonstration
-- ============================================================
-- Usage : Supabase Dashboard › SQL Editor › New query
--         (exécuter en tant que postgres — superuser)
-- Mot de passe de tous les comptes démo : Demo1234!
--
-- Comptes créés :
--   sophie.leroux@demo.nexart.fr   → créatrice (Tatouage, Illustration)
--   marc.dumont@demo.nexart.fr     → créateur  (Céramique, Poterie)
--   isabelle.chen@demo.nexart.fr   → créatrice (Joaillerie, Bijoux)
--   claire.moreau@demo.nexart.fr   → organisatrice (Marché Bastille)
--   thomas.blanc@demo.nexart.fr    → organisateur  (Salon Lyon)
-- ============================================================

-- ─── 0. Nettoyage idempotent ──────────────────────────────

DO $$
DECLARE
  demo_ids uuid[] := ARRAY[
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid
  ];
  demo_event_ids uuid[] := ARRAY[
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid
  ];
BEGIN
  DELETE FROM reviews        WHERE event_id = ANY(demo_event_ids);
  DELETE FROM messages       WHERE conversation_id IN (
    SELECT id FROM conversations WHERE event_id = ANY(demo_event_ids)
  );
  DELETE FROM conversations  WHERE event_id = ANY(demo_event_ids);
  DELETE FROM applications   WHERE event_id = ANY(demo_event_ids);
  DELETE FROM events         WHERE id = ANY(demo_event_ids);
  DELETE FROM creator_profiles   WHERE user_id = ANY(demo_ids);
  DELETE FROM organizer_profiles WHERE user_id = ANY(demo_ids);
  DELETE FROM profiles           WHERE id = ANY(demo_ids);
  DELETE FROM auth.users         WHERE id = ANY(demo_ids);
END $$;

-- ─── 1. Utilisateurs Auth ────────────────────────────────

INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) VALUES

-- Créateurs
('11111111-1111-1111-1111-111111111111',
 '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
 'sophie.leroux@demo.nexart.fr',
 crypt('Demo1234!', gen_salt('bf', 10)), now(),
 '{"role":"creator","full_name":"Sophie Leroux"}'::jsonb,
 now() - interval '6 months', now()),

('22222222-2222-2222-2222-222222222222',
 '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
 'marc.dumont@demo.nexart.fr',
 crypt('Demo1234!', gen_salt('bf', 10)), now(),
 '{"role":"creator","full_name":"Marc Dumont"}'::jsonb,
 now() - interval '5 months', now()),

('33333333-3333-3333-3333-333333333333',
 '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
 'isabelle.chen@demo.nexart.fr',
 crypt('Demo1234!', gen_salt('bf', 10)), now(),
 '{"role":"creator","full_name":"Isabelle Chen"}'::jsonb,
 now() - interval '4 months', now()),

-- Organisateurs
('44444444-4444-4444-4444-444444444444',
 '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
 'claire.moreau@demo.nexart.fr',
 crypt('Demo1234!', gen_salt('bf', 10)), now(),
 '{"role":"organizer","full_name":"Claire Moreau"}'::jsonb,
 now() - interval '1 year', now()),

('55555555-5555-5555-5555-555555555555',
 '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
 'thomas.blanc@demo.nexart.fr',
 crypt('Demo1234!', gen_salt('bf', 10)), now(),
 '{"role":"organizer","full_name":"Thomas Blanc"}'::jsonb,
 now() - interval '8 months', now());

-- Le trigger on_auth_user_created crée automatiquement les profils de base.
-- On les enrichit ici :

UPDATE profiles SET
  bio = 'Tatoueuse fine line & aquarelle depuis 8 ans. Je crée des œuvres délicates inspirées de la nature et du japonisme. SIRET validé, RC Pro Maif.'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE profiles SET
  bio = 'Céramiste indépendant. Je travaille la grès et la porcelaine pour créer de la vaisselle fonctionnelle et des pièces décoratives. Atelier à Montpellier.'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE profiles SET
  bio = 'Joaillière créatrice franco-taïwanaise. Bijoux en or recyclé et pierres semi-précieuses, façonnés à la main dans mon atelier parisien du 11e.'
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE profiles SET
  bio = 'Organisatrice du Marché des Créateurs Bastille depuis 2018. +50 éditions organisées, 800 artisans sélectionnés.'
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE profiles SET
  bio = 'Co-fondateur du Salon du Design & Craft de Lyon. Édition annuelle + pop-ups thématiques tout au long de l''année.'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- ─── 2. Profils Créateurs ────────────────────────────────

INSERT INTO creator_profiles
  (user_id, disciplines, city, region, department, travel_radius,
   instagram, siret_verified, insurance_verified, availability)
VALUES

('11111111-1111-1111-1111-111111111111',
 ARRAY['Tatouage', 'Illustration'],
 'Paris', 'Île-de-France', '75', 'national',
 '@sophie_leroux_tattoo', true, true,
 '{"weekends":true,"custom":[{"from":"2026-06-14","to":"2026-06-16"},{"from":"2026-07-05","to":"2026-07-07"}]}'::jsonb),

('22222222-2222-2222-2222-222222222222',
 ARRAY['Céramique', 'Poterie'],
 'Montpellier', 'Occitanie', '34', '25',
 '@marc_ceramique', true, false,
 '{"weekends":true,"custom":[]}'::jsonb),

('33333333-3333-3333-3333-333333333333',
 ARRAY['Joaillerie', 'Bijoux'],
 'Paris', 'Île-de-France', '75', '10',
 '@isabelle_chen_bijoux', true, true,
 '{"weekends":true,"custom":[{"from":"2026-06-21","to":"2026-06-22"}]}'::jsonb);

-- ─── 3. Profils Organisateurs ────────────────────────────

INSERT INTO organizer_profiles (user_id, organization_name, website, instagram)
VALUES
('44444444-4444-4444-4444-444444444444',
 'Marché des Créateurs Bastille',
 'https://marchebastille.fr', '@marchebastille'),

('55555555-5555-5555-5555-555555555555',
 'Salon du Design & Craft Lyon',
 'https://salondesignlyon.fr', '@salondesignlyon');

-- ─── 4. Événements ───────────────────────────────────────

INSERT INTO events
  (id, organizer_id, title, description, event_type, theme,
   location, city, region, department, lat, lng,
   start_date, end_date, start_time, end_time,
   stand_count, stand_price, stand_dimensions,
   discipline_tags, rules, stripe_enabled, status)
VALUES

-- [1] Marché permanent Paris (en cours — juin 2026)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '44444444-4444-4444-4444-444444444444',
 'Marché des Créateurs Bastille — Juin 2026',
 'Le marché incontournable des créateurs indépendants au cœur du 11e. Chaque week-end de juin, 35 stands soigneusement sélectionnés pour un public passionné d''artisanat authentique.',
 'permanent', ARRAY['Artisanat général','Design','Bijoux'],
 'Place de la Bastille, 75011 Paris',
 'Paris', 'Île-de-France', '75', 48.8533, 2.3692,
 '2026-06-07', '2026-06-29', '10:00', '19:00',
 35, 120.00, '2m × 2m',
 ARRAY['Tatouage','Illustration','Céramique','Bijoux','Joaillerie','Textile'],
 'Stand propre et bien présenté obligatoire. RC Pro requise. Installation dès 8h30. Commission 0%. Paiement 30j avant l''événement.',
 true, 'published'),

-- [2] Salon annuel Lyon (futur — octobre 2026)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '55555555-5555-5555-5555-555555555555',
 'Salon du Design & Craft Lyon — Automne 2026',
 '5e édition du Salon Design & Craft de Lyon. 3 jours d''exposition dans la Halle Tony Garnier. 80 exposants sélectionnés, conférences, ateliers et démonstrations live.',
 'salon', ARRAY['Design','Artisanat contemporain'],
 'Halle Tony Garnier, 20 place Antonin Perrin, 69007 Lyon',
 'Lyon', 'Auvergne-Rhône-Alpes', '69', 45.7305, 4.8291,
 '2026-10-09', '2026-10-11', '10:00', '20:00',
 80, 450.00, '3m × 2m',
 ARRAY['Céramique','Joaillerie','Bijoux','Gravure','Verrerie','Sculpture'],
 'Sélection sur portfolio. RC Pro + Décennale obligatoires. Montage J-1 (9 oct.) dès 14h. 3 invitations presse par exposant.',
 true, 'published'),

-- [3] Pop-up Bordeaux (passé — mai 2026)
('cccccccc-cccc-cccc-cccc-cccccccccccc',
 '44444444-4444-4444-4444-444444444444',
 'Pop-up Artisanat Bordeaux — Mai 2026',
 'Pop-up éphémère d''un week-end au Marché des Chartrons. Créateurs et artisans régionaux. Ambiance conviviale, bières locales et musique live.',
 'popup', ARRAY['Artisanat régional','Made in Sud-Ouest'],
 'Marché des Chartrons, Quai des Chartrons, 33300 Bordeaux',
 'Bordeaux', 'Nouvelle-Aquitaine', '33', 44.8603, -0.5576,
 '2026-05-17', '2026-05-18', '10:00', '18:00',
 20, 80.00, '2m × 1,5m',
 ARRAY['Céramique','Maroquinerie','Textile','Broderie','Bougies','Savonnerie'],
 'Créateurs locaux (Nouvelle-Aquitaine) en priorité. Nappe fournie. RC Pro recommandée.',
 false, 'closed'),

-- [4] Marché de Noël Strasbourg (futur lointain — nov.-déc. 2026)
('dddddddd-dddd-dddd-dddd-dddddddddddd',
 '55555555-5555-5555-5555-555555555555',
 'Marché de Noël Artisanal Strasbourg — 2026',
 'Stand au sein du célèbre Marché de Noël de Strasbourg. Section "Artisans d''exception" — créateurs français sélectionnés pour la qualité et l''originalité de leur travail.',
 'fair', ARRAY['Noël','Cadeaux','Artisanat d''exception'],
 'Place de la Cathédrale, 67000 Strasbourg',
 'Strasbourg', 'Grand Est', '67', 48.5818, 7.7510,
 '2026-11-27', '2026-12-31', '11:00', '20:00',
 25, 1200.00, '2,5m × 2m',
 ARRAY['Joaillerie','Bijoux','Gravure','Lutherie','Verrerie','Calligraphie'],
 'Sélection rigoureuse sur dossier. 100% fait main obligatoire. Chalet fourni. Présence obligatoire 5j/7.',
 true, 'published'),

-- [5] Marché saisonnier Nantes (futur proche — été 2026)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 '44444444-4444-4444-4444-444444444444',
 'Marché Bio & Craft Nantes — Été 2026',
 'Marché hebdomadaire estival alliant artisanat et produits bio. Chaque dimanche de juillet-août sur le Quai de la Fosse. Ambiance familiale, DJ sets en soirée.',
 'seasonal', ARRAY['Bio','Artisanat','Été'],
 'Quai de la Fosse, 44000 Nantes',
 'Nantes', 'Pays de la Loire', '44', 47.2151, -1.5659,
 '2026-07-05', '2026-08-30', '10:00', '19:00',
 30, 95.00, '2m × 2m',
 ARRAY['Céramique','Illustration','Macramé','Broderie','Bougies','Cosmétique naturelle'],
 'Ouverture à tous les créateurs. Stand partagé possible (2 créateurs = 1 stand). Reconduction possible d''un dimanche à l''autre.',
 false, 'published');

-- ─── 5. Candidatures ─────────────────────────────────────

INSERT INTO applications (id, event_id, creator_id, message, status, created_at)
VALUES

-- Sophie → Bastille (acceptée)
('aa11aa11-aa11-aa11-aa11-aa11aa11aa11',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 'Bonjour Claire, je suis tatoueuse fine line et j''illustre aussi des tirages d''art. Mon univers nature & japonisme devrait bien s''inscrire dans votre marché. SIRET + RC Pro Maif. Au plaisir !',
 'accepted', now() - interval '3 weeks'),

-- Sophie → Salon Lyon (en attente)
('aa22aa22-aa22-aa22-aa22-aa22aa22aa22',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '11111111-1111-1111-1111-111111111111',
 'Je candidate pour le Salon Design Lyon avec ma gamme de tirages d''art et prints de tatouage. Portfolio sur @sophie_leroux_tattoo.',
 'pending', now() - interval '2 weeks'),

-- Marc → Bastille (refusée — trop de céramistes)
('bb11bb11-bb11-bb11-bb11-bb11bb11bb11',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '22222222-2222-2222-2222-222222222222',
 'Céramiste depuis 12 ans. Je propose vaisselle en grès et objets décoratifs — pièces uniques tournées et émaillées à la main.',
 'refused', now() - interval '1 month'),

-- Marc → Nantes (en attente)
('bb22bb22-bb22-bb22-bb22-bb22bb22bb22',
 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 '22222222-2222-2222-2222-222222222222',
 'Le marché de Nantes est parfait pour mon travail ! Collections spéciales été — tasses, bols et vases en grès coloré.',
 'pending', now() - interval '5 days'),

-- Isabelle → Bastille (acceptée)
('cc11cc11-cc11-cc11-cc11-cc11cc11cc11',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '33333333-3333-3333-3333-333333333333',
 'Joaillière créatrice — bijoux en or recyclé & pierres semi-précieuses, fabriqués à Paris. Certifiés Origine France Garantie. RC Pro + SIRET.',
 'accepted', now() - interval '3 weeks'),

-- Isabelle → Noël Strasbourg (en attente)
('cc22cc22-cc22-cc22-cc22-cc22cc22cc22',
 'dddddddd-dddd-dddd-dddd-dddddddddddd',
 '33333333-3333-3333-3333-333333333333',
 'Le Marché de Noël de Strasbourg correspond exactement à mon positionnement "bijoux d''exception". Pièces idéales pour les cadeaux haut de gamme.',
 'pending', now() - interval '1 week');

-- ─── 6. Conversations & Messages ─────────────────────────

-- Conv A : Sophie ↔ Claire (Bastille)
INSERT INTO conversations (id, event_id, creator_id, organizer_id) VALUES
('c04c1111-1111-1111-1111-111111111111',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444');

INSERT INTO messages (conversation_id, sender_id, content, read_at, created_at) VALUES
('c04c1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444',
 'Bonjour Sophie ! Ta candidature est acceptée, bienvenue au Marché Bastille ! Ton emplacement : stand B-12, côté allée principale.',
 now() - interval '20 days', now() - interval '20 days'),

('c04c1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Merci beaucoup Claire ! Est-ce que je peux amener mon propre éclairage ? J''ai un spot LED USB que j''utilise habituellement.',
 now() - interval '20 days', now() - interval '20 days'),

('c04c1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444',
 'Bien sûr, pas de problème. Il y a une prise au stand. Installation dès 8h30, ouverture à 10h.',
 now() - interval '19 days', now() - interval '19 days'),

('c04c1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Parfait ! Pour le règlement, virement ou chèque ?',
 now() - interval '19 days', now() - interval '19 days'),

('c04c1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444',
 'Paiement en ligne via Nexart — j''ai activé Stripe. Tu recevras le lien de paiement dans la journée.',
 now() - interval '18 days', now() - interval '18 days'),

('c04c1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Reçu, merci ! À samedi prochain.',
 now() - interval '18 days', now() - interval '18 days');

-- Conv B : Isabelle ↔ Claire (Bastille)
INSERT INTO conversations (id, event_id, creator_id, organizer_id) VALUES
('c04c2222-2222-2222-2222-222222222222',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '33333333-3333-3333-3333-333333333333',
 '44444444-4444-4444-4444-444444444444');

INSERT INTO messages (conversation_id, sender_id, content, read_at, created_at) VALUES
('c04c2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
 'Bonjour Isabelle ! Bienvenue au Marché Bastille. Ton stand est en A-03 — la zone bijoux/joaillerie.',
 now() - interval '19 days', now() - interval '19 days'),

('c04c2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
 'Merci Claire ! A-03 me convient parfaitement. Serait-il possible d''avoir une table supplémentaire ? Mes collections prennent un peu de place.',
 now() - interval '18 days', now() - interval '18 days'),

('c04c2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
 'Noté ! On a des tables de réserve, je t''en mets une de côté. À samedi !',
 now() - interval '17 days', now() - interval '17 days');

-- Conv C : Marc ↔ Claire — suite au refus Bastille
INSERT INTO conversations (id, event_id, creator_id, organizer_id) VALUES
('c04c3333-3333-3333-3333-333333333333',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '22222222-2222-2222-2222-222222222222',
 '44444444-4444-4444-4444-444444444444');

INSERT INTO messages (conversation_id, sender_id, content, read_at, created_at) VALUES
('c04c3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444',
 'Bonjour Marc, je suis désolée mais on avait déjà 4 céramistes pour cette édition de juin. Ta candidature est en liste d''attente pour juillet. Je reviens vers toi !',
 now() - interval '28 days', now() - interval '28 days'),

('c04c3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
 'Merci pour le retour Claire, je comprends tout à fait. J''ai candidaté au Marché de Nantes en attendant. À bientôt j''espère !',
 now() - interval '27 days', now() - interval '27 days');

-- ─── 7. Avis (post-marchés) ───────────────────────────────
-- Avis sur le Marché Bastille (événement publié, candidatures acceptées)
-- Contrainte : UNIQUE(event_id, reviewer_id) → 1 avis par personne par événement

INSERT INTO reviews
  (event_id, reviewer_id, reviewed_id, reviewer_role, rating, comment, tags)
VALUES

-- Sophie note Claire pour Bastille
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444',
 'creator', 5,
 'Super organisation, Claire est réactive et bienveillante.',
 ARRAY['Fiable','Bon flux client','Stand bien géré']),

-- Claire note Sophie pour Bastille
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '44444444-4444-4444-4444-444444444444',
 '11111111-1111-1111-1111-111111111111',
 'organizer', 5,
 'Sophie est une valeur sûre : ponctuelle, stand magnifique, beaucoup de ventes.',
 ARRAY['Ponctuel','Qualité produit','Respect des règles']),

-- Avis sur le Pop-up Bordeaux (événement clôturé)
-- Isabelle note Claire
('cccccccc-cccc-cccc-cccc-cccccccccccc',
 '33333333-3333-3333-3333-333333333333',
 '44444444-4444-4444-4444-444444444444',
 'creator', 4,
 'Très bon marché, ambiance chaleureuse. Petit souci de stationnement.',
 ARRAY['Fiable','Bon flux client']),

-- Claire note Isabelle (Bordeaux)
('cccccccc-cccc-cccc-cccc-cccccccccccc',
 '44444444-4444-4444-4444-444444444444',
 '33333333-3333-3333-3333-333333333333',
 'organizer', 5,
 'Isabelle propose des bijoux d''une finesse remarquable. Les clients adorent !',
 ARRAY['Qualité produit','Ponctuel']);
