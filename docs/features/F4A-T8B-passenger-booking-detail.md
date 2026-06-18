# F4A-T8B — Passenger Booking Detail Page

Ticket : page détail réservation `/bookings/:id` branchée sur `GET /api/reservations/:id` — sans QR ni boarding API.

## Flow utilisateur

```text
/bookings → clic « Voir le billet »
  → /bookings/:reservationId (RequireAuth)
  → GET /api/reservations/:id
  → détail trajet + paiement + statut
  → CTA « Voir mon billet » disabled si CONFIRMED (F4A-T8C)
```

## Endpoint

| Fonction | Méthode | Route |
|----------|---------|-------|
| `getUserReservation(id)` | GET | `/api/reservations/:id` |

Auth cookie · owner-only · **404** `RESERVATION_NOT_FOUND` si autre user ou id inconnu.

### Response (200)

```typescript
{
  id: string;
  status: ReservationStatus;
  trip: {
    id, departureTime, arrivalTime, line: { id, name, startCity, endCity }
  };
  payment: PaymentSafe | null;
  createdAt: string;
  updatedAt: string;
}
```

**Non exposé** : `boardingToken`, `usedAt`, Stripe ids.

## CTA selon statut

| Statut | UI |
|--------|-----|
| `CONFIRMED` | CTA « Voir mon billet » **disabled** + mention F4A-T8C |
| `USED` | Message « Billet utilisé » — pas de CTA billet |
| `CANCELED` | Message « Réservation annulée » — pas de CTA billet |
| Autres | Bandeau neutre avec label statut |

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `api/reservations.api.ts` | `getUserReservation` |
| `hooks/useUserReservation.ts` | TanStack Query detail |
| `pages/BookingDetailPage.tsx` | Page détail |
| `app/router.tsx` | Route `bookings/:reservationId` |

`BookingDetailPlaceholderPage.tsx` conservé dans le repo (non routé) — remplacé par `BookingDetailPage` dans le router.

## États UI

| État | Comportement |
|------|--------------|
| Loading | Skeleton 3 blocs |
| 404 | Message + retour `/bookings` |
| Error | `ErrorState` + retry |
| Success | Cartes trajet / paiement / métadonnées |

## Limites hors scope

- QR / `GET /api/boarding/:id/qr` → **F4A-T8C**
- Boarding pass page fonctionnelle
- Annulation passager

## Dépendances

- F4A-T8A — liste `/bookings`
- S1.5-T1 — API detail backend

## Prochain ticket

**F4A-T8C** — QR boarding pass passager.
