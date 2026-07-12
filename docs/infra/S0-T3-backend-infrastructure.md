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

> **Windows — quelle instance Postgres répond sur `:5432` ?** Deux Postgres peuvent coexister : le conteneur Docker (`sharinggo-postgres-dev`) et un service natif Windows (`postgres.exe`). Les deux peuvent écouter sur **5432** mais sur des adresses de bind différentes (`0.0.0.0` vs `127.0.0.1`) : `localhost:5432` depuis l'hôte peut alors résoudre vers le **natif**, pas le conteneur attendu. Ne pas cibler l'IP Docker `172.x.x.x` depuis l'hôte ; privilégier les commandes **dans le conteneur backend**. Pour les commandes hôte (tests, migrations locales), vérifier explicitement quelle instance `DATABASE_URL` atteint.
>
> **Symptôme observé (CASCADE-01, tests d'intégration) :** la base de test `sharinggo_test` créée dans l'instance native Windows était encodée **WIN1252**, ce qui faisait échouer tout seed contenant des accents (`Châlons`) avec l'erreur Postgres `22P05`, indépendamment du schéma. Correctif : recréer la base de test en **UTF-8** (`CREATE DATABASE sharinggo_test ENCODING 'UTF8'`), ou pointer `.env.test` vers le conteneur Docker. Reco équipe : fixer une instance canonique en dev Windows (arrêter le service natif, ou déplacer le conteneur sur un autre port).
>
> **Même famille de problème** que la confusion `DATABASE_URL`/`pg_dump` hôte-vs-conteneur documentée dans [`docs/ops/DEPLOY-01-BACKUP-RESTORE.md`](../ops/DEPLOY-01-BACKUP-RESTORE.md) (backup/restore via `docker compose exec`, jamais `pg_dump` sur l'hôte). Règle commune : **toujours savoir quelle instance Postgres une commande atteint** avant de l'exécuter.

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
