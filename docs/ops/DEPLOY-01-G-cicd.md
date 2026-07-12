# DEPLOY-01-G — CI/CD GitHub Actions

> Pipelines de CI et de déploiement production SharingGO.

---

## 1. Architecture des deux workflows

```
.github/workflows/
├── ci.yml       — CI : lint + build sur push/PR toutes branches
└── deploy.yml   — Deploy : gate + SSH VPS sur tag v*.*.* uniquement
```

### ci.yml — Intégration continue

| Déclencheur | Jobs | Déploiement |
|-------------|------|-------------|
| `push` toutes branches | lint-build-backend (parallel) | **Jamais** |
| `pull_request` toutes branches | lint-build-passenger (parallel) | |
| | lint-build-admin (parallel) | |

**Objectif :** détecter les régressions lint/build dès le push, avant toute revue de code.

### deploy.yml — Déploiement production

| Déclencheur | Jobs | Séquence |
|-------------|------|----------|
| `push tag v*.*.*` | gate-backend | Séquentiel : gate → deploy → notify |
| | gate-passenger | |
| | gate-admin | |
| | **deploy** (SSH VPS) | |
| | notify (always) | |

**Principe :** le gate lint+build doit passer en totalité avant tout contact SSH avec le VPS.

```
Tag poussé
    ↓
gate-backend ──┐
gate-passenger ├─ (parallèles) → TOUS OK ?
gate-admin ────┘
    ↓ oui
deploy (SSH VPS)
    ├── [1] Vérification repo propre
    ├── [2] git checkout TAG
    ├── [3] backup-postgres.sh
    ├── [4] check-backup.sh
    ├── [5] docker compose up --build (SENTRY_RELEASE=TAG)
    ├── [6] docker compose ps + sleep 30
    └── [7] curl /health + /ready
    ↓
notify (résumé GitHub Summary — toujours)
```

---

## 2. Secrets GitHub Actions à créer

**Aller dans :** GitHub → Settings → Secrets and variables → Actions → New repository secret

| Secret | Valeur | Sensibilité |
|--------|--------|-------------|
| `VPS_HOST` | IP ou hostname du VPS Hetzner | Faible |
| `VPS_USER` | `deploy` (utilisateur SSH non-root) | Faible |
| `VPS_SSH_KEY` | Contenu de la clé privée ED25519 dédiée | **Élevée** |

**Aucun secret applicatif dans GitHub Actions.** Stripe, Sentry, DB, Google OAuth — tous dans `/opt/sharinggo/.env.prod` sur le VPS.

### 2.1 Création de la clé SSH dédiée au déploiement

```bash
# En local — générer une clé ED25519 dédiée (pas la clé personnelle)
ssh-keygen -t ed25519 -C "github-actions-deploy@sharinggo" \
  -f ~/.ssh/sharinggo_deploy
# Laisser la passphrase vide (GitHub Actions ne peut pas saisir de passphrase)

# Afficher la clé publique
cat ~/.ssh/sharinggo_deploy.pub
# → copier cette ligne dans authorized_keys sur le VPS

# Afficher la clé privée
cat ~/.ssh/sharinggo_deploy
# → copier le contenu complet dans GitHub Secrets → VPS_SSH_KEY
```

### 2.2 Installation de la clé publique sur le VPS

```bash
# Sur le VPS — ajouter la clé publique GitHub Actions
ssh deploy@<IP_VPS>
echo "ssh-ed25519 AAAA... github-actions-deploy@sharinggo" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Tester depuis une machine locale avec la clé privée
ssh -i ~/.ssh/sharinggo_deploy deploy@<IP_VPS> "echo OK"
# Attendu : OK (sans demande de passphrase)
```

### 2.3 Ajout dans GitHub

```
GitHub → Settings → Secrets and variables → Actions → New repository secret

Nom : VPS_SSH_KEY
Valeur : (coller le contenu complet de ~/.ssh/sharinggo_deploy, y compris les lignes -----BEGIN...-----)
```

---

## 3. Procédure de déploiement standard

```bash
# 1. S'assurer que main est dans l'état voulu
git log --oneline -5

# 2. Créer et pousser le tag (déclenche deploy.yml)
git tag v0.1.0
git push origin v0.1.0

# 3. Suivre le déploiement
# GitHub → Actions → Deploy Production → run en cours
```

