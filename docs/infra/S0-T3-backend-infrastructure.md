# S0-T3 — Couche infrastructure backend

Ticket : configuration, observabilité minimale, erreurs standardisées, healthcheck DB, graceful shutdown. Aucune logique métier.

## Structure `backend/src`

```
src/
├── index.ts              # Bootstrap, shutdown SIGINT/SIGTERM
├── app.ts                # Express app, middlewares, routes
├── config/
│   └── env.ts            # Validation stricte des variables d'environnement
├── lib/
│   ├── prisma.ts         # Singleton PrismaClient + connect/disconnect
│   ├── logger.ts         # Logger JSON léger (sans dépendance externe)
│   └── errors.ts         # AppError pour erreurs HTTP typées
├── middleware/
│   ├── request-id.middleware.ts
│   ├── not-found.middleware.ts
│   └── error.middleware.ts
├── routes/
│   └── health.routes.ts
└── types/
    └── express.d.ts      # Extension Request.requestId
```

## Validation d'environnement

Variables **obligatoires** au démarrage (crash immédiat si absentes ou invalides) :

| Variable | Règle |
|----------|--------|
| `NODE_ENV` | `development` \| `test` \| `production` |
| `PORT` | Entier 1–65535 |
| `DATABASE_URL` | Chaîne non vide (jamais loggée) |
| `CORS_ORIGIN` | Chaîne non vide |

Pas de fallback silencieux sur `CORS_ORIGIN` ni `PORT`.

## Logger

- Sortie JSON sur stdout/stderr (`info`, `warn`, `error`, `debug` en dev uniquement)
- Redaction automatique des clés sensibles et URLs `postgresql://`

## Request ID

- Header entrant `x-request-id` accepté s'il est non vide
- Sinon génération UUID
- Header `x-request-id` renvoyé sur chaque réponse
- Disponible via `req.requestId`

## Format d'erreur JSON

```json
{
  "error": {
    "message": "Route not found",
    "code": "NOT_FOUND",
    "requestId": "..."
  }
}
```

- **404** : route inconnue (`NOT_FOUND`)
- **4xx/5xx** : `AppError` ou erreur interne (`INTERNAL_SERVER_ERROR`)
- Pas de stack trace en `production`

## Healthcheck `GET /health`

Réponse **200** si PostgreSQL répond (`SELECT 1` via Prisma) :

```json
{
  "status": "ok",
  "service": "sharinggo-backend",
  "environment": "development",
  "timestamp": "2026-05-22T12:00:00.000Z",
  "database": { "status": "ok" }
}
```

Réponse **503** si la DB est indisponible (`database.status: "error"`, `status: "error"`). Aucune fuite de `DATABASE_URL`.

## Graceful shutdown

Sur `SIGINT` / `SIGTERM` :

1. Fermeture du serveur HTTP (`server.close`)
2. `prisma.$disconnect()`
3. Logs structurés puis `process.exit(0)`
4. Timeout forcé 10 s en cas de blocage

## Prisma — commandes Docker officielles

> **Windows** : ne pas cibler l'IP Docker `172.x.x.x` depuis l'hôte. Risque de conflit si un PostgreSQL local écoute aussi sur le port **5432** — privilégier les commandes **dans le conteneur backend**.

```bash
docker compose -f docker-compose.dev.yml up -d postgres backend

docker exec sharinggo-backend-dev npx prisma validate
docker exec sharinggo-backend-dev npx prisma generate
docker exec sharinggo-backend-dev npx prisma migrate deploy

docker exec sharinggo-postgres-dev psql -U postgres -d sharinggo -c "\dt"
```

Depuis l'hôte (uniquement si `DATABASE_URL` pointe explicitement vers la bonne instance) :

```bash
cd backend
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sharinggo?schema=public
npx prisma validate
npx prisma generate
npm run lint
npm run build
```

## Tests manuels

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/unknown-route
```

Vérifier : `x-request-id` dans les headers, JSON 404 standardisé, 503 si Postgres arrêté.

## Hors périmètre

Auth, réservation, Stripe, webhooks, seeds métier, modifications `schema.prisma`.
