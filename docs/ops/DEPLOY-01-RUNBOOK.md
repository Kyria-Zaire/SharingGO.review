# DEPLOY-01 — Runbook de déploiement SharingGO

**Status :** DRAFT (DEPLOY-01 en cours)  
**Owner :** CTO / Ops  
**Last updated :** 2026-06-27  
**Version :** v0.8  
**Prérequis :** DEPLOY-READY-01 **DONE** · validation CTO « Produit prêt pour DEPLOY-01 »

> **Ce document n'est pas encore opérationnel.** Il sera complété pendant DEPLOY-READY-01 et finalisé en entrée de DEPLOY-01.  
> Références : [`docs/CAHIER_DES_CHARGES.md`](../CAHIER_DES_CHARGES.md) §5.1 · [`.cursor/rules/environments.mdc`](../../.cursor/rules/environments.mdc) · [`docs/infra/README.md`](../infra/README.md)

---

## 1. Objectif

Fournir la procédure opérationnelle unique pour :

- provisionner et sécuriser l'infrastructure VPS ;
- déployer backend + frontends (admin + passager) ;
- migrer la base de données sans perte ;
- sauvegarder et restaurer ;
- rollback en cas d'échec ;
- vérifier le système après déploiement ;
- ouvrir un pilote contrôlé (PILOT-01).

**Hors scope de ce runbook :** développement fonctionnel · hardening frontend (→ DEPLOY-READY-01).

---

## 2. Architecture cible (V1)

```text
Internet
    │
    ▼
[Nginx — TLS termination]
    │
    ├── /              → Frontend passager (static Vite build)
    ├── /admin         → Frontend admin (static Vite build)   [à confirmer routing]
    └── /api           → Backend Express (Docker)
                              │
                              ▼
                        [PostgreSQL — volume persistant]
```

| Composant | Stack | Notes |
|-----------|-------|-------|
| VPS | Hetzner / OVH / équivalent | 1 VPS minimum PROD · REC/PREPROD isolés (CDC §5.1) |
| Orchestration | Docker Compose | `docker-compose.prod.yml` — **à créer en DEPLOY-01** |
| Reverse proxy | Nginx | HTTPS · rate limit · headers sécurité |
| CI/CD | GitHub Actions → VPS | Build · test · deploy sur tag/commit validé |
| Observabilité | Logs structurés · `/health` · `/ready` | Voir S1-5-T8 |

---

## 3. Prérequis VPS

### 3.1 Matériel & OS

| Item | Spécification | Statut |
|------|---------------|--------|
| OS | Ubuntu LTS 22.04+ (recommandé) | ⬜ |
| CPU / RAM | À dimensionner (pilote : 2 vCPU / 4 GB min — **à valider**) | ⬜ |
| Disque | SSD · volume Postgres séparé recommandé | ⬜ |
| Accès | SSH clé · pas de root password | ⬜ |
| Firewall | 22 (SSH restreint) · 80 · 443 uniquement | ⬜ |
| Utilisateur deploy | Compte dédié non-root + sudo limité | ⬜ |

### 3.2 Logiciels sur le VPS

