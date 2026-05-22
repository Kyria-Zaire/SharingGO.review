# S0-T2 — Fondation Prisma / base de données

Ticket : schéma initial, migration `init`, validation structurelle. Aucune logique métier.

## Tables créées

| Table | Rôle |
|-------|------|
| `User` | Comptes convoyeur / admin / super-admin |
| `PromoCode` | Codes promo (ex. MOSOLF), usage unique optionnel |
| `Line` | Ligne de navette (multi-lignes futur) |
| `Trip` | Trajet sur une ligne, conducteur optionnel, 8 places par défaut |
| `PendingReservation` | Blocage temporaire de place (expiration) |
| `Reservation` | Réservation confirmée ou en cours de cycle de vie |
| `Subscription` | Abonnement Stripe (MOSOLF / convoyeur) |
| `Payment` | Paiement ticket ou abonnement, liens Stripe |
| `AuditLog` | Traçabilité actions admin / système |

## Enums

- `UserType` : CONVOYEUR, ADMIN, SUPER_ADMIN
- `ReservationStatus` : PENDING, CONFIRMED, CANCELED, USED, EXPIRED
- `PaymentStatus` : PENDING, SUCCEEDED, FAILED, REFUNDED
- `PaymentType` : TICKET, SUBSCRIPTION
- `PromoCodeType` : MOSOLF
- `SubscriptionType` : MOSOLF_MONTHLY, CONVOYEUR_MONTHLY
- `SubscriptionStatus` : ACTIVE, PAST_DUE, CANCELED, INCOMPLETE

## Relations critiques

- **Conducteur** : `Trip.driver` → `User` via `@relation("DriverTrips")` ; inverse `User.driverTrips`
- **Ligne / trajets** : `Line` 1—N `Trip` ; suppression ligne restreinte si trajets existent
- **Pending → Trip / User** : verrouillage place avant paiement ; index sur `expiresAt`
- **Reservation → Trip / User** : statut + `boardingToken` ; 1—1 optionnel `Payment`
- **Subscription → User** : `stripeSubscriptionId` unique ; période courante obligatoire
- **Payment** : `reservationId` unique (ticket) ; champs Stripe `paymentIntent`, `subscription`, `invoice`
- **PromoCode** : `usedByUser` optionnel
- **AuditLog** : `actorUser` optionnel, `metadata` JSON

## Identifiants (cuid)

Toutes les clés primaires utilisent `@default(cuid())` (chaînes opaques, triables, sans collision UUID v4 en masse). Compatible API et logs ; pas d’exposition séquentielle des IDs métier.

## Pourquoi `Subscription` existe

Les abonnements MOSOLF et convoyeur mensuels sont un produit distinct du billet unitaire. Le modèle dédié porte l’état Stripe (`stripeSubscriptionId`, `status`, période) sans surcharger `Reservation`. `Payment.type = SUBSCRIPTION` complète la trace financière ; `Payment.stripeSubscriptionId` / `stripeInvoiceId` couvrent facturation et webhooks futurs.

## Pourquoi `Reservation` n’a pas de soft delete

Une réservation est un fait métier et comptable (places, paiement, embarquement). Annulation = `status = CANCELED`, pas suppression logique. Le soft delete (`deletedAt`) reste sur `User`, `Trip`, `PromoCode` pour conformité RGPD / archivage opérationnel sans effacer l’historique des réservations.

## Écart schéma CTO vs Prisma (obligatoire)

Le bloc CTO ne listait pas les champs inverse sur `User` pour `PromoCode`, `PendingReservation` et `AuditLog`. Prisma exige une relation bidirectionnelle (erreur P1012). Ajouts après `prisma format` :

- `promoCodes PromoCode[]`
- `pendingReservations PendingReservation[]`
- `auditLogs AuditLog[]`

Aucun changement de colonne SQL ; uniquement navigation côté client Prisma.

## Migration

- Dossier : `backend/prisma/migrations/20260522064439_init/`
- Commande locale (hôte) : `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sharinggo npx prisma migrate dev --name init`
- **Docker dev** : après rebuild backend, `docker exec sharinggo-backend-dev npx prisma migrate deploy` (réseau `postgres:5432`)

## Commandes de validation

```bash
cd backend
# DATABASE_URL requis (voir .env.example, localhost pour CLI hôte)
npx prisma validate
npx prisma generate
npm run lint
npm run build   # équivalent typecheck (pas de script typecheck racine npm/pnpm)
```

## Hors périmètre S0-T2

Pas de `webhook_events`, seed métier, endpoints, auth, ni webhooks Stripe — prévus dans tickets ultérieurs.
