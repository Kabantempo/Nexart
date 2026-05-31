# Nexart — CLAUDE.md

Plateforme de mise en relation double-sided entre créateurs/artisans et marchés/événements artisanaux en France.

## Concept

**Nexart** connecte deux types d'utilisateurs :
- **Créateurs / Artisans** : exposants qui cherchent des marchés et événements pour vendre leurs créations
- **Organisateurs** : marchés artisanaux, foires, événements qui cherchent des artisans pour remplir leurs stands

## Stack technique

| Couche | Technologie |
|--------|------------|
| Mobile (iOS + Android) | React Native + Expo SDK 53 |
| Web | Expo Web (même base de code) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Navigation | React Navigation v7 (bottom tabs + stack) |
| Langage | TypeScript strict |
| Styling | StyleSheet natif RN + design tokens |

## Structure du projet

```
nexart/
├── src/
│   ├── screens/          # Écrans de l'app
│   │   ├── auth/         # Login, Register, Onboarding
│   │   ├── creator/      # Écrans côté artisan
│   │   ├── organizer/    # Écrans côté organisateur
│   │   └── shared/       # Profil, paramètres, messages
│   ├── components/       # Composants réutilisables
│   │   ├── ui/           # Boutons, inputs, cards, etc.
│   │   └── features/     # Composants métier
│   ├── navigation/       # Configuration navigation
│   ├── lib/
│   │   └── supabase.ts   # Client Supabase
│   ├── hooks/            # Custom hooks
│   ├── stores/           # État global (Zustand ou Context)
│   ├── types/            # Types TypeScript partagés
│   ├── utils/            # Helpers
│   └── constants/        # Couleurs, spacing, fonts
├── assets/               # Images, fonts, icons
├── app.json
├── App.tsx               # Entry point
└── CLAUDE.md             # Ce fichier
```

## Fonctionnalités MVP

### Côté Artisan
- [ ] Inscription / profil artisan (nom, bio, photos, catégorie de création)
- [ ] Recherche d'événements par région / date / catégorie
- [ ] Candidature à un marché
- [ ] Suivi des candidatures (en attente, accepté, refusé)
- [ ] Messagerie avec l'organisateur

### Côté Organisateur
- [ ] Inscription / profil événement (nom, lieu, dates, nb de stands)
- [ ] Publication d'un marché
- [ ] Réception et gestion des candidatures
- [ ] Acceptation / refus des artisans
- [ ] Messagerie avec les artisans

### Partagé
- [ ] Auth (email/password + Google OAuth)
- [ ] Notifications push (Expo Notifications)
- [ ] Onboarding choix de rôle (artisan ou organisateur)

## Base de données Supabase (schéma cible)

```sql
-- Profils utilisateurs
profiles (id, role: 'creator'|'organizer', full_name, avatar_url, bio, created_at)

-- Artisans
creator_profiles (id, user_id, category, location, website, instagram, portfolio_images[])

-- Marchés / Événements
events (id, organizer_id, title, description, location, city, department,
        start_date, end_date, stand_count, stand_price, category_tags[], status, cover_image)

-- Candidatures
applications (id, event_id, creator_id, message, status: 'pending'|'accepted'|'refused',
              created_at, updated_at)

-- Messagerie
conversations (id, event_id, creator_id, organizer_id, created_at)
messages (id, conversation_id, sender_id, content, created_at)
```

## Design

**Identité visuelle Nexart :**
- Palette : noir profond `#0D0D0D`, blanc cassé `#F5F3EF`, accent or `#C9A84C`, accent vert sauge `#7A9E87`
- Typography : bold pour les titres, readable pour le corps
- Style : artisanal moderne, chaud, authentique — pas corporate

## Commandes de développement

```bash
# Démarrer l'app
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Web
npx expo start --web

# TypeScript check
npx tsc --noEmit
```

## Variables d'environnement

Créer un fichier `.env` à la racine :
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## Conventions de code

- Composants en PascalCase, fichiers en kebab-case
- Hooks custom préfixés `use`
- Types dans `src/types/` — pas d'inférence implicite `any`
- Chaque écran a son propre fichier dans `src/screens/`
- Supabase queries dans des hooks dédiés, jamais dans les composants directement

## Progression

- [x] Initialisation projet Expo + TypeScript
- [x] Installation dépendances (Supabase, React Navigation)
- [ ] Structure de dossiers src/
- [ ] Client Supabase configuré
- [ ] Navigation de base (tabs + auth flow)
- [ ] Écrans Auth (login / register / onboarding rôle)
- [ ] Écrans Artisan (dashboard, recherche événements, candidatures)
- [ ] Écrans Organisateur (dashboard, créer événement, gérer candidatures)
- [ ] Messagerie
- [ ] Notifications push