**Le workflow s'exécute automatiquement.** Ne pas intervenir sur le VPS pendant l'exécution.

### 3.1 Surveiller un déploiement en cours

```
GitHub → Actions → Deploy Production → cliquer sur le run
  → gate-backend / gate-passenger / gate-admin : doivent être verts
  → deploy : suivre les étapes SSH en temps réel
  → notify : résumé final avec statut et lien logs
```

### 3.2 SENTRY_RELEASE

`SENTRY_RELEASE` est injecté directement dans la commande `docker compose up` :

```bash
SENTRY_RELEASE="v0.1.0" docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Il **ne modifie pas** `.env.prod`. Cela permet à Sentry de relier les événements au tag exact déployé. En cas de rollback, l'injecter avec le tag du rollback.

---

## 4. Gestion du repo sale sur VPS

Si le workflow échoue avec le message `ERREUR : fichiers versionnés modifiés localement sur le VPS` :

```bash
# 1. Se connecter au VPS
ssh deploy@<IP_VPS>

# 2. Identifier le fichier modifié
git -C /opt/sharinggo status

# 3a. Si modification involontaire (fichier écrasé par erreur)
git -C /opt/sharinggo checkout -- <fichier>

# 3b. Si modification à conserver (ex: correction urgente appliquée en direct)
git -C /opt/sharinggo stash
# → intégrer la modification dans un commit/PR sur GitHub avant le prochain déploiement

# 4. Vérifier que le repo est propre
git -C /opt/sharinggo status --short -- ':!.env.prod' ':!backups/'
# Résultat attendu : aucune ligne

# 5. Relancer le déploiement
# Option A : pousser un nouveau tag (déconseillé pour le même commit)
# Option B : lancer manuellement depuis GitHub Actions → "Re-run failed jobs"
```

**Note :** `.env.prod` est exclu du check (`':!.env.prod'`). C'est le seul fichier local légitime non versionné dans `/opt/sharinggo/`. Les backups sont dans `/opt/sharinggo/backups/` et gitignorés.

---

## 5. Procédure de rollback manuel

À utiliser quand `/health` ou `/ready` échouent après un déploiement, ou quand une régression critique est détectée.

```bash
# 1. Se connecter au VPS
ssh deploy@<IP_VPS>
cd /opt/sharinggo

# 2. Vérifier l'état repo
git status --short -- ':!.env.prod' ':!backups/'
# Doit être propre (le déploiement échoué a quand même checké le tag)

# 3. Identifier le tag stable précédent
git tag --sort=-version:refname | head -10
# Ex: v0.1.0, v0.0.9, v0.0.8...

# 4. Backup de l'état actuel (même si la DB est probablement identique au backup pré-deploy)
./scripts/backup-postgres.sh

# 5. Checkout du tag stable
git checkout vX.Y.Z

# 6. Redéployer avec le tag de rollback comme SENTRY_RELEASE
SENTRY_RELEASE="vX.Y.Z" docker compose \
  -f docker-compose.prod.yml \
  --env-file .env.prod \
  up -d --build

# 7. Vérifier
curl --fail https://api.sharinggo.fr/health
curl --fail https://api.sharinggo.fr/ready

# 8. Enregistrer le rollback dans deployments (table PostgreSQL)
docker compose -f docker-compose.prod.yml exec backend \
  npx prisma db execute --stdin << 'SQL'
INSERT INTO deployments (commit_hash, app_env, deployed_by)
VALUES ('vX.Y.Z-rollback', 'prod', 'ops-manual-rollback');
SQL
```

### 5.1 Rollback avec restauration DB (migration échouée)

Si la migration Prisma a partiellement altéré le schéma :

```bash
# Voir DEPLOY-01-BACKUP-RESTORE.md § 6 pour la procédure complète
./scripts/restore-postgres.sh /opt/sharinggo/backups/sharinggo_<pré-deploy>.sql.gz
# Entrer 'RESTORE' à la confirmation
# Puis redéployer le tag N-1 (étapes 5-7 ci-dessus)
```

---

## 6. Diagnostic post-déploiement (workflow échoué)

### 6.1 Workflow échoue au gate

```
Cause : lint ou build cassé dans backend, passenger, ou admin
Action : corriger le problème → commit → nouveau tag
         NE PAS pousser le même tag (les tags Git sont immuables)
         git tag -d vX.Y.Z && git push origin :vX.Y.Z  # supprimer le tag existant
         git tag vX.Y.Z && git push origin vX.Y.Z       # recréer
