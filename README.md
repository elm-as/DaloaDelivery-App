# 🛵 DaloaDelivery - Application Mobile Livreurs Android

Application mobile native Android pour les livreurs partenaires et la flotte logistique de **DaloaDelivery** (https://delivery.daloamarket.com) à Daloa, Côte d'Ivoire.

---

## 🚀 Fonctionnalités Clés

- **Disponibilité & Statut En Ligne** : Switch instantané avec suivi GPS de positionnement en arrière-plan.
- **Flux des Courses Disponibles** : Affichage en direct des courses dans Daloa avec quartier départ/arrivée, distance kilométrique et gain net livreur.
- **Double Protocole OTP + Photo de Contrôle** :
  - *Ramassage Vendeur* : Saisie du code secret `pickup_otp` + Photo du paquet + Contrôle GPS ($\le 100\,\text{m}$).
  - *Livraison Acheteur* : Saisie du code secret `delivery_otp` + Photo de remise + Contrôle GPS ($\le 100\,\text{m}$).
- **Portefeuille & Payouts Express** : Crédit instantané du gain net (90%) et retraits Mobile Money vers Wave, Orange Money, MTN MoMo, Moov Money.
- **Vérification CNI & KYC** : Prise de vue recto/verso de la pièce d'identité et selfie portrait.
- **Annuaire des Confrères** : Liste publique des livreurs de Daloa avec contacts et véhicules.

---

## 🛠️ Stack Technique

- **Framework** : React Native avec Expo SDK & Expo Router v4
- **Langage** : TypeScript
- **State Management** : Zustand & TanStack React Query v5
- **Backend & Temps Réel** : Supabase
- **Géolocalisation** : Expo Location
- **Sécurité** : Expo SecureStore (`SecureStorageAdapter`)
- **Design System** : `@daloa/ui` avec thème Electric Cyan & Slate Navy

---

## 📦 Installation & Démarrage

```bash
# Installer les dépendances
npm install # ou pnpm install

# Lancer le serveur de développement Expo
npx expo start
```

---

## 🤖 Compilation Android (APK & AAB)

```bash
# Générer l'APK direct
eas build --profile preview --platform android

# Générer le bundle Google Play Store
eas build --profile production --platform android
```
