# WEB-PROFILE-01 — Refonte Mon profil (passager)

**Statut :** accepté CTO  
**Route :** `/profile` (auth requise)  
**Dépendances :** `GET /api/auth/me`, `GET /api/subscriptions/me`, `GET /api/reservations`

## Objectif

Tableau de bord personnel premium : identité, abonnement, statistiques, informations, paiement, préférences, sécurité et activité récente — sans modification backend.

## Livrables

| Zone | Détail |
|------|--------|
| Hero | `ProfileHeroSection` — titre, sous-titre, bouton Déconnexion |
| Shell | `/profile` dans `isMarketingSurface` (footer + layout premium) |
| Onglets | Vue d'ensemble · Informations · Paiement · Préférences · Sécurité |
| Vue d'ensemble | Cartes profil, abonnement, stats, fidélité, 3 dernières réservations |
| Informations | Prénom, nom, email (lecture seule email ; save désactivé — pas d'API PATCH) |
| Paiement | Empty state Stripe ; pas de wallet local |
| Préférences | Placeholder honnête (pas d'API préférences MVP) |
| Sécurité | MDP / appareils / suppression — actions sensibles désactivées |
| Avatar Google | Photo JWT en `sessionStorage` après connexion Google (fallback initiales) |

## Fichiers clés

```
features/profile/
  constants/profile-content.ts
  lib/profile-tabs.ts
  lib/profile-format.ts
  lib/google-profile-picture.ts
  hooks/useProfileRecentReservations.ts
  hooks/useProfileStats.ts
  components/
    ProfileView.tsx
    ProfileHeroSection.tsx
    ProfileFilterTabs.tsx
    ProfileSkeleton.tsx
    ProfileErrorCard.tsx
    ProfileAvatar.tsx
    overview/…
    information/…
    payment/…
    preferences/…
    security/…
pages/ProfilePage.tsx
```

## Hooks réutilisés

- `useAuth` — identité session
- `useSubscriptionMe` — abonnement actif
- `listUserReservations` — activité récente + stats (via hooks dédiés)

## Exclusions respectées

- Pas de backend / API / Prisma / Stripe / OAuth modifiés
- Pas de CO₂, km, argent économisé, wallet, fidélité complète
- Pas de champs inventés (téléphone, adresse, date de naissance)
- Pas de dark mode / thème

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
pnpm dev   # http://localhost:5174/profile (auth requise)
node ../../tmp-screenshot-profile.mjs   # depuis la racine repo, serveurs up
```

## Captures QA

- `docs/qa/WEB-PROFILE-01-desktop.png`
- `docs/qa/WEB-PROFILE-01-mobile.png`

## Notes produit

- Stats basées sur les réservations API (limite 50 passées + 50 à venir)
- « Trajets effectués » = réservations au statut `USED`
- CTA « Enregistrer » remplacé par message « Modification du profil bientôt disponible »
- Préférences et sécurité : cartes « bientôt disponible » avec badge **Bientôt**
