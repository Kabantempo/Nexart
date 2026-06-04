# Nexart — Site Web vs App Mobile

## Architecture finale

```
nexart/
├── App.tsx + src/              ← APP MOBILE (React Native + Expo)
│   └── Dashboard private (créateurs/organisateurs)
│
└── web/                         ← SITE WEB (React + Tailwind)
    └── Site public marketing + auth
```

---

## 🌐 SITE WEB (`web/`)

**URL** : nexart.fr (quand déployé)  
**Public** : Tout le monde peut accéder  
**Framework** : React + React Router + Tailwind + Shadcn/ui  

### Pages publiques

| Page | URL | Contenu | Authentification |
|------|-----|---------|-----------------|
| **Home** | `/` | Hero animé + présentation | ❌ Public |
| **Créateurs** | `/creators` | Galerie 500+ créateurs | ❌ Public |
| **Événements** | `/events` | Recherche 200+ marchés | ❌ Public |
| **À propos** | `/about` | Histoire, mission, team | ❌ Public |
| **Login** | `/login` | Formulaire connexion | ❌ Public |
| **Register** | `/register` | Inscription avec rôle | ❌ Public |

### Après authentification (App section)

| Rôle | Path | Pages | Interface |
|------|------|-------|-----------|
| **Créateur** | `/app/dashboard` | Dashboard, Events, Profile | Dashboard avec sidebar |
| **Organisateur** | `/app/dashboard` | Dashboard, Events, Create | Dashboard avec sidebar |
| **Visiteur** | `/app/events` | Events, Creators | Dashboard simplifié |

---

## 📱 APP MOBILE (`src/`)

**Plateforme** : iOS + Android (via Expo)  
**Framework** : React Native + Expo SDK 54  
**Private** : Authentification requise  

### Navigation

| Rôle | Navigation | Pages |
|------|-----------|-------|
| **Créateur** | Bottom tabs | Home, SearchEvents, Applications, Messages, Profile |
| **Organisateur** | Bottom tabs | Home, CreateEvent, ManageEvents, Applications, Messages |
| **Visiteur** | Bottom tabs | Discover, EventMap, Creators, Messages, Favorites |

---

## 🎯 Différences clés

### Site Web = Marketing + Public

```
/ (Home)
├── Hero animé Framer Motion
├── Stats (500+ créateurs, 200+ marchés)
├── 6 features cards
├── CTA signup
└── Newsletter

/creators
├── Galerie créateurs avec filtres
├── Profil créateur cliquable
├── Rating + badges
└── "Télécharger l'app"

/events
├── Recherche 200+ marchés
├── Filtres type + localisation
├── Carte interactive (futur)
└── "Rejoindre via app"

/about
├── Notre histoire
├── Mission & valeurs
├── Team presentation
└── Investors (futur)
```

### App Mobile = Fonctionnel + Private

```
Dashboard (Créateur)
├── Stats candidatures
├── Événements recommandés
├── Candidatures en cours
├── Messages non lus

Search Events
├── Filtres avancés (région, budget, discipline)
├── Résultats en liste + carte
└── Candidature 1-click

Profile
├── Portfolio + photos
├── Disciplines + localisation
├── Disponibilités
└── Badges vérification

Messaging
├── Chat 1:1 Realtime
├── Historique complet
└── Notifications push
```

---

## 🔄 Flux utilisateur

### Découverte (Site web public)
```
Landing page → Voir créateurs → Voir événements → Intéressé ?
                                                     ↓
                                          "Télécharger l'app"
                                                     ↓
                                            Créer un compte
```

### Utilisation (App mobile private)
```
Tableau de bord → Chercher événements → Candidater → Chat → Participer
                                                              ↓
                                                    Laisser un avis
```

---

## 📊 Avantages cette architecture

| Aspect | Site | App |
|--------|------|-----|
| **Audience** | Publique (SEO, sharing) | Private (auth) |
| **UX** | Marketing focused | Functional focused |
| **Performance** | Fast load (Vercel) | Offline capable |
| **Engagement** | Découverte passive | Engagement actif |
| **Monétisation** | Premium creator listing | Stripe Connect |
| **Social** | Share créateurs | Real-time messaging |

---

## 🚀 Déploiement

### Site Web
```bash
cd web
npm install
npm run build
# Deploy sur Vercel
```
**URL** : nexart.fr

### App Mobile
```bash
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
# Upload sur App Store + Google Play
```
**URLs** : 
- iOS: App Store
- Android: Google Play

---

## 💡 Résumé

**Nexart = 2 produits différents**

- 🌐 **Site** : Plateforme de découverte + marketing
- 📱 **App** : Tool de gestion + candidatures

**Une base de données partagée** (Supabase)  
**Hooks réutilisés** pour logique métier  
**Design cohérent** (couleurs Nexart)  
**Contenu distinct** (site public vs app private)

---

**Status** ✅
- [x] Site web : Home + Créateurs + Événements + About
- [x] App mobile : Dashboard par rôle
- [x] Auth partagée : Supabase Auth
- [x] Navigation distincte : Site public vs App private
- [ ] Déploiement production : Vercel (web) + EAS (app)
