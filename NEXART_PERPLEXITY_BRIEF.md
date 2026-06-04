# NEXART — Document complet pour analyse Perplexity

## 1. CONCEPT & VISION

**Nexart** est une **plateforme marketplace mobile double-sided** qui connecte deux écosystèmes :

### Utilisateurs créateurs / artisans
- Tatoueurs, céramistes, graveurs, joailliers, illustrateurs, brodeurs, textile, etc.
- **Problème** : Trouver des marchés/événements pour vendre et exposer leurs œuvres
- **Solution** : Découvrir + candidater à 100+ marchés en France, gérer candidatures, communiquer avec organisateurs

### Utilisateurs organisateurs
- Organisateurs de marchés permanents, pop-ups, salons, foires, événements artisanaux
- **Problème** : Recruter les bons artisans pour leurs événements
- **Solution** : Publier événements, recevoir candidatures qualifiées, gérer sélections, communiquer avec créateurs

### Utilisateurs visiteurs (futur)
- Découvrir créateurs + événements publiquement
- Contacter créateurs pour commandes/collaborations

---

## 2. STACK TECHNIQUE COMPLET

### Frontend Mobile
- **Framework** : React Native + Expo SDK 54
- **Langage** : TypeScript (strict, aucun `any` implicite)
- **Navigation** : React Navigation v7 (bottom tabs + stack navigation)
- **UI** : StyleSheet natif React Native + design tokens personnalisés
- **Auth** : Supabase Auth (JWT) + SecureStore (stockage tokens)
- **Notifications** : Expo Notifications (push)
- **Cartes** : React Native Maps (géolocalisation événements)
- **Paiements** : Stripe SDK (intégration Stripe Connect)

### Frontend Web
- HTML/CSS/JS vanilla (landing page marketing)
- **Path** : `website/index.html`

### Backend & Base de données
- **BDD** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (providers: email + socials)
- **Realtime** : Supabase Realtime (messagerie temps réel)
- **Storage** : Supabase Storage (portfolios, photos événements)
- **Row Level Security (RLS)** : Policies actives par rôle

### Services tiers
- **Paiements** : Stripe Connect (commission stands artisans)
- **Images externes** : picsum.photos (data test), Supabase Storage (prod)

### Environnement
- **OS cible** : iOS 13+ / Android 6.0+ (via Expo)
- **Ports** : Metro bundler (8081), Expo Go, EAS Build
- **EAS** : Expo Application Services (cloud builds + updates OTA)

---

## 3. STRUCTURE PROJET

