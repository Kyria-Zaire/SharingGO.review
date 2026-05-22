# S1.5-T8 — Monitoring / Health Hardening

Observabilité MVP avant Sprint 2 — **sans stack externe** (Prometheus, Sentry, etc.).

## Objectifs

- Savoir si l’API est **vivante** (`/health`)
- Savoir si l’API est **prête** (`/ready`)
- Diagnostiquer PostgreSQL et config critique
- Préparer exploitation Docker / VPS

## Endpoints

### `GET /health` (liveness)

- **200** tant que le processus Express tourne
- **Ne teste pas** PostgreSQL (changement vs ancien health S0)
- Champs : `status`, `service`, `environment`, `timestamp`, `uptimeSeconds`, `version`

### `GET /ready` (readiness)

- **200** + `status: "ready"` si tous les checks OK
- **503** + `status: "not_ready"` sinon
- Checks :
  - `database` — `SELECT 1` via Prisma
  - `configuration` — présence config critique (sans exposer les valeurs)
  - `stripe` — clés/format V1 présents (`sk_`, `whsec_`, prix, `eur`) — **pas d’appel réseau Stripe**

## Sécurité des réponses

Jamais exposé : `DATABASE_URL`, clés Stripe, cookies, mots de passe, raw env.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `backend/src/routes/health.routes.ts` | Routes `/health`, `/ready` |
| `backend/src/lib/readiness.ts` | Évaluation des checks |
| `backend/src/lib/app-version.ts` | Version depuis `package.json` |
| `backend/src/lib/process-metadata.ts` | `uptimeSeconds` |
| `docker-compose.dev.yml` | Healthcheck backend → `/health` |
| `docs/runbooks/ops-health-monitoring.md` | Runbook ops |

## Stripe en dev

Stripe n’est **pas désactivable** : `env.ts` exige les variables au démarrage. Si l’app tourne, le check `stripe` est en principe `ok`. Un échec indique une incohérence runtime rare.

## Docker

Healthcheck backend (Node `fetch` sur `127.0.0.1:3000/health`) — pas de `curl` requis dans l’image Alpine.

Pour orchestration trafic réel : préférer **`/ready`** en prod (à documenter au déploiement VPS).

## Limites / futur

- Pas de métriques, traces distribuées, alerting
- Recommandation VPS : reverse proxy health → `/ready`, logs centralisés, sauvegardes Postgres

## Tests

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3000/ready
curl.exe http://localhost:3000/api/trips?limit=1
docker compose -f docker-compose.dev.yml stop postgres
curl.exe http://localhost:3000/ready   # 503
curl.exe http://localhost:3000/health # 200
docker compose -f docker-compose.dev.yml start postgres
```
