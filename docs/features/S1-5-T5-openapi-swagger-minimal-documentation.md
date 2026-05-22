# S1.5-T5 — OpenAPI / Swagger Minimal Documentation

Documentation API **lecture seule** pour accélérer frontend, mobile et intégrations admin.

## Objectif

Réduire la dette de compréhension avant Sprint 2 (QR, abonnements, dashboard) sans modifier la logique métier.

## Accès

| Route | Description |
|-------|-------------|
| `GET /api/docs` | Swagger UI |
| `GET /api/docs.json` | Spécification OpenAPI 3.0.3 (JSON) |

Contrôle : variable `ENABLE_API_DOCS`

| Environnement | Comportement par défaut |
|---------------|-------------------------|
| `development` | **activé** (`true`) si variable absente |
| `production` | **désactivé** (`false`) si variable absente |
| Override | `ENABLE_API_DOCS=true` ou `false` |

## Fichiers

| Fichier | Rôle |
|---------|------|
| `backend/src/docs/openapi.json` | Source de vérité runtime |
| `backend/src/docs/openapi.ts` | Chargement pour Express |
| `backend/src/routes/docs.routes.ts` | Routes `/api/docs` + Swagger UI |
| `docs/api/openapi.json` | Copie miroir pour revue / outils externes |

## Stack

- **OpenAPI 3.0.3** statique (pas de swagger-jsdoc)
- **swagger-ui-express** pour l’UI uniquement
- Pas de génération SDK (hors scope)

## Contenu documenté

- Tags : Health, Auth, Public Trips, Reservations, Payments, Admin Lines/Trips/Operations, Webhooks
- Schéma `cookieAuth` (`sharinggo_session`)
- `ErrorResponse` standard + codes fréquents
- Rate limits S1.5-T4 (notes dans la description)
- Webhook Stripe : **Stripe-only**, pas pour le frontend
- Schémas admin : refs Stripe **courtes** (`pi_xxx...abcd`), pas d’IDs complets dans les exemples publics

## Maintenance

1. Modifier `backend/src/docs/openapi.json` pour refléter l’API **réelle**
2. Copier vers `docs/api/openapi.json` si revue externe
3. Rebuild Docker backend après changement
4. Vérifier `GET /api/docs.json` et Swagger UI

Ne pas inventer de routes non implémentées.

## Tests rapides

```powershell
curl.exe http://localhost:3000/api/docs.json
curl.exe -o NUL -w "%{http_code}" http://localhost:3000/api/docs
curl.exe http://localhost:3000/health
```

Désactivation :

```env
ENABLE_API_DOCS=false
```

Puis `docker compose -f docker-compose.dev.yml up -d --force-recreate backend` → `/api/docs` doit répondre 404.

## Limites connues

- Spec manuelle : peut diverger si routes changent sans mise à jour JSON
- Pas de génération automatique depuis Zod/Prisma
- Cookie auth : tester depuis Swagger UI nécessite login préalable (credentials)

## Future

- Génération partielle depuis schémas Zod
- SDK TypeScript (openapi-generator)
- Publication docs staging protégée