```
nexart/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx          # Splash avec 3 rôles (Creator/Organizer/Visitor)
│   │   │   ├── LoginScreen.tsx            # Connexion email + socials
│   │   │   ├── RegisterScreen.tsx         # Inscription + choix rôle
│   │   │   └── RoleScreen.tsx             # Confirmation rôle après register
│   │   │
│   │   ├── creator/
│   │   │   ├── HomeScreen.tsx             # Feed événements personnalisés
│   │   │   ├── SearchEventsScreen.tsx     # Recherche + filtres avancés
│   │   │   ├── EventDetailScreen.tsx      # Fiche événement complète
│   │   │   ├── ApplicationsScreen.tsx     # Mes candidatures (pending/accepted/refused)
│   │   │   └── CreatorProfileScreen.tsx   # Profil, portfolio, disponibilités
│   │   │
│   │   ├── organizer/
│   │   │   ├── HomeScreen.tsx             # Dashboard : candidatures reçues
│   │   │   ├── CreateEventScreen.tsx      # Créer nouvel événement
│   │   │   ├── ManageEventsScreen.tsx     # Mes événements publiés
│   │   │   ├── EventApplicationsScreen.tsx # Candidatures reçues par événement
│   │   │   └── CreatorMapScreen.tsx       # Carte créateurs disponibles
│   │   │
│   │   ├── discover/
│   │   │   ├── DiscoverHomeScreen.tsx     # Explore événements (visitor + creator)
│   │   │   ├── EventMapScreen.tsx         # Carte interactive événements
│   │   │   ├── CreatorsListScreen.tsx     # Liste créateurs publics
│   │   │   ├── PublicCreatorProfileScreen.tsx # Profil créateur (vue publique)
│   │   │   └── PublicEventDetailScreen.tsx    # Événement (vue publique)
│   │   │
│   │   ├── feed/
│   │   │   ├── FeedScreen.tsx             # Feed posts créateurs (tips, experiences, etc.)
│   │   │   └── CreatePostScreen.tsx       # Créer post (création, partage marché)
│   │   │
│   │   ├── shared/
│   │   │   ├── MessagesScreen.tsx         # Liste conversations
│   │   │   ├── ConversationScreen.tsx     # Chat 1:1 temps réel
│   │   │   ├── ProfileScreen.tsx          # Profil utilisateur (settings, logout)
│   │   │   └── FavoritesScreen.tsx        # Événements favoris (visitor)
│   │   │
│   │   └── visitor/
│   │       ├── VisitorProfileScreen.tsx
│   │       ├── VisitorMessagesScreen.tsx
│   │       └── FavoritesScreen.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── ScreenHeader.tsx
│   │   │   ├── AppHeader.tsx
│   │   │   ├── MarketCard.tsx             # Card événement (mini fiche)
│   │   │   ├── CreatorCard.tsx            # Card créateur (mini profil)
│   │   │   ├── CreationCard.tsx           # Card création/post
│   │   │   ├── HorizontalCardList.tsx     # Scroll horizontal cartes
│   │   │   ├── SwipeCard.tsx              # Carte swipable (Tinder-like)
│   │   │   ├── EtherealBackground.tsx     # Fond design (gradients, blur)
│   │   │   └── PostCard.tsx               # Affichage post (feed)
│   │   │
│   │   └── features/
│   │       ├── EventCard.tsx
│   │       ├── CreatorCard.tsx
│   │       ├── ApplicationItem.tsx
│   │       └── [autres composants métier]
│   │
│   ├── navigation/
│   │   ├── index.tsx                      # RootNavigator (routing principal)
│   │   ├── AuthNavigator.tsx              # Stack auth (Welcome → Register → Login)
│   │   ├── CreatorNavigator.tsx           # Tabs creator (Home, Search, Apps, Messages, Profile)
│   │   ├── OrganizerNavigator.tsx         # Tabs organizer (Home, Create, Manage, Messages, Profile)
│   │   ├── VisitorNavigator.tsx           # Tabs visitor (Discover, Events Map, Creators, Messages, Favorites)
│   │   ├── DiscoverStack.tsx              # Stack découverte (sub-navigation)
│   │   ├── MessageStack.tsx               # Stack messagerie
│   │   ├── FeedStack.tsx                  # Stack feed
│   │   ├── OrganizerEventStack.tsx        # Stack création/gestion événements
│   │   ├── MarketStack.tsx                # Stack événements
│   │   └── linking.ts                     # Deep linking (URL → screens)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                     # Login/register/logout
│   │   ├── useCreatorProfile.ts           # Profil créateur (read/write)
│   │   ├── useEvents.ts                   # Événements (list + filtres)
│   │   ├── useEvent.ts                    # Événement single (détail)
│   │   ├── useGeoEvents.ts                # Événements géolocalisés (map)
│   │   ├── useGeoCreators.ts              # Créateurs géolocalisés (map)
│   │   ├── usePublicCreators.ts           # Créateurs publics (discover)
│   │   ├── useApplications.ts             # Candidatures créateur
│   │   ├── useRecommendations.ts          # Algorithme recommandation événements
│   │   ├── useMessages.ts                 # Messages 1:1 (Realtime Supabase)
│   │   ├── useConversations.ts            # List conversations
│   │   ├── usePosts.ts                    # Feed posts créateurs
│   │   ├── usePushNotifications.ts        # Tokens + notifications
│   │   ├── useReviews.ts                  # Avis bidirectionnels
│   │   ├── useFavorites.ts                # Events favoris (visitor)
│   │   ├── useFollow.ts                   # Follow créateurs
│   │   ├── useFeed.ts                     # Posts personnalisés
│   │   └── useCreateEvent.ts              # Création événement (organizer)
│   │
│   ├── stores/
│   │   └── auth.ts                        # AuthContext (global user state)
│   │
│   ├── lib/
│   │   ├── supabase.ts                    # Client Supabase (avec SecureStore tokens)
│   │   └── demoData.ts                    # Données test (5 événements + 5 créateurs)
│   │
│   ├── types/
│   │   └── index.ts                       # Tous les types TypeScript
│   │
│   ├── utils/
│   │   ├── formatDate.ts                  # Formatage dates
│   │   ├── distanceLabel.ts               # "À 5km", "National"
│   │   └── geocode.ts                     # Géocodage (lat/lng)
│   │
│   ├── constants/
│   │   └── theme.ts                       # Design tokens (couleurs, spacing, typo)
│   │
│   ├── App.tsx                            # Root component
│   │
│   └── index.tsx                          # Entry point
│
├── website/
│   └── index.html                         # Landing page marketing (vanilla HTML/CSS)
│
├── assets/
│   ├── icon.png                           # App icon
│   ├── splash-icon.png                    # Splash screen
│   └── [images marketing]
│
├── app.json                               # Expo config (name, slug, icons, etc.)
├── eas.json                               # EAS Build config (development/preview/production)
├── tsconfig.json                          # TypeScript config
├── babel.config.js                        # Babel config (Expo preset)
├── metro.config.js                        # Metro bundler config
├── .env                                   # Variables d'environnement (dev local)
└── CLAUDE.md                              # Documentation interne projet
```

