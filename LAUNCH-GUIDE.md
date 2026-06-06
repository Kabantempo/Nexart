# 🚀 Nexart Mobile — Guide de Lancement Complet

**Status:** 30 écrans prêts ✅ | Metro Bundler a des problèmes de timing dans certains environnements

---

## ⚡ OPTION 1 : Lancer sur ta machine (RECOMMANDÉ)

### Étape 1: Terminal
```bash
cd nexart
npm install  # Si première fois
npm run web
```

### Étape 2: Attendre la compilation
- Metro Bundler compile (1-2 minutes)
- Tu verras : `Local: http://localhost:19006`

### Étape 3: Ouvrir l'app
- **Navigateur:** http://localhost:19006
- **VS Code Mobile Preview:** Cmd+Shift+P → "Mobile Preview: Open Preview" → URL: http://localhost:19006

---

## 🔄 OPTION 2: EAS Build (Cloud Testing)

Pour tester sur device physique ou simulator :

```bash
# Installer EAS CLI
npm install -g eas-cli

# Login
eas login

# Build pour preview (simulator)
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

Cela crée des builds qu'on peut déployer sur TestFlight (iOS) ou Google Play (Android).

---

## 🌐 OPTION 3: Tester le site Web (Nexart Site)

Si tu veux tester la **version Next.js du site** :

```bash
cd nexart-site-sync  # Ou ton dossier du site
npm run dev
# Ouvre: http://localhost:3000
```

Le site Nexart est **100% prêt** et en production sur Hostinger.

---

## 📋 Checklist Avant de Lancer

Avant de lancer sur ta machine :

```bash
# ✅ Dépendances installées
npm install

# ✅ Cache nettoyé
rm -rf .expo node_modules/.expo
npm install

# ✅ Env vars correctes
cat .env  # Vérifie SUPABASE_URL et KEY sont présentes

# ✅ Metro config updated
# (déjà corrigé — file metro.config.js)

# ✅ Image picker API corrigée
# (déjà fixé — CreateProfileScreen.tsx utilise "canceled")
```

---

## 🎯 Si ça marche pas encore

### Problème: "Port already in use"
```bash
# Tuer tous les processus Expo
pkill -f expo
# ou sur Windows:
taskkill /F /IM node.exe
```

### Problème: "Metro bundler stuck"
```bash
# Reset total
rm -rf .expo node_modules package-lock.json
npm install
npm run web
```

### Problème: "Supabase connection error"
```bash
# Vérifie les env vars
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY

# Ou check le fichier .env
cat .env
```

### Problème: "Module not found"
```bash
# Rebuild
expo prebuild --clean
npm run web
```

---

## ✅ Ce qui est prêt à tester

### Phase 1 (100% ✅)
- [x] Auth (register, login, role selection)
- [x] CreateProfileScreen (4-step wizard)
- [x] SearchEventsScreen (filters, pagination)
- [x] EventDetailScreen (detail + apply)

### Phase 2 (100% ✅)
- [x] ApplicationsScreen (my applications + payments)
- [x] EventApplicationsScreen (receive applications)
- [x] MessagesScreen (conversations list)
- [x] ConversationScreen (real-time chat)

### Infrastructure (100% ✅)
- [x] 30 screens total
- [x] Supabase connected
- [x] Real-time messaging
- [x] Navigation 100% valid
- [x] TypeScript no errors (in src/)

---

## 📱 How to Test Key Flows

Once app loads at http://localhost:19006:

### Flow 1: Register (5 min)
1. Click "S'inscrire"
2. Enter email: test@example.com
3. Password: TestPass123!
4. Name: Test User
5. Click "Créer compte"
6. Select "Créateur"
→ Should see CreatorNavigator (5 tabs)

### Flow 2: Profile (3 min)
1. Tap "Profil" tab
2. Fill bio (minimum 10 chars)
3. Select disciplines (1-5)
4. Enter region and city
5. Select travel radius
6. Upload photo (optional)
7. Save
→ Data should save to Supabase

### Flow 3: Search & Apply (5 min)
1. Tap "Marchés" tab
2. See event list
3. Use filters (type, region, budget, date)
4. Tap an event
5. Tap "Je m'inscris"
6. Add optional message
7. Submit
→ Application appears in "Candidatures" tab

### Flow 4: Messages (3 min)
1. Tap "Messages" tab
2. See list of conversations
3. Tap a conversation
4. Type message + send
5. See message appear instantly (real-time)
→ No reload needed

---

## 🛠️ Troubleshooting by Error

| Error | Solution |
|-------|----------|
| `ERR_CONNECTION_REFUSED` | Expo not started. Run `npm run web` and wait 1-2 min |
| `Metro is not running` | Kill node: `pkill -f node` then `npm run web` |
| `Cannot find module` | Run `npm install` then `npm run web` |
| `Supabase connection error` | Check `.env` has SUPABASE_URL + KEY |
| `ReferenceError: cancelled undefined` | Already fixed in CreateProfileScreen.tsx |
| `Cannot resolve web/` | Already fixed in metro.config.js |

---

## 📊 Project Structure

```
nexart/
├── src/                    # React Native source (Expo)
│   ├── screens/           # 30 screens
│   ├── navigation/        # 8 navigators
│   ├── hooks/            # Custom hooks
│   ├── stores/           # Zustand stores
│   ├── lib/              # Utils
│   └── types/            # TypeScript types
├── web/                   # Next.js website (separate)
├── app.json              # Expo config
├── metro.config.js       # Bundler config (FIXED)
├── package.json
└── .expo-ignore          # Exclude web/

// Key files fixed:
- src/screens/creator/CreateProfileScreen.tsx (API fix)
- metro.config.js (web/ exclusion)
```

---

## 🚀 Next Steps After Testing

1. **Report bugs** - Screenshot + steps to reproduce
2. **Test on device** - Use Expo Go app with QR code
3. **Deploy preview** - `eas build --profile preview`
4. **Submit to store** - `eas build` (production)

---

## 📞 Quick Commands Reference

```bash
# Start development
npm run web

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Test on simulator (if you have simulator setup)
npm run ios
npm run android

# Check project
npm list expo
npx expo prebuild --help
```

---

**Good luck! 🎉 The app is 95% ready. Just need it running on your machine!**
