# WEB-TRIPS-01 — Page Trajets premium (passager)

**Statut :** implémenté (en attente validation CTO)  
**App :** `frontend/apps/passenger` — route `/trips`  
**Dépendances :** API existante `GET /api/trips` (aucun changement backend)

## Objectif

Refonte desktop + mobile de la découverte trajets, cohérente avec la landing WEB-LANDING-01, sans données marketing fictives.

## Livré

| Zone | Détail |
|------|--------|
| Hero | Photo van, titre « Trajets disponibles », sous-titre — hauteur ~20 % plus compacte que la landing |
| Recherche | Sens, date, inversion, bouton Rechercher |
| Quick filters | Aujourd'hui / Demain (dates dynamiques), Prochain départ (API `from=now`), Choisir une date |
| Liste | Lignes premium desktop, cartes mobiles — données API réelles |
| CTA | « Voir les détails » → `/trips/:id` |
| Filtres MVP | Sens, créneau horaire, places disponibles — client-side |
| How-it-works | 4 étapes « Comment fonctionne SharingGO ? » |
| Réassurance | 4 cartes factuelles (pas de KPI inventés) |
| Shell | Pleine largeur + footer marketing sur `/trips` |

## Exclusions respectées

- Pas de KPI fictifs (+20 départs, 98 %, convoyeurs, note)
- Pas de mock API
- Pas de modification backend
- Pas de filtres prix / opérateur / notation

## Fichiers principaux

```
features/trips/
  components/   TripsHeroSection, TripsSearchBar, TripsQuickFilters,
                TripsFiltersSheet, TripListRow, TripCardMobile, TripsList,
                TripsListToolbar, TripsHowItWorksSection, TripsReassuranceSection
  constants/    trips-content.ts, trips-assets.ts
  lib/          trips-filters.ts
hooks/          useNextAvailableTrip.ts
pages/          TripsPage.tsx
```

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
pnpm dev   # :5174 — /trips
```

Breakpoints à vérifier : 390 / 768 / 1024 / 1440 px.

## DoD

- [x] Hero compact
- [x] Recherche fonctionnelle
- [x] Filtres MVP
- [x] Liste premium + CTA
- [x] Aucun KPI fictif
- [x] Bloc how-it-works
- [x] Responsive desktop/mobile
- [x] lint + build OK
- [ ] Validation CTO + captures
- [ ] Commit sur demande
