# S1.5-T7 — Logging Normalization Review

Revue ciblée observabilité / documentation — **sans refonte logger** ni changement logique métier.

## Constats (inspection CTO)

| Zone | Constat |
|------|---------|
| Webhook Stripe | Logs `info` avec `sessionId` (ID Checkout complet) |
| Signature | Détail `error.message` Stripe potentiellement verbeux au warn |
| Logger | Clés `stripe*` partiellement couvertes ; pas de masquage `pi_` / `cs_` en valeur |
| OpenAPI | Codes `RATE_LIMITED_*`, `PENDING_ALREADY_EXISTS`, `TRIP_PAST`, etc. peu documentés |
| Ops | Pas de runbook pending expirée au webhook |

## Modifications appliquées

### Logs Stripe (`backend/src/modules/payments/*`, `backend/src/lib/logger.ts`)

| Avant | Après |
|-------|--------|
| `info` duplicate webhook / session fulfilled / race P2002 | `debug` (refs courtes si session) |
| `sessionId: session.id` en info | `checkoutSessionRef` via `stripeLogRef()` en debug |
| warn signature + `error.message` Stripe | warn **sans** détail signature |
| — | `logger.ts` : masquage valeurs `whsec_`, `sk_`, `pk_` ; raccourcissement `pi_` / `cs_` longs ; clés `signature`, `rawbody` redacted |

**Inchangé (OK CTO)** : `eventId`, `pendingReservationId`, `tripId`, `reservationId` en warn/error.

**Aucun** log du raw body webhook.

### OpenAPI

Fichiers : `backend/src/docs/openapi.json`, `docs/api/openapi.json`

- Schéma `ApiErrorCode` (enum codes réels)
- Description `info` enrichie (S1.5-T7)
- Exemples `PENDING_ALREADY_EXISTS`, `STRIPE_SIGNATURE_INVALID`
- `TRIP_PAST` documenté (alias doc `TRIP_IN_PAST`)
- `RESERVATION_ALREADY_EXISTS` : **non exposé HTTP** — idempotence webhook / P2002 (noté dans la description)

### Runbook

`docs/runbooks/stripe-webhook-failures.md` — pending expirée, vérifs DB/Stripe, remboursement manuel, interdits.

## Fichiers touchés

| Fichier | Action |
|---------|--------|
| `backend/src/lib/stripe-log-refs.ts` | Créé |
| `backend/src/lib/logger.ts` | Durcissement sanitize |
| `backend/src/modules/payments/stripe-webhook.service.ts` | Niveaux + refs |
| `backend/src/modules/payments/stripe-webhook.handler.ts` | Warn signature |
| `backend/src/docs/openapi.json` | Codes erreur |
| `docs/api/openapi.json` | Miroir |
| `docs/runbooks/stripe-webhook-failures.md` | Créé |

## Dette technique restante

- Externalisation / i18n des `message` d’erreur API
- Pas de SIEM, agrégation logs, alertes (hors scope)
- AuditLog DB peut encore contenir IDs Stripe complets en metadata (hors logs applicatifs)

## Tests recommandés

```powershell
npm run lint
npm run build
curl.exe http://localhost:3000/api/docs.json
curl.exe -X POST http://localhost:3000/api/webhooks/stripe -H "Content-Type: application/json" -d "{}"
# Attendu : 400 STRIPE_SIGNATURE_INVALID, logs sans signature
```