```

### 6.2 Workflow échoue au backup

```
Causes possibles :
  - DATABASE_URL incorrect dans .env.prod
  - Service postgres Docker arrêté
  - Espace disque insuffisant dans /opt/sharinggo/backups/

Actions :
  ssh deploy@<IP_VPS>
  docker compose -f docker-compose.prod.yml ps postgres
  df -h /opt/sharinggo/backups/
  bash scripts/check-disk.sh /opt/sharinggo
```

### 6.3 Workflow échoue au healthcheck post-deploy

```
Actions :
  ssh deploy@<IP_VPS>
  cd /opt/sharinggo

  # Logs backend (erreur de démarrage ?)
  docker compose -f docker-compose.prod.yml logs --tail=50 backend

  # Logs migrator (migration échouée ?)
  docker compose -f docker-compose.prod.yml logs migrator

  # État des containers
  docker compose -f docker-compose.prod.yml ps

  # Si migrator en erreur → restore backup pré-deploy + rollback tag N-1
  # Voir DEPLOY-01-BACKUP-RESTORE.md § 6
```

---

## 7. Checklist pré-déploiement

À vérifier avant chaque `git tag` :

- [ ] `.env.prod` à jour sur le VPS — nouveaux secrets si ce tag en ajoute
- [ ] DNS configurés et propagés (`dig sharinggo.fr` → IP VPS)
- [ ] Stripe webhook endpoint prod créé et secret `whsec_*` dans `.env.prod`
- [ ] Google OAuth redirect URIs prod configurés dans Google Cloud Console
- [ ] UptimeRobot monitors actifs (4 monitors verts)
- [ ] Sentry projet configuré — `SENTRY_DSN` dans `.env.prod` — `test-sentry.mjs` OK
- [ ] Espace disque VPS > 20% libre (`check-disk.sh`)
- [ ] Pas de migration destructive sans plan de rollback DB documenté
- [ ] Repo VPS propre : `git -C /opt/sharinggo status --short -- ':!.env.prod' ':!backups/'` → rien
- [ ] Backup manuel récent vérifié : `check-backup.sh` → VALIDE

---

## 8. Validation post-création VPS (DEPLOY-01-H)

Les workflows GitHub Actions ne peuvent pas être testés sans VPS réel. À valider lors de DEPLOY-01-H :

- [ ] Secret `VPS_SSH_KEY` : connexion SSH sans passphrase depuis GitHub Actions
- [ ] `VPS_HOST` et `VPS_USER` : runner peut atteindre le VPS (firewall 22 ouvert pour GitHub Actions IPs)
- [ ] Dirty check : modifier un fichier sur le VPS → déclencher un deploy → vérifier que le workflow échoue avec le bon message
- [ ] Backup dans la séquence : vérifier que le fichier `.sql.gz` est créé et validé avant `docker compose up`
- [ ] Healthchecks : `curl --fail --retry 3` vers `/health` et `/ready` depuis le runner GitHub
- [ ] `SENTRY_RELEASE` : vérifier dans Sentry Dashboard que la release `vX.Y.Z` apparaît sur les événements post-déploiement

---

## 9. Documents liés

| Document | Rôle |
|----------|------|
| `docs/ops/DEPLOY-01-RUNBOOK.md` § CI/CD | Procédures dans le runbook |
| `docs/ops/DEPLOY-01-BACKUP-RESTORE.md` § 6 | Rollback migration Prisma |
| `docs/ops/DEPLOY-01-SECRETS.md` | Variables dans `.env.prod` (pas dans GitHub Actions) |
| `.github/workflows/ci.yml` | Workflow CI |
| `.github/workflows/deploy.yml` | Workflow déploiement |
| `scripts/backup-postgres.sh` | Appelé dans la séquence SSH |
| `scripts/check-backup.sh` | Appelé dans la séquence SSH |
