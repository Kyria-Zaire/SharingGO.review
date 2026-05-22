# S1.5-T4 — Basic Rate Limiting + Abuse Protection

Couche anti-abus MVP sur routes sensibles, sans Redis / Cloudflare / captcha.

## Objectif sécurité

Protéger la surface exposée (auth, lectures publiques, pending, checkout, admin) contre :

- brute force login/register
- spam pending reservation
- spam checkout Stripe
- scraping léger sur trips publics
- surcharge des routes admin

**Hors scope** : Redis store, WAF, Turnstile, changement logique auth/paiement/réservation.

## Surfaces protégées

| Limiter | Routes | Fenêtre | Max / IP | Code erreur |
|---------|--------|---------|----------|-------------|
| `authLimiter` | `POST /api/auth/login`, `POST /api/auth/register` | 15 min | 10 | `RATE_LIMITED_AUTH` |
| `publicReadLimiter` | `GET /api/trips`, `GET /api/trips/:id` | 1 min | 120 | `RATE_LIMITED_PUBLIC_READ` |
| `reservationLimiter` | `POST /api/reservations/pending` | 1 min | 10 | `RATE_LIMITED_RESERVATION` |
| `checkoutLimiter` | `POST /api/payments/checkout` | 1 min | 5 | `RATE_LIMITED_CHECKOUT` |
| `adminLimiter` | `/api/admin/*` (transport + overview) | 1 min | 60 | `RATE_LIMITED_ADMIN` |

## Exception Stripe webhook

`POST /api/webhooks/stripe` :

- **Aucun** rate limiter appliqué
- Monté **avant** `express.json()` (raw body signature)
- Sécurité = `constructEvent` + table `WebhookEvent` (idempotence)
- Stripe peut retry ; un limiter agressif casserait les retries légitimes

## Réponse 429 standard

```json
{
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMITED_AUTH",
    "requestId": "uuid"
  }
}
```

Headers : `RateLimit-*` (standard), `x-request-id`.

## Logging

Warn JSON minimal : `requestId`, `route`, `ip`, `limiter`.

Jamais loggué : password, cookie, session token, body Stripe, secrets.

## IP & trust proxy

- Identification par IP Express standard (`req.ip`)
- **`trust proxy` non activé** (pas de décision infra VPS/Nginx pour ce ticket)
- Derrière reverse proxy : activer plus tard `app.set('trust proxy', 1)` pour IP client réelle

## Overrides test (optionnels)

Variables **optionnelles** — si absentes, valeurs prod/dev ci-dessus :

| Variable | Limiter |
|----------|---------|
| `RATE_LIMIT_AUTH_MAX` / `RATE_LIMIT_AUTH_WINDOW_MS` | auth |
| `RATE_LIMIT_PUBLIC_READ_MAX` / `RATE_LIMIT_PUBLIC_READ_WINDOW_MS` | public read |
| `RATE_LIMIT_RESERVATION_MAX` / `RATE_LIMIT_RESERVATION_WINDOW_MS` | reservation |
| `RATE_LIMIT_CHECKOUT_MAX` / `RATE_LIMIT_CHECKOUT_WINDOW_MS` | checkout |
| `RATE_LIMIT_ADMIN_MAX` / `RATE_LIMIT_ADMIN_WINDOW_MS` | admin |

## Limites sans Redis

Store **mémoire process** (`express-rate-limit` par défaut) :

- OK pour MVP mono-instance
- Reset au redémarrage backend
- Multi-instance : quotas non partagés entre pods

## Future hardening

- Redis / Memcached store partagé
- Cloudflare rate rules + bot fight
- Turnstile sur login/register/checkout
- Limites par `userId` authentifié (en plus de l’IP)

## Fichiers

- `backend/src/middleware/rate-limit.middleware.ts`
- `backend/src/app.ts` — `adminLimiter`, `publicReadLimiter`, webhook inchangé
- `backend/src/modules/auth/auth.routes.ts`
- `backend/src/modules/reservations/reservations.routes.ts`
- `backend/src/modules/payments/payments.routes.ts`
- `backend/scripts/s1-5-t4-rate-limit-test.mjs`

## Exemples curl (tests manuels)

```powershell
# Auth — 11e requête login → 429 RATE_LIMITED_AUTH
1..11 | ForEach-Object {
  curl.exe -s -o NUL -w "%{http_code}`n" -X POST http://localhost:3000/api/auth/login `
    -H "Content-Type: application/json" `
    -d "{\"email\":\"nobody@example.com\",\"password\":\"wrong\"}"
}

# Public trips — dépasser 120 GET/min → 429 RATE_LIMITED_PUBLIC_READ
# (utiliser RATE_LIMIT_PUBLIC_READ_MAX=3 pour test rapide)

# Webhook — pas de 429 rate limit (échec signature = 400, pas rate limit)
curl.exe -X POST http://localhost:3000/api/webhooks/stripe `
  -H "Content-Type: application/json" `
  -d "{}"
# Attendu : 400 signature, pas 429 RATE_LIMITED_*
```

Script automatisé (seuils bas via env) :

```powershell
$env:RATE_LIMIT_AUTH_MAX="2"
$env:RATE_LIMIT_PUBLIC_READ_MAX="2"
$env:RATE_LIMIT_RESERVATION_MAX="2"
$env:RATE_LIMIT_CHECKOUT_MAX="2"
$env:RATE_LIMIT_ADMIN_MAX="2"
# redémarrer backend puis :
node backend/scripts/s1-5-t4-rate-limit-test.mjs
```
