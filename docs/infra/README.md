# Infrastructure

Références :

- CDC §5.1 — DEV / REC / PREPROD / PROD
- `.cursor/rules/environments.mdc`
- `.cursor/rules/ingenieur.mdc` · `createur-workflow.mdc`

## Runbooks

| Document | Statut | Rôle |
|----------|--------|------|
| [`docs/ops/DEPLOY-01-RUNBOOK.md`](../ops/DEPLOY-01-RUNBOOK.md) | **DRAFT v0.1** | Déploiement VPS · TLS · migrations · backup · rollback · PILOT-01 |
| [`docs/ops/PILOT-readiness.md`](../ops/PILOT-readiness.md) | Actif | Bloquants métier avant pilote |
| [`docs/runbooks/ops-health-monitoring.md`](../runbooks/ops-health-monitoring.md) | Actif | Santé services (dev) |

À compléter en DEPLOY-01 : `docker-compose.prod.yml`, `scripts/backup-prod.sh`, `scripts/restore-backup.sh`, rabattage REC hebdo.
