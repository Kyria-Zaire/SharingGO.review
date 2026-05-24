# F3-T6 — System Health & Operational Monitoring

## Objectif

Page admin `/monitoring` : sondes liveness/readiness, manifest boarding offline, runbooks ops. Frontend uniquement — aucune modification backend.

## Endpoints consommés

| Méthode | Route | Usage |
|---------|-------|--------|
| GET | `/health` | Liveness (process vivant) |
| GET | `/ready` | Readiness (200 ou 503 + body) |
| GET | `/api/boarding/offline-capabilities` | Manifest ONLINE_FIRST / offline V1 |

## Alive vs Ready

| Sonde | Signification | Priorité UI |
|-------|---------------|-------------|
| `/health` | Process démarré | Secondaire |
| `/ready` | Exploitable (DB, config, Stripe) | **Principale** |

Readiness affiché en carte héro ; liveness en carte compacte.

## Statuts visuels

`MonitoringStatus` extensible :

- `ok` → vert
- `warning` → orange
- `error` → rouge
- `unknown` → gris
- `degraded` → réservé futur (non implémenté)

## UNKNOWN fallback

`UNKNOWN` si : timeout (~8s), réseau, JSON invalide, champs absents.

`ERROR` si : `not_ready` explicite ou check `error`.

## Ordre des checks (Readiness card)

1. API READY
2. Database
3. Configuration
4. Stripe
5. Offline mode (manifest)

## Last updated

`Last updated: HH:mm:ss` (locale `fr-FR`) — mis à jour après chaque fetch réussi ou tentative refresh.

## Timeout UX

Après ~6s de fetch : message **« Monitoring response delayed »** (distinct de UNKNOWN).

## Refresh

- `staleTime: 30_000`
- Bouton Actualiser + cooldown **~2s** (anti-spam)
- Pas de polling agressif / websocket

## Monitoring unavailable

Si `/health` et `/ready` sont tous deux `UNKNOWN` :

- Carte **Monitoring unavailable** + retry
- **Runbooks toujours visibles** en bas de page

## Runbooks

- `docs/runbooks/stripe-webhook-failures.md` — **critical billing**, style warning prioritaire
- `docs/runbooks/ops-health-monitoring.md`
- `docs/runbooks/boarding-offline-mode.md`

Liens GitHub blob (repo `SharingGO.review`).

## Sécurité

Aucun secret affiché : pas de `DATABASE_URL`, clés Stripe, cookies, env brut.

## Composants

| Composant | Rôle |
|-----------|------|
| `ReadinessChecksCard` | Indicateur principal |
| `SystemHealthCard` | Liveness |
| `OfflineModeCard` | Manifest boarding |
| `OpsRunbooksCard` | Liens runbooks |
| `HealthStatusBadge` | OK / WARNING / ERROR / UNKNOWN / DEGRADED |
| `MonitoringLastUpdated` | Horodatage local |
| `MonitoringUnavailableCard` | Fallback total |

Fichiers : `api/system.api.ts`, `types/system.types.ts`, `pages/MonitoringPage.tsx`.

## Limitations F3-T6

- Pas de Prometheus / Sentry / Grafana
- Pas de log viewer / webhook viewer
- Pas de polling temps réel
- Pas de statut DEGRADED métier (types préparés)

## Futur

- `DEGRADED` (Stripe lent, DB lente)
- Alertes externes, uptime monitor
- Intégration Sentry / métriques

## Test manuel

1. Backend up → `/monitoring` : READY OK, checks verts/orange offline
2. Arrêter backend → Monitoring unavailable + runbooks visibles
3. Refresh + cooldown 2s
4. Last updated se met à jour
