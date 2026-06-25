# WEB-BOOKINGS-01 — Refonte Mes réservations (passager)

**Statut :** clôturé (validation visuelle CTO)  
**Route :** `/bookings`  
**Dépendances :** `GET /api/reservations`, `GET /api/reservations/:id`, boarding pass existant

## Objectif

Page premium pour consulter les réservations, comprendre les statuts et accéder rapidement au billet QR.

## Livrables

| Zone | Détail |
|------|--------|
| Hero | `BookingsHeroSection` — pleine largeur, aligné Trips |
| Shell | `/bookings` dans `isMarketingSurface` (footer + `py-0`) |
| Tabs | À venir · Passées · Annulées (+ compteurs API) |
| Desktop | Table large (`lg+`) avec accès QR direct |
| Mobile | Cartes dédiées + rail QR vert |
| Tri | Date départ / plus récent / plus ancien |
| Empty states | Premium par onglet |
| Compteur temporel | Départ dans Xh / Aujourd'hui / Demain / Dans N jours |

## Fichiers clés

```
features/bookings/
  lib/booking-actions.ts
  lib/booking-departure-label.ts
  lib/bookings-sort.ts
  components/
    BookingsHeroSection.tsx
    BookingsFilterTabs.tsx
    BookingCardMobile.tsx
    BookingsDesktopTable.tsx
    BookingsEmptyState.tsx
    BookingsSortToolbar.tsx
    BookingsSortSheet.tsx
    BookingsListSkeleton.tsx
hooks/
  useBookingsTabCounts.ts
  useUserReservations.ts
pages/BookingsPage.tsx
```

## Exclusions respectées

- Pas de backend / API / Stripe / QR / auth modifiés
- Pas de données fictives permanentes
- Labels FR via `status-labels.ts` + `reservation-status.ts`
- Villes via `trip-city-labels.ts`

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
pnpm dev   # /bookings (auth requise)
```

## Clôture ticket — rappel démo

- [ ] Mode démo **désactivé** avant deploy (`WEB-DEMO-DATA-01`)
- [ ] Aucune donnée inventée en liste réservations
