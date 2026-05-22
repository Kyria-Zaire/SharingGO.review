# Runbook — Health & readiness (ops)

> Endpoints publics, **sans authentification**. Aucun secret dans les réponses.

## Endpoints

| Route | Rôle | HTTP attendu |
|-------|------|----------------|
| `GET /health` | **Liveness** — process Node vivant | Toujours **200** si le serveur tourne |
| `GET /ready` | **Readiness** — prêt à servir du trafic | **200** si dépendances OK, **503** sinon |

## Vérifications rapides

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3000/ready
```

Docker :

```powershell
docker inspect sharinggo-backend-dev --format "{{.State.Health.Status}}"
docker compose -f docker-compose.dev.yml ps
```

## Si `checks.database.status = error` (503 sur /ready)

1. Vérifier Postgres : `docker compose -f docker-compose.dev.yml ps postgres`
2. Logs backend : `docker logs sharinggo-backend-dev --tail 50`
3. Tester DB : `docker exec sharinggo-postgres-dev pg_isready -U postgres -d sharinggo`
4. Redémarrer Postgres si nécessaire : `docker compose -f docker-compose.dev.yml restart postgres`
5. Attendre `healthy` puis `curl /ready` → 200

**Note** : `/health` peut rester **200** même si la DB est down (liveness ≠ readiness).

## Si `checks.configuration.status = error`

- Variables manquantes ou invalides au démarrage (le processus ne devrait pas démarrer).
- Vérifier `.env` : `DATABASE_URL`, `CORS_ORIGIN`, `PORT`, `SESSION_COOKIE_NAME`.
- Redémarrer backend après correction : `docker compose -f docker-compose.dev.yml up -d --force-recreate backend`

## Si `checks.stripe.status = error`

Stripe est **obligatoire en V1** (pas de mode désactivé).

Vérifier dans `.env` (sans copier les valeurs dans les tickets) :

- `STRIPE_SECRET_KEY` commence par `sk_` (pas `pk_`)
- `STRIPE_WEBHOOK_SECRET` commence par `whsec_`
- `STRIPE_TICKET_PRICE_CENTS` entier positif
- `STRIPE_CURRENCY=eur`
- `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` renseignés

Redémarrer le backend après mise à jour `.env`.

## Logs utiles

| Message | Signification |
|---------|----------------|
| `PostgreSQL connected via Prisma` | Connexion OK au boot |
| `Backend listening` | API écoute sur `PORT` |
| `Health endpoints ready` | `/health` et `/ready` montés |
| `Failed to start backend` | Env ou Prisma au démarrage |

Format JSON structuré (`level`, `message`, `timestamp`, `requestId` sur les requêtes API).

## À ne pas faire

- Exposer `DATABASE_URL` ou clés Stripe dans des tickets / dashboards publics
- Utiliser `/health` seul pour un load balancer de trafic métier (préférer `/ready`)
- Désactiver Postgres en prod sans drain des connexions
- Ajouter des secrets dans les réponses health/readiness

## Limites actuelles

- Pas de Prometheus / Grafana / Sentry / Datadog
- Pas de métriques request rate, latence p99, etc.
- Stripe readiness = **config locale** uniquement (pas de ping API Stripe)
- Docker healthcheck dev utilise `/health` (liveness), pas `/ready`

## Références

- `docs/features/S1-5-T8-monitoring-health-hardening.md`
- `docs/runbooks/stripe-webhook-failures.md`
