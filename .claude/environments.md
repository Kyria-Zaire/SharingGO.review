> **Quand :** `.env`, docker-compose, deploy, backups, rabattages REC, Stripe par env

# Environments — Sharing Go

`APP_ENV=dev|recette|preprod|prod` · schéma **imposé** (CDC §5.1).

## Matrice

| Env | DB | Données | Paiement (Stripe) | Accès |
|-----|-----|---------|-------------------|--------|
| **DEV** | PostgreSQL Docker local | Faker + quelques users réels (dev) | Test — `4242 4242 4242 4242` · Stripe CLI | localhost |
| **REC** | PostgreSQL VPS conteneur dédié | Snapshot PROD anonymisé (hebdo) | Test + simulation 3D Secure | Équipe interne, VPN |
| **PREPROD** | PostgreSQL VPS réplica | Clone PROD (pré-migration) | **Live** — webhook vers copie/endpoint test | QA + lead dev |
| **PROD** | PostgreSQL VPS + backup auto | Données réelles | Live + webhook réel | Clients finaux |

## Database rule

Une DB par env. Jamais partager entre envs.

| Direction | Statut |
|-----------|--------|
| PROD anonymisé → REC / PREPROD | ✅ |
| DEV / REC / PREPROD → PROD | ❌ |

## Backup (PROD)

- Chaque soir : backup auto PROD → autre VPS ou S3-compatible
- `restore-backup.sh` pour restaurer le dernier backup
- Test restore mensuel

## Rabattages

- Job **hebdo** (cron ou GitHub Action) : recréer **REC** depuis PROD
- Anonymisation SQL : emails, numéros carte, données sensibles
- PREPROD : clone PROD avant migrations majeures

## Stripe

- DEV / REC : mode test uniquement
- PREPROD : live + webhook test (pas handler PROD)
- PROD : live + webhook production
- Jamais simuler paiement réussi en SQL

Voir : `ingenieur.md` · `createur-workflow.md` · `security-baseline.md`