---

## 4. MODÈLE DE DONNÉES COMPLET (Supabase)

### Tables principales

#### `profiles` (Authentification + rôle)
```typescript
{
  id: UUID PK
  role: 'creator' | 'organizer' | 'visitor'
  full_name: string
  avatar_url: string | null
  bio: string | null
  created_at: timestamp
  updated_at: timestamp
  email: string (Supabase Auth)
}
```

#### `creator_profiles` (Profil artisan)
```typescript
{
  id: UUID PK
  user_id: UUID FK profiles
  disciplines: string[]           // ['Tatouage', 'Illustration', ...]
  city: string | null
  region: string | null           // Île-de-France, Occitanie, etc.
  department: string | null       // 75, 34, etc.
  travel_radius: '5' | '10' | '25' | 'national'
  portfolio_images: string[]      // URLs Supabase Storage
  website: string | null
  instagram: string | null
  etsy: string | null
  siret: string | null
  siret_verified: boolean
  insurance_doc_url: string | null
  insurance_verified: boolean
  availability: JSON {
    weekends: boolean
    custom: [{ from: '2026-07-01', to: '2026-08-31' }]
  }
  created_at: timestamp
}
```

#### `organizer_profiles` (Profil organisateur)
```typescript
{
  id: UUID PK
  user_id: UUID FK profiles
  organization_name: string
  website: string | null
  instagram: string | null
  stripe_account_id: string | null   // Stripe Connect
  created_at: timestamp
}
```

#### `events` (Marchés / événements)
```typescript
{
  id: UUID PK
  organizer_id: UUID FK profiles
  title: string
  description: string | null
  event_type: 'permanent' | 'seasonal' | 'popup' | 'salon' | 'fair'
  theme: string[]                     // ['Noël', 'Design', 'Bijoux', ...]
  location: string | null             // "Place de la Bastille"
  city: string | null
  region: string | null
  department: string | null
  lat: float | null
  lng: float | null
  start_date: date
  end_date: date
  start_time: time | null
  end_time: time | null
  stand_count: integer
  stand_price: numeric | null         // Prix du stand (€)
  stand_dimensions: string | null     // "2m × 2m"
  discipline_tags: string[]           // ['Tatouage', 'Céramique', ...]
  cover_image: string | null          // URL Supabase Storage
  media: string[]                     // Photos additionnelles
  rules: string | null                // Règlement, conditions
  stripe_enabled: boolean             // Paiement via Stripe activé ?
  status: 'draft' | 'published' | 'closed'
  created_at: timestamp
  updated_at: timestamp
}
```

