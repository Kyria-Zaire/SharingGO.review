# DEPLOY-01 — Runbook de déploiement SharingGO

**Status :** DRAFT (constitution en cours pendant DEPLOY-READY-01)  
**Owner :** CTO / Ops  
**Last updated :** 2026-06-23  
**Version :** v0.3  
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
| `app.sharinggo.fr` (exemple) | PROD | Passager | ⬜ à définir |
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

> À compléter en DEPLOY-01 · constitution démarrée pendant DEPLOY-READY-01.

| Signal | Source | Action / seuil | Statut |
|--------|--------|----------------|--------|
| **Health checks** | `GET /health` · `GET /ready` | Uptime monitor · alerte si 2 échecs consécutifs | ⬜ |
| **Logs Docker** | `docker compose logs` · rotation | Rétention 7–30 j · pas de secrets en clair | ⬜ |
| **Logs Backend** | stdout structuré (pino/winston) | Erreurs 5xx · webhooks Stripe failed | ⬜ |
| **Logs Nginx** | access + error | 4xx/5xx anormaux · scan patterns | ⬜ |
| **Logs PostgreSQL** | slow query log (optionnel V1) | Requêtes > 1 s | ⬜ |
| **Redis** | — | **Hors scope V1** (rate limit in-memory) | N/A |
| **Alertes** | Email / Slack / UptimeRobot | CPU · disque · `/ready` down · webhook Stripe | ⬜ |

### Checklist monitoring (DEPLOY-01)

- [ ] Healthcheck externe sur `/health` ou `/ready`
- [ ] Rotation logs Docker configurée
- [ ] Procédure consultation logs documentée (qui · où · quand)
- [ ] Alerte disque > 80 %
- [ ] Dashboard Stripe webhooks (failed events)

Référence dev : [`docs/runbooks/ops-health-monitoring.md`](../runbooks/ops-health-monitoring.md) · S1-5-T8.

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

### 10.1 Politique PROD

| Fréquence | Rétention | Destination | Statut |
|-----------|-----------|-------------|--------|
| Quotidienne (cron soir) | 30 jours (à définir) | Autre VPS ou S3-compatible | ⬜ |
| Avant migration | 1 snapshot nommé | Même destination | ⬜ |
| Test restore | Mensuel | Procédure § 10.3 | ⬜ |

### 10.2 Script backup

```bash
# SQUELETTE — restore-backup.sh / backup-prod.sh à créer
# pg_dump -Fc $DATABASE_URL > backup_$(date +%Y%m%d_%H%M).dump
```

| Fichier | Rôle | Statut |
|---------|------|--------|
| `scripts/backup-prod.sh` | Dump Postgres compressé | ⬜ à créer |
| `scripts/restore-backup.sh` | Restore depuis dump | ⬜ à créer |

### 10.3 Test de restore (mensuel)

- [ ] Restaurer dernier backup sur env isolé (REC)
- [ ] Vérifier intégrité (`prisma db execute` / comptages tables clés)
- [ ] Documenter date + opérateur

---

## 11. Rollback

### 11.1 Quand rollback ?

- Healthcheck `/ready` en échec persistant (> 5 min)
- Erreur migration irrécupérable
- Régression critique détectée post-deploy (paiement, auth, boarding)

### 11.2 Procédure

```text
1. Identifier commit précédent stable (table deployments)
2. Arrêter trafic (maintenance page Nginx — optionnel)
3. Redéployer images / checkout tag précédent
4. Si migration appliquée : restore backup pré-migration OU migration down (si safe)
5. Redémarrer services
6. Vérifications post-déploiement (§ 12)
7. Enregistrer rollback dans deployments + audit log admin
```

| Scénario | Action | Statut doc |
|----------|--------|------------|
| Rollback code seul | Re-deploy tag N-1 | ⬜ |
| Rollback code + DB | Restore backup + tag N-1 | ⬜ |
| Stripe webhook | Pas de suppression données · idempotence `webhook_events` | ✅ imposé |

---

## 12. Vérifications post-déploiement

### 12.1 Smoke tests automatisés / manuels

| # | Vérification | Attendu |
|---|--------------|---------|
| 1 | `GET /health` | `200` · `{"status":"ok"}` |
| 2 | `GET /ready` | `200` · DB connectée |
| 3 | Frontend passager | Page d'accueil · pas d'erreur console |
| 4 | `robots.txt` PROD | `Allow: /` + Sitemap |
| 5 | TLS | Certificat valide · pas de mixed content |
| 6 | OAuth Google | Login convoyeur OK |
| 7 | Stripe webhook | Event test Dashboard → `200` |
| 8 | Réservation test | Pending → checkout → CONFIRMED (compte pilote) |
| 9 | QR boarding | JWT généré · expiration cohérente |
| 10 | Rate limiting | 429 après seuil (spot check) |
| 11 | CORS | Origine prod autorisée · `*` absent |
| 12 | Pas de mode démo | Aucun `demo-trip-*` · variable démo absente |
| 13 | Liens internes passager | `cd frontend/apps/passenger && pnpm audit:links` → exit **0** · FAIL **0** |

**Commande officielle (pré-déploiement & CI) :**

```bash
cd frontend/apps/passenger
pnpm audit:links
```

Script : `frontend/apps/passenger/scripts/audit-internal-links.mjs` — vérifie routes, ancres FAQ Contact→Help, footer légal, absence de liens démo. Introduit en DEPLOY-READY **P0-03**.

### 12.2 Observabilité

| Signal | Où | Statut |
|--------|-----|--------|
| Logs backend | stdout Docker · rotation | ⬜ |
| Erreurs 5xx | À centraliser (Sentry / Loki — **à décider**) | ⬜ |
| Uptime | Healthcheck externe (UptimeRobot / équivalent) | ⬜ |
| Stripe Dashboard | Paiements · webhooks failed | ⬜ |

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
