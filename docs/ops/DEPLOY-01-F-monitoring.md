# DEPLOY-01-F — Monitoring & Observabilité SharingGO Pilote

> Configuration complète du monitoring pour le pilote contrôlé.  
> Grafana / Loki / Prometheus : hors scope pilote → backlog DEPLOY-02.

---

## Section 1 — UptimeRobot

### 1.1 Monitors à créer

| # | URL | Type | Nom | Usage |
|---|-----|------|-----|-------|
| 1 | `https://api.sharinggo.fr/health` | HTTPS | `SharingGO API Health` | Liveness backend |
| 2 | `https://api.sharinggo.fr/ready` | HTTPS | `SharingGO API Ready` | Readiness + DB connectée |
| 3 | `https://sharinggo.fr` | HTTPS | `SharingGO Passenger` | Frontend passager |
| 4 | `https://admin.sharinggo.fr` | HTTPS | `SharingGO Admin` | Frontend admin |

**Fréquence :** 5 minutes (minimum sur Free tier)  
**Alerte :** email immédiat si down

### 1.2 Configuration pas-à-pas

```
1. Créer un compte sur uptimerobot.com
2. Dashboard → Add New Monitor
3. Pour chaque monitor de la table ci-dessus :
   - Monitor Type : HTTP(S)
   - Friendly Name : <Nom ci-dessus>
   - URL : <URL ci-dessus>
   - Monitoring Interval : 5 minutes
   - Alert Contacts : votre email → Create Alert Contact si absent
4. Pour /health et /ready :
   - Advanced Settings → Expected HTTP status codes : 200
   - Keyword Monitoring (optionnel) : chercher "ok" dans la réponse
5. Cliquer "Create Monitor"
```

### 1.3 Status Page

**UptimeRobot Free Tier** : Status Page publique disponible (pas privée).  
URL générée : `https://stats.uptimerobot.com/XXXXXXXX`

