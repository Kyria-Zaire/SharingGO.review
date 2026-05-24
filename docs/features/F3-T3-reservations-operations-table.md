# F3-T3 — Reservations Operations Table

## Objectif

Écran admin de supervision des réservations : liste paginée, filtres, détail à la demande, cycle de vie V1, badges statut/paiement/accès. Frontend uniquement — aucune modification backend.

## Endpoints consommés

| Méthode | Route | Usage |
|---------|-------|--------|
| GET | `/api/admin/reservations` | Liste avec filtres + `limit` / `offset` |
| GET | `/api/admin/reservations/:id` | Détail réservation sélectionnée |
| GET | `/api/admin/lines` | Select filtre ligne (réutilisé F3-T2) |

Query params liste : `status`, `userId`, `tripId`, `lineId`, `from`, `to`, `limit`, `offset`.

## Composants

| Composant | Rôle |
|-----------|------|
| `ReservationsTable` | Table opérationnelle + action Voir |
| `ReservationsFilters` | Statut, dates, ligne, trip/user ID, limite, pagination |
| `ReservationDetailPanel` | Détail chargé à la demande |
| `ReservationTimeline` | Cycle de vie V1 |
| `ReservationStatusBadge` | Statut réservation (couleurs UI) |
| `PaymentStatusBadge` | Statut paiement |
| `AccessTypeBadge` | Type accès (`payment.type`) |

Fichiers : `api/admin-reservations.api.ts`, `types/reservations.types.ts`, `lib/format-id.ts`.

## formatShortId

Helper centralisé `frontend/src/lib/format-id.ts` :

- `formatShortId(id)` → ex. `cm...fj1g`
- Utilisé dans table et panneau détail (jamais de `substring` ad hoc dans les composants).

## Pagination

- `limit` (défaut 50) et `offset` (défaut 0) conservés côté API.
- Boutons Page préc. / Page suiv. ajustent `offset` par pas de `limit`.
- `hasNextPage` : `reservations.length >= limit` (heuristique sans total count API).

## Colonnes table

Réservation · Passager · Trajet · Départ · Statut · Paiement/accès · Créée le · Actions

## Détail réservation

- Toggle sur « Voir » → `GET /api/admin/reservations/:id`
- Affiche : ID court, passager, trajet, ligne, statut, paiement safe, timeline.
- **Non exposé** : Stripe IDs complets, `boardingToken`, JWT, secrets.

## Cycle de vie V1

Événements réels uniquement :

- Créée : `createdAt`
- Paiement : `payment.createdAt` si présent
- Mise à jour : `updatedAt` (si différent de `createdAt`)
- Utilisée : `usedAt` si présent (champ absent API admin actuelle — follow-up backend)

Structure prête pour étapes futures : confirmée, scannée, remboursée.

## Payment.type

Vérifié backend (`SafePaymentDto.type`) : `TICKET`, `SUBSCRIPTION`, `SUBSCRIPTION_ACCESS`.

- Présent → `AccessTypeBadge`
- Absent → « Accès inconnu » (pas de modif backend dans ce ticket)

## TanStack Query

- Liste : `staleTime: 30_000`
- Détail : `enabled` si `reservationId` sélectionné, `staleTime: 30_000`
- Lignes (filtre) : `staleTime: 5 min`

## Auth

Route `/reservations` protégée `RequireRole` ADMIN / SUPER_ADMIN — DRIVER exclu.

## Limitations F3-T3

- Pas d’annulation / remboursement / scan QR
- Pas d’export CSV / analytics
- `usedAt` / `usedBy` non retournés par l’API admin liste/détail actuelle
- Pagination sans total global

## Prochains tickets

- Enrichir API admin (`usedAt`, événements lifecycle)
- Actions opérationnelles (annulation admin, remboursement)
- Scan QR boarding depuis cockpit
- Toasts UI custom

## Test manuel

1. Backend + seed demo, `VITE_API_URL=http://localhost:3000`
2. Login `admin@sharinggo.demo` / `DemoPassword123!`
3. `/reservations` : liste, filtres, refresh, pagination, détail, timeline
4. API down → `ErrorState` ; filtres vides → `EmptyState`