| Logiciel | Version | Statut |
|----------|---------|--------|
| Docker Engine | Latest stable | ⬜ |
| Docker Compose plugin | v2+ | ⬜ |
| Certbot (Let's Encrypt) | — | ⬜ |
| fail2ban (optionnel) | — | ⬜ |

### 3.3 DNS & domaines

| Hostname | Env | Usage | Statut |
|----------|-----|-------|--------|
| `app.sharinggo.fr` (exemple) | PROD | Passager | ⬜ à définir — **canonique produit : `sharinggo.fr`** |
| `admin.sharinggo.fr` (exemple) | PROD | Admin | ⬜ à définir |
| `api.sharinggo.fr` (exemple) | PROD | API | ⬜ à définir |
| `staging.*` | STAGING/PREPROD | QA · `robots.txt` Disallow | ⬜ |

> Décision domaine finale : **CTO** — à documenter ici avant DEPLOY-01.

---

## 4. Environnements

Matrice imposée (CDC §5.1) :

| Env | `APP_ENV` | DB | Stripe | Accès |
|-----|-----------|-----|--------|-------|
| DEV | `dev` | Docker local | Test | localhost |
| REC | `recette` | VPS conteneur dédié | Test + 3DS simulé | VPN équipe |
| PREPROD | `preprod` | VPS réplica dédié | Live + webhook test | QA + lead dev |
| PROD | `prod` | VPS + backup auto | Live + webhook réel | Clients finaux |

**Règle absolue :** une DB par environnement · jamais DEV/REC/PREPROD → PROD.

---

## 5. Variables d'environnement

Source de référence : [`.env.example`](../../.env.example) · `frontend/apps/passenger/.env.example`

### 5.1 Backend — obligatoires PROD

| Variable | Description | Secret | Statut doc |
|----------|-------------|--------|------------|
| `APP_ENV` | `prod` | Non | ⬜ |
| `NODE_ENV` | `production` | Non | ⬜ |
| `DATABASE_URL` | Postgres prod (host interne Docker) | **Oui** | ⬜ |
| `SESSION_SECRET` | ≥ 32 caractères aléatoires | **Oui** | ⬜ |
| `JWT_PRIVATE_KEY` / secrets boarding | QR JWT HS256 | **Oui** | ⬜ |
| `BOARDING_JWT_SECRET` | Signature QR embarquement | **Oui** | ⬜ |
| `STRIPE_SECRET_KEY` | `sk_live_*` en PROD | **Oui** | ⬜ |
| `STRIPE_WEBHOOK_SECRET` | Distinct par env · endpoint prod | **Oui** | ⬜ |
| `STRIPE_*_URL` | Success/cancel URLs domaine prod | Non | ⬜ |
| `GOOGLE_CLIENT_ID` / `SECRET` | OAuth convoyeur | **Oui** | ⬜ |
| `GOOGLE_CALLBACK_URL` | HTTPS prod | Non | ⬜ |
| `CLOUDFLARE_TURNSTILE_*` | Inscription · login · paiement | **Oui** | ⬜ |
| `CORS_ORIGIN` | Whitelist domaines front (pas `*`) | Non | ⬜ |
| `FRONTEND_URL` / `API_URL` | URLs publiques HTTPS | Non | ⬜ |
| `ENABLE_API_DOCS` | `false` en PROD | Non | ⬜ |
| `ALLOW_DEMO_SEED` | `false` en PROD/PREPROD | Non | ⬜ |

### 5.2 Frontend passager (build-time Vite)

| Variable | PROD | Statut doc |
|----------|------|------------|
| `VITE_API_URL` | `https://api.<domaine>` | ⬜ |
| `VITE_ENABLE_UI_DEMO_TRIPS` | **ABSENT** (module supprimé DEPLOY-READY-01) | ⬜ |

### 5.3 Stockage des secrets

| Méthode | Recommandation | Statut |
|---------|----------------|--------|
| Fichier `.env` sur VPS | Permissions `600` · propriétaire deploy | ⬜ |
| GitHub Actions Secrets | Pour CI/CD uniquement | ⬜ |
| Jamais en repo | `.env` gitignored · secret scanning | ✅ imposé |

---

## 6. Certificats TLS

### 6.1 Let's Encrypt (Certbot)

```bash
# SQUELETTE — à valider en DEPLOY-01
# certbot certonly --nginx -d app.example.com -d api.example.com
```

| Item | Procédure | Statut |
|------|-----------|--------|
| Émission initiale | Certbot + Nginx | ⬜ |
| Renouvellement auto | Cron systemd / certbot timer | ⬜ |
| Test SSL | SSL Labs / `curl -vI https://` | ⬜ |
| HSTS | Header Nginx (après validation) | ⬜ |

### 6.2 Nginx — headers sécurité

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- Cookies : `Secure` · `HttpOnly` · `SameSite`

Référence : `security-baseline.mdc` · Helmet backend.

---

## 7. Procédure de déploiement initial

### 7.0 Provisionnement VPS (DEPLOY-01-D)

Séquence obligatoire avant toute tentative de démarrage des services.

```bash
# Étape 1 — Se connecter au VPS
ssh deploy@<IP_VPS>

# Étape 2 — Exécuter le script de provisionnement (depuis le repo cloné)
bash scripts/provision-vps.sh
# Crée /opt/sharinggo/, clone le repo si absent, crée .env.prod vide chmod 600,
# crée /opt/sharinggo/backups/

# Étape 3 — Générer les secrets applicatifs (en local ou sur le VPS)
bash scripts/generate-secrets.sh
# Affiche SESSION_SECRET, JWT_PRIVATE_KEY, BOARDING_JWT_SECRET, POSTGRES_PASSWORD
# Ne stocke rien — copier manuellement les valeurs dans .env.prod

# Étape 4 — Remplir /opt/sharinggo/.env.prod avec toutes les valeurs
nano /opt/sharinggo/.env.prod
# Sources : scripts/generate-secrets.sh + Dashboard Stripe (Live) + Google Cloud Console

# Étape 5 — Vérifier qu'aucun placeholder ne subsiste
grep "CHANGEME" /opt/sharinggo/.env.prod
# Résultat attendu : aucune ligne

# Étape 6 — Appliquer les permissions
chmod 600 /opt/sharinggo/.env.prod

# Étape 7 — Valider la configuration Docker Compose
cd /opt/sharinggo
docker compose -f docker-compose.prod.yml --env-file .env.prod config --quiet
# Résultat attendu : exit 0, aucune erreur bloquante

# NE PAS poursuivre si une variable [R] reste CHANGEME ou si config exit ≠ 0
```

| Variable critique | Statut | Bloquant si absent |
|-------------------|--------|--------------------|
| `BOARDING_JWT_SECRET` | **[R]** | Oui — backend refuse au démarrage |
| `STRIPE_SECRET_KEY` | **[R]** | Oui — doit commencer par `sk_live_` |
| `STRIPE_WEBHOOK_SECRET` | **[R]** | Oui — doit commencer par `whsec_` |
| `GOOGLE_CLIENT_ID` | **[R]** | Oui — doit finir par `.apps.googleusercontent.com` |
| `DATABASE_URL` | **[R]** | Oui — connexion Postgres impossible |
| `SESSION_SECRET` | **[NON UTILISÉ V1]** | Non — cookies opaques hashés DB, pas express-session |
| `JWT_PRIVATE_KEY` | **[NON UTILISÉ V1]** | Non — réservé migration RS256/EdDSA boarding (S2+) |

Référence complète : `docs/ops/DEPLOY-01-SECRETS.md`

### 7.1 Pré-déploiement

- [ ] DEPLOY-READY-01 **DONE** · rapport clôture validé CTO
- [ ] Commit / tag GitHub identifié (`deployments.commit_hash`)
- [ ] Backup DB existante (si re-deploy) ou base vide provisionnée
- [ ] Variables d'environnement revues (checklist § 5)
- [ ] Stripe webhook endpoint prod créé · secret enregistré
- [ ] Google OAuth redirect URIs prod configurés
- [ ] Turnstile clés prod configurées

### 7.2 Build & push images

```bash
# SQUELETTE — pipeline GitHub Actions à documenter
# 1. pnpm lint && pnpm build (admin + passenger)
# 2. docker build backend
# 3. push registry OU build sur VPS depuis tag
```

| Étape | Commande / action | Statut |
|-------|-------------------|--------|
| Clone tag sur VPS | `git checkout <tag>` | ⬜ |
| Build images | `docker compose -f docker-compose.prod.yml build` | ⬜ |
| Pull si registry | — | ⬜ |

### 7.3 Migration base de données

```bash
# SQUELETTE — ordre imposé
# 1. Backup AVANT migration (§ 10)
# 2. docker compose exec backend npx prisma migrate deploy
# 3. Vérifier prisma_migrations
```

| Garde-fou | Règle |
|-----------|-------|
| Migration destructive | Backup obligatoire · revue humaine |
| Rollback schema | Redéployer commit précédent + restore backup si nécessaire |
| PREPROD | Toujours tester migration ici avant PROD |

### 7.4 Démarrage services

```bash
# SQUELETTE
# docker compose -f docker-compose.prod.yml up -d
```

| Service | Healthcheck | Endpoint |
|---------|-------------|----------|
| Postgres | `pg_isready` | interne |
| Backend | HTTP | `GET /health` · `GET /ready` |
| Nginx | — | `443` TLS |

### 7.5 Enregistrement déploiement

Insérer dans table `deployments` :

| Champ | Valeur |
|-------|--------|
| `commit_hash` | SHA du déploiement |
| `deployed_at` | Timestamp UTC |
| `app_env` | `prod` |
| `deployed_by` | Opérateur (optionnel) |

---

## 8. Monitoring

Référence complète : [`docs/ops/DEPLOY-01-F-monitoring.md`](./DEPLOY-01-F-monitoring.md)

### 8.1 Stack monitoring pilote

| Outil | Rôle | Statut |
|-------|------|--------|
| **UptimeRobot** | Healthchecks HTTP externes (4 monitors) | ⬜ à configurer DEPLOY-01-H |
| **Sentry** | Erreurs backend 5xx + exceptions non catchées | ✅ intégré DEPLOY-01-F (`backend/src/lib/sentry.ts`) |
| **Logs Docker** | Rotation json-file 10 MB × 5 par service | ✅ `docker-compose.prod.yml` |
| **check-disk.sh** | Alerte disque (seuil 80%/90%) | ✅ `scripts/check-disk.sh` |
| Grafana / Loki / Prometheus | Observabilité avancée | ⬜ backlog DEPLOY-02 |

### 8.2 Dashboards (à compléter après DEPLOY-01-H)

| Dashboard | URL | Statut |
|-----------|-----|--------|
| UptimeRobot | `https://uptimerobot.com/dashboard` | ⬜ à configurer |
| Sentry | `https://sentry.io/organizations/<org>/projects/sharinggo-backend/` | ⬜ à configurer |
| Stripe Webhooks | `https://dashboard.stripe.com/webhooks` | Manuel |

### 8.3 Checklist de vérification quotidienne (pilote)

```
Matin (< 5 min) :
  □ UptimeRobot dashboard : tous les monitors verts ?
  □ Sentry : nouvelles issues depuis hier ?
  □ Stripe Dashboard → Webhooks : évenements failed ?
  □ Logs disque : /var/log/sharinggo-disk.log → WARNING ou CRITICAL ?

En cas d'alerte :
  → Consulter matrice incidents DEPLOY-01-F-monitoring.md § 5.1
  → Suivre l'arbre de décision correspondant
  → Corrélation : requestId Sentry → logs Docker
```

### 8.4 Corrélation logs ↔ Sentry (requestId)

Chaque erreur Sentry est taguée `requestId`. Pour retrouver la requête :

```bash
# 1. Copier le requestId depuis l'événement Sentry (tag "requestId")
# 2. Chercher dans les logs Docker :
docker compose -f docker-compose.prod.yml logs backend | grep "<requestId>"
```

### 8.5 Checklist monitoring (pré-pilote)

- [ ] Compte UptimeRobot créé · 4 monitors configurés (§ 1 DEPLOY-01-F)
- [ ] `SENTRY_DSN` renseigné dans `.env.prod` · `test-sentry.mjs` → succès
- [ ] Logs Docker rotation vérifiée (`docker system df`)
- [ ] cron `check-disk.sh` installé sur le VPS
- [ ] Alerte email UptimeRobot testée (passer un monitor en pause → vérifier alerte)
- [ ] Alerte email Sentry configurée (premier événement par issue)
- [ ] Dashboard Stripe Webhooks accessible

Référence dev : [`docs/runbooks/ops-health-monitoring.md`](../runbooks/ops-health-monitoring.md) · S1-5-T8.

### Bundle passenger — monitoring (baseline P1-04)

| Métrique | Baseline 2026-06-26 | Seuil alerte |
|----------|---------------------|--------------|
| JS brut (`index-*.js`) | **827.63 kB** | Investigation si **> 900 kB** |
| JS gzip | **228.47 kB** | Investigation P1-05 code splitting si **> 300 kB** sans gain fonctionnel |

- Non bloquant pour pilote contrôlé DEPLOY-READY.
- Mesurer dès **J+1 pilote** sur réseau mobile réel (Lighthouse / WebPageTest ou équivalent).
- Source : [`DEPLOY-READY-P1-04-regression-qa.md`](../audits/DEPLOY-READY-P1-04-regression-qa.md) § 9.

---

## 9. Vérifications sécurité

> Gate opérationnelle avant et après chaque déploiement PROD/PREPROD.

| Contrôle | Vérification | Attendu | Statut |
|----------|--------------|---------|--------|
| **HTTPS forcé** | HTTP → 301 HTTPS | Aucun endpoint sensible en clair | ⬜ |
| **Headers** | Helmet backend · Nginx security headers | HSTS · X-Content-Type-Options · etc. | ⬜ |
| **CORS** | `CORS_ORIGIN` prod | Whitelist domaines · **pas** `*` | ⬜ |
| **Secrets** | Repo · VPS · CI | Aucun secret versionné · `.env` chmod 600 | ⬜ |
| **Ports exposés** | `ss` / firewall | Seuls 22 (restreint) · 80 · 443 publics | ⬜ |
| **Backup testé** | `backup-prod.sh` exécuté | Dump valide · taille cohérente | ⬜ |
| **Restore testé** | `restore-backup.sh` sur REC | DB restaurée · smoke test OK | ⬜ |

### Checklist sécurité pré-pilote

- [ ] `security-baseline.mdc` revue (rate limit · Turnstile · CSRF · webhooks)
- [ ] `VITE_ENABLE_UI_DEMO_TRIPS` absent tous environnements
- [ ] `ENABLE_API_DOCS=false` en PROD
- [ ] `ALLOW_DEMO_SEED=false` en PROD
- [ ] Scan secrets (GitHub · gitleaks) OK

Référence : `.cursor/rules/security-baseline.mdc` · CDC §5.2.

---

## 10. Sauvegardes

Référence complète : [`docs/ops/DEPLOY-01-BACKUP-RESTORE.md`](./DEPLOY-01-BACKUP-RESTORE.md)

### 10.1 Politique PROD

| Fréquence | Rétention | Destination | Statut |
|-----------|-----------|-------------|--------|
| Quotidienne (02h00) | 7 jours (rotation auto) | `/opt/sharinggo/backups/` | ✅ `scripts/backup-postgres.sh` |
| Hebdomadaire | 4 semaines | Même destination | ⬜ cron post-pilote |
| Mensuelle | 6 mois | Même destination | ⬜ cron post-pilote |
| Avant migration | 1 snapshot nommé | `/opt/sharinggo/backups/` | ✅ procédure obligatoire |
| Hors VPS (chiffré) | Idem | Hetzner Object Storage / Backblaze B2 | ⬜ post-pilote |
| Test restore | Mensuel | Environnement REC | ⬜ drill à planifier |

**RPO pilote :** 24 heures · **RTO pilote :** 30 minutes

### 10.2 Scripts

| Fichier | Rôle | Statut |
|---------|------|--------|
| `scripts/backup-postgres.sh` | Dump Postgres gzip + log + rotation 7j | ✅ créé DEPLOY-01-E |
| `scripts/restore-postgres.sh` | Restore depuis `.sql.gz` + confirmation | ✅ créé DEPLOY-01-E |
| `scripts/check-backup.sh` | Vérification intégrité archive | ✅ créé DEPLOY-01-E |

```bash
# Backup manuel
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/backup-postgres.sh

# Vérifier un backup
bash scripts/check-backup.sh /opt/sharinggo/backups/sharinggo_YYYY-MM-DD_HH-mm.sql.gz

# Restaurer (demande confirmation "OUI")
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/restore-postgres.sh /opt/sharinggo/backups/sharinggo_YYYY-MM-DD_HH-mm.sql.gz
```

### 10.3 Test de restore (mensuel — Restore Drill)

Procédure complète : `docs/ops/DEPLOY-01-BACKUP-RESTORE.md` § 4

- [ ] Vérifier intégrité backup (`check-backup.sh` → VALIDE)
- [ ] Backup pré-drill de l'état actuel
- [ ] Restaurer sur env REC
- [ ] Compter tables clés (users, trips, reservations)
- [ ] Smoke tests `GET /health` + `GET /ready`
- [ ] Consigner dans journal des drills (DEPLOY-01-BACKUP-RESTORE.md § 9)

---

## 11. Rollback

Référence complète : [`docs/ops/DEPLOY-01-BACKUP-RESTORE.md`](./DEPLOY-01-BACKUP-RESTORE.md) §§ 6-7

### 11.1 Quand rollback ?

- Healthcheck `/ready` en échec persistant (> 5 min)
- Erreur migration irrécupérable
- Régression critique détectée post-deploy (paiement, auth, boarding)

### 11.2 Procédure

```text
1. Identifier commit précédent stable (table deployments)
2. Arrêter trafic (maintenance Caddy — optionnel selon gravité)
3. Redéployer images / checkout tag précédent
4. Si migration appliquée : restore backup pré-migration (scripts/restore-postgres.sh)
5. Redémarrer services
6. Vérifications post-déploiement (§ 12)
7. Enregistrer rollback dans deployments + audit log admin
8. Post-mortem planifié avant re-tentative migration
```

| Scénario | Action | Référence |
|----------|--------|-----------|
| Rollback code seul | Re-deploy tag N-1 | § 13 runbook |
| Rollback code + DB | Restore backup + tag N-1 | DEPLOY-01-BACKUP-RESTORE.md § 6 |
| Migration Prisma échouée | Restore pré-migration + tag N-1 | DEPLOY-01-BACKUP-RESTORE.md § 6.2 |
| Migration réussie + régression | Restore pré-migration + tag N-1 | DEPLOY-01-BACKUP-RESTORE.md § 7.5 |
| Stripe webhook | Pas de suppression données · idempotence `webhook_events` | ✅ imposé |

---

## 12. Vérifications post-déploiement

### 12.1 Smoke tests automatisés / manuels

| # | Vérification | Attendu |
|---|--------------|---------|
| 1 | `GET /health` | `200` · `{"status":"ok"}` |
| 2 | `GET /ready` | `200` · DB connectée |
| 3 | `GET /` (passager) | **200** · page d'accueil · pas d'erreur console |
| 4 | `GET /robots.txt` | **200** · PREPROD/STAGING : `Disallow: /` · PROD : `Allow: /` + `Sitemap: https://sharinggo.fr/sitemap.xml` |
| 5 | `GET /favicon.ico` | **200** |
| 6 | `GET /apple-touch-icon.png` | **200** |
| 7 | `GET /icon-192.png` | **200** |
| 8 | `GET /icon-512.png` | **200** |
| 9 | TLS | Certificat valide · pas de mixed content |
| 10 | OAuth Google | Login convoyeur OK |
| 11 | Stripe webhook | Event test Dashboard → `200` |
| 12 | Réservation test | Pending → checkout → CONFIRMED (compte pilote) |
| 13 | QR boarding | JWT généré · expiration cohérente |
| 14 | Rate limiting | 429 après seuil (spot check) |
| 15 | CORS | Origine prod autorisée · `*` absent |
| 16 | Pas de mode démo | Aucun `demo-trip-*` · variable démo absente |
| 17 | Liens internes passager | `cd frontend/apps/passenger && pnpm audit:links` → exit **0** · FAIL **0** |

**Assets racine passager (smoke HTTP — tous `200`) :**

```text
GET /
GET /robots.txt
GET /favicon.ico
GET /apple-touch-icon.png
GET /icon-192.png
GET /icon-512.png
```

**robots.txt — build PROD (DEPLOY-READY P0-06) :**

```bash
cd frontend/apps/passenger
ROBOTS_POLICY=allow PUBLIC_SITE_URL=https://sharinggo.fr pnpm build
```

Hors PROD : `ROBOTS_POLICY=disallow` (défaut · `prebuild` automatique).

**Commande officielle audit liens (pré-déploiement & CI) :**

```bash
cd frontend/apps/passenger
pnpm audit:links
```

Script : `frontend/apps/passenger/scripts/audit-internal-links.mjs` — vérifie routes, ancres FAQ Contact→Help, footer légal, absence de liens démo. Introduit en DEPLOY-READY **P0-03**.

Script : `frontend/apps/passenger/scripts/generate-robots.mjs` — `pnpm generate:robots` · politique Q3 (disallow hors prod). Introduit en DEPLOY-READY **P0-06**.

### 12.2 Observabilité

| Signal | Où | Statut |
|--------|-----|--------|
| Logs backend | stdout Docker · rotation | ⬜ |
| Erreurs 5xx | À centraliser (Sentry / Loki — **à décider**) | ⬜ |
| Uptime | Healthcheck externe (UptimeRobot / équivalent) | ⬜ |
| Stripe Dashboard | Paiements · webhooks failed | ⬜ |

---

## 12b. CI/CD GitHub Actions (DEPLOY-01-G)

Référence complète : [`docs/ops/DEPLOY-01-G-cicd.md`](./DEPLOY-01-G-cicd.md)

### Déploiement standard

```bash
git tag v0.1.0
git push origin v0.1.0
# → GitHub Actions déclenché automatiquement (deploy.yml)
# → Suivre : GitHub → Actions → Deploy Production
```

### Workflow échoue au gate (lint/build)

```
Corriger le problème → commit → nouveau tag
(Les tags Git sont immuables — ne pas pousser le même tag)
```

### Workflow échoue avec "repo sale"

```bash
ssh deploy@<IP_VPS>
git -C /opt/sharinggo status
git -C /opt/sharinggo checkout -- <fichier>   # si modification involontaire
git -C /opt/sharinggo stash                   # si modification à conserver
# Puis "Re-run failed jobs" depuis GitHub Actions
```

### Workflow échoue au backup

```bash
ssh deploy@<IP_VPS>
docker compose -f docker-compose.prod.yml ps postgres
bash scripts/check-disk.sh /opt/sharinggo
```

### Workflow échoue au healthcheck post-deploy

```bash
ssh deploy@<IP_VPS> 'cd /opt/sharinggo && docker compose -f docker-compose.prod.yml logs --tail=50 backend'
ssh deploy@<IP_VPS> 'cd /opt/sharinggo && docker compose -f docker-compose.prod.yml logs migrator'
# → Si migration échouée : restore backup pré-deploy + rollback tag N-1
# → Voir DEPLOY-01-BACKUP-RESTORE.md § 6 + DEPLOY-01-G-cicd.md § 5
```

### Rollback manuel

```bash
ssh deploy@<IP_VPS>
cd /opt/sharinggo
./scripts/backup-postgres.sh
git checkout vX.Y.Z
SENTRY_RELEASE="vX.Y.Z" docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
curl --fail https://api.sharinggo.fr/health
curl --fail https://api.sharinggo.fr/ready
```

---

## 13. Procédure de mise à jour (deploy courant)

```text
1. Annoncer fenêtre maintenance (si migration)
2. Backup DB (§ 10)
3. Git pull / deploy tag depuis CI
4. prisma migrate deploy (si nouvelles migrations)
5. docker compose up -d --build (ou rolling si multi-node — hors scope V1)
6. Smoke tests § 12 (dont `pnpm audit:links` en § 12.1 #13)
7. Enregistrer deployments
8. Monitorer 30 min (webhooks, erreurs)
```

| Type de release | Migration DB | Downtime attendu |
|-----------------|--------------|------------------|
| Frontend seul | Non | ~0 (reload Nginx static) |
| Backend patch | Non | < 1 min |
| Backend + migration | Oui | Fenêtre planifiée |

---

## 14. Checklist avant ouverture PILOT-01

Compléter en complément de [`PILOT-readiness.md`](./PILOT-readiness.md).

### Infrastructure

- [ ] DEPLOY-01 terminé · smoke tests § 12 PASS
- [ ] HTTPS prod validé
- [ ] Backups automatiques actifs + 1 restore testé
- [ ] Monitoring uptime configuré
- [ ] `deployments` enregistre le commit pilote

### Produit

- [ ] DEPLOY-READY-01 DONE · KPI « Après » validés
- [ ] Feature Freeze levé **uniquement** pour correctifs pilote
- [ ] `/help` public · pas de données démo
- [ ] Politique annulation trajet tranchée (PILOT-readiness § bloquant)

### Juridique & communication

- [ ] Placeholders légaux : acceptés pilote privé · **gate prod publique** documentée
- [ ] Liste utilisateurs pilote définie (fondateur + exploitation contrôlée)
- [ ] Canal support opérationnel (email / téléphone Contact)

### Stripe & paiement

- [ ] Compte Stripe live · webhooks prod OK
- [ ] Prix abonnements prod distincts des price_ test
- [ ] Aucun `sk_test_*` en PROD

---

## 15. Rabattages & environnements secondaires

| Job | Fréquence | Procédure | Statut |
|-----|-----------|-----------|--------|
| REC ← PROD anonymisé | Hebdomadaire | GitHub Action / cron · fonction SQL anonymisation | ⬜ |
| PREPROD ← PROD | Avant migration majeure | Clone + validation migrate | ⬜ |

Référence : CDC §5.1 · `environments.mdc`.

---

## 16. Contacts & escalade

| Rôle | Contact | Quand |
|------|---------|-------|
| CTO | — | Rollback · décision pilote |
| Ops / hébergeur | — | VPS down · disque plein |
| Stripe support | Dashboard | Webhooks en échec massif |
| Juriste | — | Ouverture production publique |

---

## 17. Definition of Production Ready

**Gate officielle CTO** — passage DEPLOY-READY-01 → DEPLOY-01.

Le produit **ne démarre pas DEPLOY-01** tant que tous les critères suivants ne sont pas satisfaits :

```text
✔ FAIL = 0
✔ WARN P0 = 0
✔ Aucun composant orphelin
✔ Aucun fichier démo utilisé
✔ Aucun secret en dépôt
✔ Lint OK
✔ Build OK
✔ QA PASS (régression parcours WEB-PASSENGER-QA-01)
✔ Runbook complété (sections critiques § 3–9 · § 12)
✔ Smoke tests validés (environnement cible)
```

| Critère | Preuve | Owner |
|---------|--------|-------|
| FAIL = 0 | `docs/audits/DEPLOY-READY-01-report.md` | Engineering |
| WARN P0 = 0 | Rapport clôture · KPI tableau | Engineering |
| Orphelins / démo | `pnpm lint` · grep codebase | Engineering |
| Secrets | Scan repo · `.env` hors Git | CTO / Ops |
| Lint / Build | CI ou local vert | Engineering |
| QA PASS | Checklist parcours § 2 audit QA | QA / CTO |
| Runbook | Ce document statut ≥ sections complétées | Ops |
| Smoke tests | § 12 exécuté sur PREPROD/PROD (incl. `pnpm audit:links`) | Ops |

Validation CTO explicite requise avant ouverture DEPLOY-01.

---

## 18. Documents liés

| Document | Rôle |
|----------|------|
| [`DEPLOY-READY-01` PRD](../prd/active/DEPLOY-READY-01-passenger-deploy-readiness.md) | Hardening pré-requis |
| [`WEB-PASSENGER-QA-01`](../audits/WEB-PASSENGER-QA-01.md) | Baseline qualité passager |
| [`PILOT-readiness.md`](./PILOT-readiness.md) | Bloquants métier pilote |
| [`docs/runbooks/ops-health-monitoring.md`](../runbooks/ops-health-monitoring.md) | Santé services dev |
| [`S1-5-T8`](../features/S1-5-T8-monitoring-health-hardening.md) | `/health` vs `/ready` |
| [`docs/infra/S0-T1.md`](../infra/S0-T1.md) | Compose dev de référence |

---

## 19. Changelog

### v0.8 — 2026-06-27

- §CI/CD ajouté (DEPLOY-01-G) : workflows ci.yml + deploy.yml, procédures rollback,
  repo sale, diagnostic post-déploiement. Référence DEPLOY-01-G-cicd.md.

### v0.7 — 2026-06-27

- §8 — Monitoring complet (DEPLOY-01-F) : UptimeRobot (4 monitors), Sentry backend
  (`backend/src/lib/sentry.ts`), logs Docker, check-disk.sh, checklist quotidienne pilote,
  corrélation logs ↔ Sentry via requestId. Référence DEPLOY-01-F-monitoring.md.

### v0.6 — 2026-06-27

- §10 — Politique backup complète : scripts `backup-postgres.sh`, `restore-postgres.sh`, `check-backup.sh` (DEPLOY-01-E).
  RPO 24h / RTO 30min documentés. Stratégie hors VPS post-pilote référencée.
- §11 — Rollback enrichi : rollback migration Prisma, rollback post-régression, référence DEPLOY-01-BACKUP-RESTORE.md.
- Nouveau document : `docs/ops/DEPLOY-01-BACKUP-RESTORE.md` — PRA complet (drill, RPO/RTO, 5 scénarios catastrophe).

### v0.5 — 2026-06-27

- §7.0 — Séquence provisionnement VPS (DEPLOY-01-D) : `provision-vps.sh`, `generate-secrets.sh`,
  validation compose, tableau variables critiques [R]/[O].

### v0.4 — 2026-06-23

- Smoke tests **assets racine passager** : `GET /`, `/robots.txt`, favicon, icônes PWA (§ 12.1).
- Procédure build PROD `ROBOTS_POLICY=allow` — DEPLOY-READY **P0-06**.

### v0.3 — 2026-06-23

- Smoke test **#13** : audit liens internes passager (`pnpm audit:links`) — outil officiel DEPLOY-READY P0-03.

### v0.2 — 2026-06-23

- Sections **Monitoring** (§ 8) et **Vérifications sécurité** (§ 9).
- **Definition of Production Ready** (§ 17) — gate DEPLOY-READY-01 → DEPLOY-01.
- Renumérotation sections 10–18.

### v0.1 — 2026-06-23

- Squelette runbook créé pendant DEPLOY-READY-01 (constitution documentaire).
- Sections : prérequis VPS, env, TLS, migration, backup, rollback, post-deploy, PILOT-01.
- Statut DRAFT — implémentation DEPLOY-01 à compléter.

---

*Runbook DEPLOY-01 — document vivant. Ne pas exécuter en production tant que statut ≠ APPROVED.*