#### `applications` (Candidatures créateur → organisateur)
```typescript
{
  id: UUID PK
  event_id: UUID FK events
  creator_id: UUID FK profiles
  message: string | null              // Message perso candidat
  refusal_reason: string | null       // Raison refus (si refused)
  status: 'pending' | 'accepted' | 'refused'
  stripe_payment_id: string | null    // Payment ID si stand payant
  created_at: timestamp
  updated_at: timestamp
}
```

#### `conversations` (Chat créateur ↔ organisateur)
```typescript
{
  id: UUID PK
  event_id: UUID FK events
  creator_id: UUID FK profiles
  organizer_id: UUID FK profiles
  created_at: timestamp
  updated_at: timestamp
}
```

#### `messages` (Messages chat temps réel)
```typescript
{
  id: UUID PK
  conversation_id: UUID FK conversations
  sender_id: UUID FK profiles
  content: string
  read_at: timestamp | null
  created_at: timestamp
}
```

#### `reviews` (Avis bidirectionnels)
```typescript
{
  id: UUID PK
  event_id: UUID FK events
  reviewer_id: UUID FK profiles       // Qui écrit l'avis
  reviewed_id: UUID FK profiles       // Qui reçoit l'avis
  reviewer_role: 'creator' | 'organizer'
  rating: integer (1-5)
  comment: string | null              // Max 100 chars
  tags: string[]                      // ['Ponctuel', 'Qualité produit', ...]
  created_at: timestamp
}
```

#### `posts` (Feed créateurs)
```typescript
{
  id: UUID PK
  creator_id: UUID FK profiles
  post_type: 'experience' | 'tip' | 'guest_appearance' | 'call_for_collab' | 'general'
  content: string
  images: string[]                    // URLs images posts
  event_ref: string | null            // Référence événement
  location_name: string | null
  likes_count: integer
  comments_count: integer
  created_at: timestamp
}
```

#### `favorites` (Événements favoris - visitor)
```typescript
{
  id: UUID PK
  visitor_id: UUID FK profiles
  event_id: UUID FK events
  created_at: timestamp
}
```

#### `follows` (Follow créateurs)
```typescript
{
  id: UUID PK
  follower_id: UUID FK profiles
  followed_id: UUID FK profiles
  created_at: timestamp
}
```

---

## 5. FLUX UTILISATEUR PAR RÔLE

### 🎨 Créateur (Artist)

1. **Authentification**
   - Register → choix rôle "Créateur" → Compléter profil (disciplines, localisation, portfolio)
   - Vérification SIRET, RC Pro, photos identité (futur)

2. **Découverte événements**
   - Voir événements personnalisés (feed HomeScreen)
   - Recherche avancée : région, disciplines, budget, dates
   - Consulter fiche détail : infos, photos, avis organisateur, candidatures passées

3. **Candidature à événement**
   - Cliquer "Je m'inscris" → message optionnel → confirmation
   - Paiement intégré si stand payant (Stripe)
   - Reçoit notification réponse (accepted/refused)

4. **Messagerie**
   - Chat 1:1 avec organisateur post-candidature
   - Discussions logistiques (setup, éclairage, parking, etc.)

5. **Avis & réputation**
   - Post-événement : noter organisateur (1-5) + commentaire
   - Reçoit avis organisateur
   - Badge "Créateur de confiance" (5+ avis ≥ 4 stars)

6. **Feed social**
   - Partager expériences marchés (photos, tips)
   - Chercher collaborations (partage stands)
   - Voir posts autres créateurs

---

### 🏪 Organisateur (Organizer)

