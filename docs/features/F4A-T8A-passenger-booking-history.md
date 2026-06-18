# F4A-T8A — Passenger Booking History

Ticket : page « Mes réservations » branchée sur `GET /api/reservations` — sans QR ni boarding pass.

## Flow utilisateur

```text
Bottom nav « Réservations » ou PaymentSuccessPage CTA
  → /bookings (RequireAuth)
  → GET /api/reservations?upcoming=true | past=true | (aucun filtre temps)
  → cartes trajet + statut + montant
  → CTA « Voir le billet » → /bookings/:id (placeholder F4A-T8B)
```

## Endpoint

| Fonction | Méthode | Route | Query |
|----------|---------|-------|-------|
| `listUserReservations()` | GET | `/api/reservations` | `upcoming`, `past`, `status`, `limit`, `offset` |

Toutes les requêtes : `credentials: "include"`.

### Filtres UI → API

| Onglet | Query envoyée |
|--------|---------------|
| À venir | `upcoming=true&limit=50` |
| Passées | `past=true&limit=50` |
| Toutes | `limit=50` (tri backend : départ desc) |

## Shape réponse (item liste)

```typescript
{
  id: string;
  status: "CONFIRMED" | "USED" | "CANCELED" | …;
  trip: {
    id: string;
    departureTime: string;
    arrivalTime: string | null;
    line: { id, name, startCity, endCity };
  };
  payment: {
    id, status, type, amount, currency, createdAt
  } | null;
  createdAt: string;
}
```

**Non exposé backend** : `boardingToken`, `usedAt`, champs Stripe.

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `api/reservations.api.ts` | `listUserReservations` |
| `hooks/useUserReservations.ts` | TanStack Query + filtres |
| `features/bookings/components/BookingCard.tsx` | Carte réservation |
| `features/bookings/components/BookingsFilterTabs.tsx` | Onglets À venir / Passées / Toutes |
| `lib/reservation-status.ts` | Labels + badge statut + format montant |
| `pages/BookingsPage.tsx` | Page principale |
| `pages/BookingDetailPlaceholderPage.tsx` | Placeholder `/bookings/:id` (T8B) |

## États UI

| État | Comportement |
|------|--------------|
| Loading | Skeleton 2 cartes |
| Error | `ErrorState` + retry |
| Empty | `EmptyState` contextualisé par filtre + CTA trajets |
| Success | Liste `BookingCard` |

## Badges statut

| Statut | Label |
|--------|-------|
| `CONFIRMED` | Confirmée |
| `USED` | Utilisée |
| `CANCELED` | Annulée |
| `PENDING` / `EXPIRED` | Labels fallback si présents |

## Limites hors scope

- QR / `GET /api/boarding/:id/qr` → **F4A-T8C**
- Détail billet complet → **F4A-T8B**
- Pagination UI (offset) — limit 50 fixe V1
- Annulation / remboursement

## Dépendances

- S1.5-T1 — API historique backend
- F4A-T7 — funnel paiement → réservations CONFIRMED

## Prochain ticket

**F4A-T8B** — détail billet `/bookings/:reservationId`.
