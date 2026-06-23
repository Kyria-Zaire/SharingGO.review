# WEB-LANDING-01 — Refonte page d'accueil passager

**Ticket :** WEB-LANDING-01  
**Feature parente :** WEB-REFONTE-01 — Passenger Experience  
**Prérequis :** WEB-SHELL-01 (shell passager)  
**Statut :** Implémenté

## Objectif

Reproduire la maquette PO de la landing passager : hero premium, prochains départs, abonnements, sections confiance — sans modifier le shell, l'API ni le métier.

## Sections livrées

| Section | Composant | Desktop | Mobile |
|---------|-----------|---------|--------|
| Hero | `LandingHeroSection` | 2 colonnes texte + visuel | Stack, CTA pleine largeur |
| Prochains départs | `LandingDeparturesSection` | Grille 4 cartes | 2 cartes + CTA |
| Abonnements | `LandingSubscriptionsSection` | Bannière image + 2 cartes + bénéfices | Cartes verticales |
| Pourquoi SharingGO | `LandingWhySection` | Grille 4 cartes icônes vertes | 1–2 colonnes |
| Bon à savoir | `LandingGoodToKnowSection` | Grille 4 cartes | 1–2 colonnes |

Anciennes sections retirées de `LandingPage` : Route, HowItWorks, Pricing, Benefits, FAQ, FinalCta (fichiers conservés, non montés).

## Choix UI

- **Palette :** fond `#000`, surfaces `muted/30`, accent `#22c55e` (tokens existants).
- **Cards :** `rounded-2xl`, bordure `border-border/80`, ombre discrète.
- **Typo hero :** titre jusqu'à `3.25rem` desktop, mot « simplicité » en `text-primary`.
- **Ancres :** `#departures`, `#pricing`, `#how-it-works`, `#faq`, `#why-sharinggo` (compat footer shell).
- **CTA abonnements :** lien vers `/register` (marketing, pas de flux Stripe modifié).

## Source des données — Prochains départs

- Hook **`usePublicTrips`** (identique à `/trips`).
- Filtre **aujourd'hui** (`todayParisDateKey()`).
- Exclusion des trajets **passés** (`deriveTripAvailability`).
- Limite **4** affichés desktop, **2** mobile.
- États : skeleton, erreur (`ErrorState` + retry), vide (CTA vers `/trips`).
- **Aucun mock permanent.**

## Assets utilisés

| Asset | Fichier | Statut |
|-------|---------|--------|
| Visuel hero (van / terminal) | `LandingHeroVisual.tsx` | **Temporaire** — SVG/CSS inline |
| Visuel abonnements (intérieur) | `LandingSubscriptionVisual.tsx` | **Temporaire** — SVG/CSS inline |

Aucune image raster dans le dépôt passager. **Avant production terrain :** remplacer par photos officielles SharingGO (van de nuit, intérieur sièges).

## Responsive strategy

- Conteneur : `passengerHeaderContainerClass` (1280 → 1440 → 1536).
- Breakpoints : mobile first, `sm` 2 colonnes départs, `lg` hero 2 col + bannière abonnements.
- `overflow-x-hidden` sur `LandingPage`.
- Safe area : gérée par le shell (bottom nav).

## Limites connues

1. Visuels hero / abonnements = placeholders graphiques (pas photo réelle).
2. Boutons « Choisir » abonnements → inscription, pas checkout Stripe.
3. Carousel hero (points pagination) = décoratif statique (1 slide).
4. Anciens composants landing non supprimés (hors `LandingPage`).

## Captures recommandées

- `/` @ 1440px — hero + départs + abonnements
- `/` @ 390px — hero mobile + 2 départs + abonnements
- `/` anonyme — pas de bottom nav
- `/` connecté mobile — bottom nav visible

## Fichiers clés

```
features/home/
├── components/
│   ├── LandingPage.tsx
│   ├── LandingHeroSection.tsx
│   ├── LandingHeroVisual.tsx
│   ├── LandingDeparturesSection.tsx
│   ├── LandingDepartureCard.tsx
│   ├── LandingSubscriptionsSection.tsx
│   ├── LandingSubscriptionVisual.tsx
│   ├── LandingWhySection.tsx
│   ├── LandingGoodToKnowSection.tsx
│   └── LandingInfoGridSection.tsx
├── constants/landing-content.ts
└── lib/
    ├── landing-layout.ts
    └── landing-trip-utils.ts
```
