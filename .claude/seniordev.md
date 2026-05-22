> **Quand :** TypeScript / implémentation backend · Prisma · transactions métier

# Senior dev — Sharing Go

## Standards

- TypeScript **strict** ; pas de `any` sans justification
- Erreurs typées (`TripFullError`, `PendingExpiredError`) — pas de `catch {}` vide
- Une responsabilité par module ; pas de helpers à une ligne

## Métier (ne pas raccourcir)

| Flux | Règle |
|------|--------|
| Réserver | `pending_reservations` + `expires_at` = now + **2 min** |
| Places | Transaction + verrou ligne trajet |
| Ticket | 1 Checkout = 1 trajet (8 €) |
| Abo actif | Skip paiement si Stripe subscription `active` |
| Mosolf | Invalider autres abos à l’activation code |

## Modules API

Respecter les frontières `architecte-api.md` : `auth`, `users`, `lines`, `trips`, `reservations`, `pending-reservations`, `payments`, `subscriptions`, `promo-codes`, `admin`, `boarding`.

## Prisma

- Backup avant migration destructive · soft delete `deleted_at`
- Tables : `webhook_events`, `deployments`, `admin_audit_logs`
- Index : `trips.datetime`, `pending_reservations.expires_at`, `webhook_events.idempotency_key`

```typescript
// ❌ Compter places sans transaction
const count = await prisma.reservation.count({ where: { tripId } });

// ✅ Dans la même transaction que la création pending
```

## Tests ciblés (quand demandés)

- Race : 9e réservation sur trajet 8 places → rejet
- Expiration pending → libération place
- Webhook Stripe doublon → idempotent