1. **Authentification**
   - Register → choix rôle "Organisateur" → Compléter profil (organisation)
   - Activer Stripe Connect (commission sur stands payants)

2. **Création événement**
   - Créer fiche : titre, dates, type (permanent/pop-up/salon), thème
   - Photos, règlement, stands disponibles, prix
   - Publier ou garder en draft

3. **Gestion candidatures**
   - Dashboard : voir candidatures reçues (pending/accepted/refused)
   - Consulter profil créateur (portfolio, avis, badges)
   - Accepter/refuser + message feedback

4. **Paiement stands** (si Stripe activé)
   - Créateur paie stand via Nexart
   - Fonds versés sur compte organisateur (Stripe Connect)

5. **Messagerie**
   - Chat 1:1 avec chaque créateur accepté
   - Coordonner détails logistiques

6. **Carte créateurs**
   - Voir créateurs disponibles sur carte (localisation + rayon)
   - Contacter directement

7. **Avis**
   - Noter créateur (ponctualité, qualité, respect règles)
   - Aider build réputation créateurs

---

### 👁️ Visiteur (Visitor) — *Futur*

1. **Découverte publique**
   - Voir événements + carte
   - Parcourir créateurs

2. **Contact créateurs**
   - Message direct pour commandes/collaboration

3. **Favoris**
   - Sauver événements intéressants

---

## 6. DISCIPLINES (Tags prédéfinis)

```
Tatouage · Céramique · Gravure · Joaillerie · Bijoux · Illustration
Textile · Maroquinerie · Sculpture · Photographie · Peinture · Poterie
Broderie · Lutherie · Verrerie · Reliure · Cosmétique naturelle · Savonnerie
Coutellerie · Bougies · Macramé · Origami · Calligraphie · Sérigraphie
```

---

## 7. DESIGN SYSTÈME

### Design tokens

| Token | Valeur | Usage |
|-------|--------|-------|
| **Fond principal** | `#0D0D0D` | Arrière-plan screens |
| **Surface** | `#1A1A1A` | Cartes, containers |
| **Accent Or** | `#C9A84C` | CTA, highlights |
| **Vert Sauge** | `#7A9E87` | Secondaire, badges success |
| **Texte primaire** | `#F5F3EF` | Texte principal |
| **Texte secondaire** | `#8A8A8A` | Labels, sous-titres |
| **Erreur** | `#E05A5A` | Erreurs, refus |

### Style
- **Artisanal moderne** : chaud, authentique, pas corporate
- **Dark mode first** (thème sombre par défaut)
- **Typographie** : Courrier/Inter (à affiner)
- **Spacing** : Design scale (8px base)

---

## 8. DONNÉES DE TEST (Dev)

**Mode test** : `EXPO_PUBLIC_DEMO_MODE=true` → 5 événements + 5 créateurs affichés localement  
**Mode production** : `EXPO_PUBLIC_DEMO_MODE=false` → Données réelles Supabase

### Événements démo
1. **Marché des Créateurs Bastille** (Paris) — permanent, Juin 2026
2. **Salon du Design & Craft Lyon** (Lyon) — salon, Octobre 2026
3. **Pop-up Artisanat Bordeaux** (Bordeaux) — popup, Juillet 2026
4. **Marché de Noël Strasbourg 2026** (Strasbourg) — fair, Nov-Dec 2026
5. **Marché Bio & Craft Nantes** (Nantes) — seasonal, Juillet-Août 2026

### Créateurs démo
1. **Sophie Leroux** — Tatouage fine line + illustration (Paris)
2. **Marc Dumont** — Céramiste (Montpellier)
3. **Isabelle Chen** — Joaillière (Paris)
4. **Lucas Bernard** — Brodeur textile (Bordeaux)
5. **Amélie Fontaine** — Illustratrice graveure (Lyon)

---

## 9. SÉCURITÉ & RLS (Row Level Security)

Supabase RLS policies actives :