Pour un pilote contrôlé (accès restreint) :
- **Option A :** Ne pas activer la Status Page publique — utiliser uniquement les alertes email.
- **Option B :** Activer la Status Page publique mais sans indiquer le nom "SharingGO" (page anonymisée).
- **Option C (post-pilote) :** Passer à UptimeRobot Pro pour une Status Page protégée par mot de passe, ou utiliser [Freshping](https://freshping.io) (free tier avec Status Page privée).

**Recommandation pilote :** Option A — alertes email uniquement, sans exposition publique.

---

## Section 2 — Sentry

### 2.1 Création du projet

```
1. Créer un compte sur sentry.io (Free tier : 5000 erreurs/mois)
2. Dashboard → Create Project
   - Platform : Node.js
   - Project Name : sharinggo-backend
   - Team : créer une équipe si première utilisation
3. Copier le DSN affiché (format : https://KEY@oXXXXXX.ingest.sentry.io/PROJECTID)
4. Ajouter dans /opt/sharinggo/.env.prod :
   SENTRY_DSN=https://KEY@oXXXXXX.ingest.sentry.io/PROJECTID
   SENTRY_TRACES_SAMPLE_RATE=0.1
```

### 2.2 Test de configuration

```bash
# Sur le VPS ou en local avec SENTRY_DSN défini
SENTRY_DSN="https://KEY@oXXXXXX.ingest.sentry.io/PROJECTID" \
  node scripts/test-sentry.mjs
# Attendu : "✔ Événement Sentry de test envoyé."
# Vérifier dans Sentry Dashboard → Issues → chercher "[TEST] SharingGO..."
```

### 2.3 Configuration des alertes

```
Dashboard Sentry → Alerts → Create Alert Rule → Issue Alert

Règle recommandée pilote :
  Nom : "Premier événement par issue"
  Trigger : "When a new issue is created"
  Action : "Send an email to <votre email>"

Règle secondaire :
  Nom : "Pic d'erreurs"
  Trigger : "When the number of events in an issue exceeds 10 in 1 hour"
  Action : "Send an email to <votre email>"
```

### 2.4 Règles d'ignorance (Inbound Filters)

```
Dashboard Sentry → Settings → Projects → sharinggo-backend → Inbound Filters

Activer :
  - "Filter known web crawlers" : OUI
  - "Filter localhost errors" (si applicable) : OUI

Ces filtres sont gérés côté backend dans beforeSend — les 400/401/403/404/422/429
ne sont jamais envoyés à Sentry (filtrés avant l'envoi réseau).
```

### 2.5 SENTRY_RELEASE — intégration CI/CD

`SENTRY_RELEASE` est injecté automatiquement par GitHub Actions (DEPLOY-01-G) :

```yaml
# Extrait du pipeline GitHub Actions (DEPLOY-01-G)
- name: Build and deploy
  env:
    SENTRY_RELEASE: ${{ github.sha }}
```

En attendant DEPLOY-01-G : laisser `SENTRY_RELEASE=` vide — Sentry fonctionne sans,
mais sans lien entre événements et commits.

### 2.6 Corrélation logs ↔ Sentry via requestId

Chaque événement Sentry est taggé `requestId`. Pour retrouver la requête dans les logs Docker :

```bash
# 1. Dans Sentry : noter le requestId de l'événement (tag "requestId")
#    Exemple : requestId = "a1b2c3d4-5678-..."

# 2. Dans les logs Docker :
docker compose -f docker-compose.prod.yml logs backend | grep "a1b2c3d4-5678"
# Affiche toutes les lignes de log de cette requête spécifique
```

Tags Sentry par événement :

| Tag | Valeur | Usage |
|-----|--------|-------|
| `service` | `backend` | Filtrer par service si multi-projets |
| `environment` | `production` | Séparer prod/staging |
| `release` | SHA commit | Identifier la version fautive |
| `requestId` | UUID v4 | Corréler avec logs Docker |
| `module` | `auth`/`payments`/`boarding`/`bookings`/`trips`/`admin`/`subscriptions`/`core` | Filtrage rapide par domaine |

---

## Section 3 — Logs Docker

### 3.1 Rotation (déjà configurée)

La rotation des logs est configurée dans `docker-compose.prod.yml` pour chaque service :

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "5"
```

**Rétention effective :** 5 fichiers × 10 MB = 50 MB max par service.

### 3.2 Commandes d'exploitation

```bash
# Dernières 100 lignes backend
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# Suivre les logs en temps réel (Ctrl+C pour arrêter)
docker compose -f docker-compose.prod.yml logs --tail=50 -f backend

# Logs Caddy (accès HTTP)
docker compose -f docker-compose.prod.yml logs --tail=100 -f caddy

# Logs PostgreSQL
docker compose -f docker-compose.prod.yml logs --tail=100 postgres

# Tous les services depuis 30 minutes
docker compose -f docker-compose.prod.yml logs --since=30m

# Chercher un requestId spécifique dans les logs
docker compose -f docker-compose.prod.yml logs backend | grep "a1b2c3d4-5678"

# Chercher toutes les erreurs 500
docker compose -f docker-compose.prod.yml logs backend | grep '"statusCode":500'
```

### 3.3 Corrélation logs ↔ Sentry

Workflow recommandé lors d'une alerte Sentry :

```
1. Ouvrir l'événement Sentry → noter le tag "requestId" (ex: a1b2c3d4-...)
2. Sur le VPS :
   docker compose -f docker-compose.prod.yml logs backend | grep "a1b2c3d4"
3. La requête complète apparaît avec :
   - timestamp
   - méthode + path + statusCode
   - stack trace si 500
   - context métier (userId, tripId, etc. selon les logs existants)
```

---

## Section 4 — Alerte disque

### 4.1 Script check-disk.sh

`scripts/check-disk.sh` (créé dans DEPLOY-01-F) :

```bash
# Utilisation manuelle
bash scripts/check-disk.sh /opt/sharinggo

# Sortie attendue (exemple) :
# [2026-06-27 10:00:00] Disque : /dev/sda1 (monté sur /)
# [2026-06-27 10:00:00] Taille totale : 80G
# [2026-06-27 10:00:00] Utilisé      : 12G (15%)
# [2026-06-27 10:00:00] Disponible   : 68G
# [2026-06-27 10:00:00] [OK] Disque à 15% — dans les limites normales.
```

Codes de retour : `0` OK · `1` WARNING (≥ 80%) · `2` CRITICAL (≥ 90%)

### 4.2 Cron VPS recommandé

```cron
# Vérification toutes les heures — log dans /var/log/sharinggo-disk.log
0 * * * * root /opt/sharinggo/scripts/check-disk.sh /opt/sharinggo >> /var/log/sharinggo-disk.log 2>&1

# Vérification disque racine également (backups peuvent remplir /)
5 * * * * root /opt/sharinggo/scripts/check-disk.sh / >> /var/log/sharinggo-disk.log 2>&1
```

Installation sur le VPS :

```bash
# Ajouter au crontab root
sudo crontab -e
# Coller les deux lignes ci-dessus, sauvegarder
```

### 4.3 Seuils et actions

| Seuil | Niveau | Action |
|-------|--------|--------|
| < 80% | OK | Aucune action |
| ≥ 80% | WARNING | Planifier nettoyage (purge backups > 7j, `docker system prune`) |
| ≥ 90% | CRITICAL | Action immédiate + escalade CTO |

**Actions de nettoyage :**

```bash
# Purger backups > 7 jours
find /opt/sharinggo/backups -name "*.sql.gz" -mtime +7 -delete

# Purger images Docker inutilisées
docker system prune -f

# Vérifier les logs Docker rotatifs
docker system df
```

---

## Section 5 — Matrice incidents & Error budget pilote

### 5.1 Matrice incidents

| Incident | Détection | Action | Escalade |
|----------|-----------|--------|----------|
| **Backend DOWN** | UptimeRobot `/health` | Restart container | CTO si > 5 min |
| **DB DOWN** | UptimeRobot `/ready` | Vérifier postgres container | CTO immédiat |
| **HTTPS cassé** | UptimeRobot passenger | Vérifier Caddy + certs Let's Encrypt | CTO immédiat |
| **Erreur 5xx inattendue** | Sentry alerte | Logs backend → `/ready` | CTO si récurrent |
| **Stripe Webhook KO** | Sentry + logs backend | Vérifier endpoint + secret webhook | CTO immédiat |
| **Disque > 80%** | cron check-disk | Purge backups + `docker system prune` | CTO si > 90% |

### 5.2 Arbres de décision

#### Backend DOWN

```
UptimeRobot alerte : /health DOWN
  ↓
SSH VPS : docker compose -f docker-compose.prod.yml ps
  ↓
container "backend" arrêté ?
  OUI → docker compose up -d backend → attendre 30s → re-vérifier /health
  NON → container running mais /health fail ?
    ↓
    docker compose logs --tail=50 backend
      ↓
      OOM (Out of Memory) ? → restart + augmenter RAM VPS
      crash loop (restart: on-failure) ? → escalade CTO + rollback tag N-1
      erreur Prisma connexion ? → vérifier postgres → voir arbre DB DOWN
```

#### DB DOWN

```
UptimeRobot alerte : /ready DOWN
  ↓
docker compose ps postgres
  ↓
arrêté ?
  OUI → docker compose up -d postgres → attendre healthcheck pg_isready
  NON → running mais connexion refusée ?
    ↓
    docker compose logs --tail=50 postgres
      ↓
      "could not read block" / "invalid page" → CORRUPTION
        → arrêter backend (éviter écritures) → restore depuis backup
        → voir DEPLOY-01-BACKUP-RESTORE.md § 7.2
      "too many connections" → vérifier pool Prisma
      "disk full" → CRITICAL → purge immédiate
```

#### HTTPS cassé

```
sharinggo.fr inaccessible (HTTPS timeout ou erreur cert)
  ↓
curl -I https://sharinggo.fr
  ↓
"SSL certificate problem" / "certificate has expired" ?
  → docker compose restart caddy (Caddy renouvelle automatiquement via Let's Encrypt)
  → attendre 2 min → re-tester
"Connection refused" ?
  → docker compose up -d caddy
DNS ?
  → dig sharinggo.fr → IP correcte ? → vérifier propagation DNS
  → A record doit pointer vers l'IP du VPS
```

#### Stripe Webhook KO

```
Sentry : erreur dans /api/webhooks/stripe
  ↓
docker compose logs backend | grep "webhook"
  ↓
"Stripe signature verification failed" ?
  → STRIPE_WEBHOOK_SECRET incorrect → vérifier .env.prod vs Dashboard Stripe
"No such price" ?
  → Price ID test utilisé avec clé live → voir DEPLOY-01-SECRETS.md §4
"Cannot connect to Stripe API" ?
  → réseau VPS → curl https://api.stripe.com/v1/charges → tester connectivité
Dashboard Stripe → Webhooks → endpoint → "Recent deliveries"
  → code 5xx ? → logs backend pour cause exacte
```

### 5.3 Error budget pilote

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| API availability (`/health`) | ≥ 99% | UptimeRobot dashboard |
| Passenger availability | ≥ 99% | UptimeRobot dashboard |
| `/health` response time | < 500 ms | UptimeRobot response time |
| Backups success | 100% | `/opt/sharinggo/backups/backup.log` |
| TLS valid | 100% | UptimeRobot HTTPS check |
| Stripe Webhook success rate | 100% | Dashboard Stripe → Webhooks |
| MTTR (Mean Time To Restore) | < 30 min | Journal incidents |

**99% availability = 7h18 de downtime maximum par mois.**  
Pour un pilote contrôlé, l'objectif est surtout de mesurer l'écart au 99% et d'identifier les causes.

---

## Documents liés

| Document | Rôle |
|----------|------|
| `docs/ops/DEPLOY-01-RUNBOOK.md` § 8 | Monitoring dans le runbook |
| `docs/ops/DEPLOY-01-BACKUP-RESTORE.md` | Procédures restore liées aux incidents DB |
| `docs/ops/DEPLOY-01-SECRETS.md` § Monitoring | Variables SENTRY_DSN / RELEASE / SAMPLE_RATE |
| `scripts/check-disk.sh` | Script alerte disque |
| `scripts/test-sentry.mjs` | Test configuration Sentry |
| `backend/src/lib/sentry.ts` | Module Sentry backend |
