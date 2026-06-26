# F4A-T4 — Trip Details & Reservation Entry

Ticket : page `/trips/:tripId` — détail trajet public et entrée réservation (sans POST).

## Objectifs UX

Permettre à un convoyeur de **comprendre précisément** un trajet avant de réserver : route, date, horaires, durée, places, prix 8,99 €, statut — avec un CTA « Réserver ma place » visible mais **non fonctionnel** (message V1).

## Endpoint utilisé

**API publique existante** (aucune auth) :

| Méthode | Path | Usage |
|---------|------|--------|
| `GET` | `/api/trips/:id` | Détail d'un trajet |

Source backend : `backend/src/modules/trips/public-trips.routes.ts`  
OpenAPI : `docs/api/openapi.json` → tags **Public Trips**

**Aucune modification backend.** **Aucune API admin.**

### Shape API (`PublicTrip`)

```typescript
{
  id: string;
  line: {
    id: string;
    name: string;
    startCity: string;
    endCity: string;
  };
  departureTime: string;
  arrivalTime: string | null;
  totalSeats: number;
  reservedSeats: number;
  remainingSeats: number;
  isFull: boolean;
}
```

Trajet inexistant ou désactivé (`deletedAt`) → **404** `TRIP_NOT_FOUND`.

## Route créée

| Path | Page | Layout |
|------|------|--------|
| `/trips/:tripId` | `TripDetailPage` | `PassengerLayout` |

Helper : `ROUTES.tripDetail(tripId)` dans `types/routes.ts`.

## Navigation depuis la liste

| Statut | CTA `TripCard` | Action |
|--------|----------------|--------|
| `available` | Voir le trajet | Link → `/trips/:tripId` |
| `almost_full` | Voir le trajet | Link → `/trips/:tripId` |
| `full` | Complet | disabled |
| `past` | Passé | disabled |
| `unavailable` | Indisponible | disabled |

Aucune réservation déclenchée depuis `TripCard`.

## États CTA détail (`ReservationEntryFooter`)

| Statut | Label | Comportement |
|--------|-------|--------------|
| `available` | Réserver ma place | Clic → message « Réservation bientôt disponible » |
| `almost_full` | Réserver ma place | Idem |
| `full` | Complet | disabled |
| `past` | Trajet passé | disabled |
| `unavailable` | Indisponible | disabled |

**Aucun POST.** Pas de Stripe. Pas d'auth. Pas de QR.

## Structure UI (`TripDetailPage`)

```text
Header (retour + titre)
TripDetailHero           — route, date, badge disponibilité
TripScheduleCard         — départ, arrivée, durée
TripSeatsCard            — places restantes / capacité
TripPriceCard            — 8,99 €
TripKnowBeforeYouGo      — rappels convoyeur
ReservationEntryFooter   — sticky : prix + CTA
```

États page : skeleton, `TRIP_NOT_FOUND`, erreur réseau (retry), succès.

## TanStack Query

- Hook : `usePublicTrip(tripId)`
- Clé : `queryKeys.trips.detail(tripId)`
- `staleTime` : **30 000 ms**
- `enabled` si `tripId` présent
- `retry` : 1 (aligné liste)

## Règles métier réutilisées

- `deriveTripAvailability` — badge et statuts
- `deriveTripDetailReservationCta` — footer détail
- `canNavigateToTripDetail` — navigation liste
- `formatDayLabel`, `formatTime`, `formatTripDuration`
- `TICKET_PRICE_LABEL` — 8,99 €
- `TripAvailabilityBadge`

## Mobile-first

- Footer sticky au-dessus de la bottom nav (`4.5rem + safe-area`)
- Cards uniquement (pas de tableau)
- Shell `max-w-lg` centré
- Viewports cibles : 375, 390, 768 px

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `app/router.tsx` | Route `trips/:tripId` |
| `types/routes.ts` | `ROUTES.tripDetail()` |
| `constants/query-keys.ts` | `trips.detail(tripId)` |
| `hooks/usePublicTrip.ts` | Query détail |
| `hooks/useTripIdParam.ts` | Extraction `tripId` (useParams + fallback pathname) |
| `pages/TripDetailPage.tsx` | Page orchestration |
| `features/trips/components/TripDetail*.tsx` | Sections UI |
| `features/trips/components/ReservationEntryFooter.tsx` | CTA sticky |
| `features/trips/components/TripCard.tsx` | Link « Voir le trajet » |
| `lib/trip-availability.ts` | CTA liste + détail |
| `lib/format-date.ts` | `formatTripDuration` |

## Limites V1

- Pas de création réservation
- Pas de paiement Stripe
- Pas d'authentification requise
- CTA réservation = message placeholder uniquement
- Champ `isDisabled` non exposé par l'API (statut `unavailable` réservé futur backend)

## Prochain ticket recommandé

**F4A-T5 (ou équivalent)** — flux réservation réel : auth convoyeur, pending 2 min, Stripe Checkout, sans implémenter le QR dans le même ticket si scope séparé.

## Exclusions respectées

- ❌ Aucune création réservation
- ❌ Aucun POST
- ❌ Aucun Stripe
- ❌ Aucune authentification
- ❌ Aucun QR
- ❌ Aucune modification backend
- ❌ Aucune API admin
