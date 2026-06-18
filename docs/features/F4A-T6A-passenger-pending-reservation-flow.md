# F4A-T6A — Passenger Pending Reservation Flow

Ticket : brancher l'app passenger sur le moteur pending backend existant — verrouillage 2 minutes, sans Stripe.

## Flow utilisateur

```text
TripDetailPage — utilisateur connecté
  → clic « Réserver ma place »
  → POST /api/reservations/pending { tripId }
  → 201 : redirect /bookings/pending/:pendingReservationId

PendingReservationPage (RequireAuth)
  → GET /api/reservations/pending/:id
  → countdown MM:SS jusqu'à expiresAt
  → CTA « Payer maintenant » disabled (F4A-T7)
  → CTA « Libérer ma place » → DELETE pending → /trips

Expiration (countdown 00:00 ou GET 410 PENDING_EXPIRED)
  → état expiré + « Voir les trajets »

TripDetailPage — utilisateur anonyme
  → redirect /login { state: { from: pathname } } (inchangé F4A-T5B)
```

**Aucun Stripe.** **Aucune** `Reservation` confirmée créée côté frontend.

## Endpoints utilisés

| Fonction client | Méthode | Route | Auth |
|-----------------|---------|-------|------|
| `createPendingReservation(tripId)` | POST | `/api/reservations/pending` | cookie session |
| `getPendingReservation(id)` | GET | `/api/reservations/pending/:id` | cookie session |
| `cancelPendingReservation(id)` | DELETE | `/api/reservations/pending/:id` | cookie session |

Toutes les requêtes : `credentials: "include"`.

Réponses typées dans `types/reservations.ts` (alignées OpenAPI `CreatePendingResult` / `PendingReservation`).

## Erreurs gérées (frontend)

| Code / HTTP | Comportement |
|-------------|--------------|
| `401` | Redirect login avec `state.from` |
| `TRIP_FULL` | Message inline footer détail trajet |
| `TRIP_PAST` | Message inline footer |
| `PENDING_ALREADY_EXISTS` | Message demandant de finaliser/libérer (backend ne renvoie pas l'id pending existant) |
| `TRIP_DISABLED` | Message inline |
| `410` / `PENDING_EXPIRED` | Page pending — état expiré |
| `PENDING_NOT_FOUND` / `403` | Message + lien retour trajets |
| `RATE_LIMITED_RESERVATION` | Message rate limit |
| Autres | Message générique + retry si applicable |

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `api/reservations.api.ts` | Appels HTTP pending |
| `types/reservations.ts` | Types + codes erreur |
| `hooks/useCreatePendingReservation.ts` | Mutation création + navigation |
| `hooks/usePendingReservation.ts` | Query GET + poll 15 s + refetch focus |
| `hooks/usePendingCountdown.ts` | Timer MM:SS local |
| `pages/PendingReservationPage.tsx` | UX verrouillage |
| `pages/TripDetailPage.tsx` | CTA branché |
| `constants/query-keys.ts` | `pending(id)`, `createPending` |

## Route

| Path | Page | Protection |
|------|------|------------|
| `/bookings/pending/:pendingReservationId` | `PendingReservationPage` | `RequireAuth` |

Helper : `ROUTES.pendingBooking(id)`.

## Polling / refresh

- Refetch pending toutes les **15 secondes** tant que non expiré.
- `refetchOnWindowFocus: true` sur la query pending.
- Countdown local toutes les **1 seconde** (sans appel API).

## Limites hors scope

- Stripe Checkout / webhook → **F4A-T7**
- Liste « Mes réservations » confirmées → **F4A-T8** (backend `GET /api/reservations` déjà prêt)
- QR boarding pass
- Cron expiration (lazy backend — acceptable V1)
- Modification backend / Prisma
- Redirection auto vers pending existante sur `PENDING_ALREADY_EXISTS` (pas d'id dans la réponse API)

## Dépendances

- F4A-T5B — auth cookie + `RequireAuth`
- S1-T3 — moteur pending backend (`PendingReservation`, TTL 2 min, `FOR UPDATE`)

## Prochain ticket

**F4A-T7** — Stripe Checkout après pending (`POST /api/payments/checkout`).