- **Creator profiles** : Seul propriétaire peut lire/écrire son profil
- **Organizer profiles** : Seul propriétaire peut lire/écrire
- **Events** : Organisateur read/write, public read (published only)
- **Applications** : Creator voit ses applis, organizer voit applis reçues
- **Messages** : Seuls participants conversation peuvent read/write
- **Reviews** : Public read, write seulement post-événement pour participants

---

## 10. PROGRESSION MVP

### ✅ Infrastructure (Complétée)
- [x] Projet Expo SDK 54 + TypeScript
- [x] Dépendances : Supabase, React Navigation, Stripe, etc.
- [x] Structure dossiers
- [x] Client Supabase + SecureStore
- [x] Auth flow complet
- [x] Navigation par rôle
- [x] Landing page marketing
- [x] Schéma Supabase + RLS

### 🚧 Fonctionnalités restantes

**Profils créateurs (A)**
- [ ] Création profil complet
- [ ] Upload photos + galerie
- [ ] Calendrier disponibilités
- [ ] Badges vérification

**Événements (B)**
- [ ] Création événement (organizer)
- [ ] Fiche détail
- [ ] Recherche + filtres
- [ ] Carte interactive

**Candidatures (C)**
- [ ] Bouton "Je m'inscris"
- [ ] Dashboard candidatures
- [ ] Stripe paiement stands

**Messagerie (D)**
- [ ] Chat temps réel
- [ ] Notifications push

**Avis (E)**
- [ ] Formulaires avis
- [ ] Système badges

**Feed social**
- [ ] Posts créateurs
- [ ] Partage collaborations

---

## 11. COMMANDES CLÉS

```bash
# Développement local
npx expo start              # App mobile (Metro bundler)
npx expo start --web        # Version web
npx tsc --noEmit            # TypeScript check

# EAS Build
eas build --platform ios --profile development
eas build --platform android --profile development
eas build --platform all --profile preview
eas build --platform all --profile production

# EAS Update (OTA)
eas update --branch production

# Landing page
cd website && npx serve . -p 3000
```

---

## 12. VARIABLES D'ENVIRONNEMENT

```bash
# .env (développement local)
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_SUPABASE_URL=https://cvqeysnymnkfxfithhsr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
EXPO_PUBLIC_STRIPE_KEY=pk_test_...
```

**Note** : `EXPO_PUBLIC_DEMO_MODE` automatiquement `false` en production (eas.json)

---

## 13. ARCHITECTURE CRITIQUE

### Patterns clés

**Hooks data** : Tous les appels Supabase = hooks custom (`useEvents`, `useMessages`, etc.)
- Jamais d'appels directs dans composants
- Gestion state + loading + error
- Fallback DEMO_MODE pour développement

**Navigation conditionnelle** : 
- AuthNavigator (non-authentifié)
- CreatorNavigator / OrganizerNavigator / VisitorNavigator (par rôle)
- Deep linking support (URL → screen)

**Context Auth** : AuthContext stocke user + role global

**Realtime** : Supabase Realtime utilisé pour messagerie (subscriptions)

**Images** : 
- Dev : picsum.photos (démo)
- Prod : Supabase Storage

---

## 14. PROCHAINES ÉTAPES CRITIQUES

1. **Profils créateurs** → Portfolio + vérification SIRET/RC
2. **Événements** → Création + détail complet
3. **Candidatures** → Workflow complet (create/accept/refuse)
4. **Stripe** → Paiement stands intégrés
5. **Realtime messaging** → Chat temps réel
6. **Notifications push** → Alertes candidatures
7. **Feed social** → Posts + partages

---

## 15. CONTACTS & INFOS

- **Développeur** : Kabantempo (v.doucende@aromasense.fr)
- **Supabase** : cvqeysnymnkfxfithhsr.supabase.co
- **EAS** : projectId `69b28ef6-b967-4914-ac62-6215b62e8fe6`
- **Stripe** : Test keys (pk_test_...)

---

**Version** : 1.0 (2026-06-04)
**Statut** : MVP en développement
**Prochaine review** : Post-fonctionnalités principales