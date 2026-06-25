# WEB-TRIP-DETAIL-01 — Page détail trajet (passager)

**Statut :** clôturé  
**Route :** `/trips/:tripId`  
**Dépendances :** `GET /api/trips/:id`, flux réservation existant (inchangé)

## Objectif

Page de conversion premium — rassurer et amener vers « Réserver ma place ».

## Sections livrées

| # | Section | Composant |
|---|---------|-----------|
| 1 | Hero premium | `TripDetailHeroSection` |
| 2 | Carte réservation sticky | `TripDetailReservationCard` |
| 3 | Timeline trajet | `TripDetailTimeline` |
| 4 | Détails du trajet | `TripDetailSpecsSection` |
| 5 | Ce qu'il faut savoir | `TripDetailKnowBeforeSection` |
| 6 | À propos navette | `TripDetailShuttleSection` |
| 7 | Réassurance | `TripDetailReassuranceBand` |

## Fichiers clés

```
features/trips/
  constants/trip-detail-content.ts
  lib/trip-detail-calendar.ts
  components/trip-detail/
    TripDetailView.tsx
    TripDetailHeroSection.tsx
    TripDetailReservationCard.tsx
    TripDetailTimeline.tsx
    TripDetailHeroMap.tsx
    TripDetailSpecsSection.tsx
    TripDetailKnowBeforeSection.tsx
    TripDetailShuttleSection.tsx
    TripDetailReassuranceBand.tsx
    TripDetailSkeleton.tsx
pages/TripDetailPage.tsx
```

## Exclusions respectées

- Pas de backend / API / Stripe / métier réservation modifiés
- Pas de KPI fictifs
- Pas de Mapbox / Google Maps
- Pas de lieux précis inventés (villes API uniquement)
- PMR / animaux non affirmés sans confirmation produit

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
pnpm dev   # /trips/:id
```

### QA locale (mode démo — **retirer avant PROD**)

Voir [`WEB-DEMO-DATA-01.md`](./WEB-DEMO-DATA-01.md) : activer `VITE_ENABLE_UI_DEMO_TRIPS=true`, redémarrer `pnpm dev`, puis `/trips/demo-trip-01` (détail stable toute la journée).

## Clôture ticket — rappel démo

- [ ] Mode démo **désactivé** dans `.env` avant merge deploy
- [ ] Checklist **WEB-DEMO-DATA-01** § « AVANT DEPLOY-01 » cochée
