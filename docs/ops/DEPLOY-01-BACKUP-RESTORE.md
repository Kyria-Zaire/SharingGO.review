# DEPLOY-01-BACKUP-RESTORE — Backup, Restore & Disaster Recovery

> Plan de continuité et de reprise d'activité (PRA) SharingGO — Pilote V1  
> Principe fondateur : **un backup qui n'a jamais été restauré est considéré comme inexistant.**

**RPO (Recovery Point Objective) :** 24 heures maximum  
**RTO (Recovery Time Objective) :** 30 minutes maximum

---

## 1. Scripts

| Script | Rôle |
|--------|------|
| `scripts/backup-postgres.sh` | Dump PostgreSQL compressé gzip, log taille/durée, rotation 7 jours |
| `scripts/restore-postgres.sh` | Restauration depuis `.sql.gz` avec confirmation obligatoire |
| `scripts/check-backup.sh` | Vérification intégrité archive (existence, gzip, SQL, taille, nommage) |

### Usage rapide

```bash
# Backup manuel
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/backup-postgres.sh

# Vérifier un backup
bash scripts/check-backup.sh /opt/sharinggo/backups/sharinggo_2026-06-27_02-00.sql.gz

# Restaurer (demande confirmation "OUI")
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/restore-postgres.sh /opt/sharinggo/backups/sharinggo_2026-06-27_02-00.sql.gz
```

---

## 2. Stratégie de rotation

La rotation automatique quotidienne (7 jours) est intégrée dans `backup-postgres.sh`.  
Les rétentions weekly et monthly sont documentées ci-dessous — **non automatisées en V1** (pilote à faible volume).

| Fréquence | Rétention | Fichiers concernés | Mise en place |
|-----------|-----------|-------------------|---------------|
| **Quotidienne** | 7 derniers jours | `sharinggo_YYYY-MM-DD_*.sql.gz` | ✅ Intégrée dans `backup-postgres.sh` (`find -mtime +7 -delete`) |
| **Hebdomadaire** | 4 dernières semaines | Copie du backup du dimanche → `sharinggo_week-WW.sql.gz` | Post-pilote : cron dédié |
| **Mensuelle** | 6 derniers mois | Copie du 1er du mois → `sharinggo_YYYY-MM.sql.gz` | Post-pilote : cron dédié |

### Cron recommandé (post-pilote — à activer sur le VPS)

```cron
# Backup quotidien à 02h00
0 2 * * * deploy /opt/sharinggo/scripts/backup-postgres.sh >> /opt/sharinggo/backups/cron.log 2>&1

# Copie hebdomadaire (dimanche 03h00)
0 3 * * 0 deploy cp /opt/sharinggo/backups/$(ls -t /opt/sharinggo/backups/sharinggo_*.sql.gz | head -1) \
  /opt/sharinggo/backups/sharinggo_week-$(date +%V).sql.gz

# Copie mensuelle (1er du mois 04h00)
0 4 1 * * deploy cp /opt/sharinggo/backups/$(ls -t /opt/sharinggo/backups/sharinggo_*.sql.gz | head -1) \
  /opt/sharinggo/backups/sharinggo_$(date +%Y-%m).sql.gz
```

> Note : ces commandes cron utilisent le compte `deploy`. Adapter `ENV_FILE=/opt/sharinggo/.env.prod` si l'utilisateur n'a pas le fichier dans son environnement par défaut.

---

## 3. Sauvegarde hors VPS (stratégie post-pilote)

**Problème :** une sauvegarde stockée uniquement sur le VPS ne protège pas contre la perte totale de la machine (incident hébergeur, destruction accidentelle du VPS, ransomware).

**Stratégie recommandée post-pilote :**

### 3.1 Chiffrement des archives

```bash
# Chiffrer avant envoi hors VPS (GPG symétrique, clé conservée hors VPS)
gpg --symmetric --cipher-algo AES256 \
  --output sharinggo_2026-06-27_02-00.sql.gz.gpg \
  sharinggo_2026-06-27_02-00.sql.gz

# Déchiffrer pour restauration
gpg --decrypt sharinggo_2026-06-27_02-00.sql.gz.gpg > sharinggo_2026-06-27_02-00.sql.gz
```

Ne jamais envoyer un backup non chiffré vers un stockage objet tiers — le fichier contient des données personnelles (PII : emails, noms, historique de trajets).

### 3.2 Destinations recommandées

| Option | Avantages | Coût estimé | Notes |
|--------|-----------|-------------|-------|
| **Hetzner Object Storage** | Même écosystème, compatible S3 | ~0,02 €/Go/mois | Recommandé si VPS Hetzner |
| **Backblaze B2** | Tarif très bas, S3-compatible | ~0,006 $/Go/mois | Bonne option multi-cloud |
| **AWS S3** | Standard industrie | ~0,023 $/Go/mois | Overkill pour pilote |

### 3.3 Script de copie hors VPS (squelette post-pilote)

```bash
# Requiert : rclone configuré avec un remote S3 nommé "sharinggo-backup"
# rclone config pour configurer le remote

BACKUP_FILE="/opt/sharinggo/backups/sharinggo_$(date +%Y-%m-%d_%H-%M).sql.gz"
ENCRYPTED="${BACKUP_FILE}.gpg"

# 1. Chiffrer
gpg --batch --symmetric --cipher-algo AES256 \
  --passphrase-file /root/.backup-gpg-passphrase \
  --output "${ENCRYPTED}" "${BACKUP_FILE}"

# 2. Envoyer
rclone copy "${ENCRYPTED}" sharinggo-backup:sharinggo-prod/

# 3. Vérifier
rclone ls sharinggo-backup:sharinggo-prod/ | grep "$(basename "${ENCRYPTED}")"

# 4. Nettoyer le fichier chiffré local (le .sql.gz reste pour usage local)
rm "${ENCRYPTED}"
```

La clé GPG doit être conservée **hors du VPS** (gestionnaire de secrets, coffre-fort physique, ou second administrateur).

---

## 4. Procédure de Restore Drill (test mensuel)

> À exécuter sur l'environnement **REC** (jamais directement sur PROD).  
> Documenter chaque drill : date, opérateur, durée, résultat.

### 4.1 Préparation

```bash
# 1. Identifier le backup à tester (dernier backup quotidien)
ls -lht /opt/sharinggo/backups/sharinggo_*.sql.gz | head -5

# 2. Vérifier l'intégrité avant restore
bash scripts/check-backup.sh /opt/sharinggo/backups/sharinggo_YYYY-MM-DD_HH-mm.sql.gz
# Résultat attendu : VALIDE ✔

# 3. Noter l'heure de début
echo "DRILL START: $(date '+%Y-%m-%d %H:%M:%S')"
```

### 4.2 Backup pré-drill (snapshot état actuel)

```bash
# Sauvegarder l'état actuel avant le drill pour pouvoir annuler
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  BACKUP_DIR=/opt/sharinggo/backups \
  bash scripts/backup-postgres.sh
# Résultat : sharinggo_YYYY-MM-DD_HH-mm.sql.gz
```

### 4.3 Restauration

```bash
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/restore-postgres.sh /opt/sharinggo/backups/sharinggo_YYYY-MM-DD_HH-mm.sql.gz
# Entrer 'OUI' à la confirmation
```

### 4.4 Validation post-restore

```bash
# Vérifier que le backend se reconnecte
curl -sf https://api.sharinggo.fr/ready | jq .
# Attendu : {"status":"ready","db":"connected"} ou équivalent

# Compter les tables clés (via docker exec)
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U sharinggo -d sharinggo -c "
    SELECT
      (SELECT COUNT(*) FROM users)        AS users,
      (SELECT COUNT(*) FROM trips)        AS trips,
      (SELECT COUNT(*) FROM reservations) AS reservations,
      (SELECT COUNT(*) FROM sessions)     AS sessions;
  "
# Vérifier que les comptes sont cohérents avec l'état attendu avant drill
```

### 4.5 Healthcheck final

```bash
curl -sf https://api.sharinggo.fr/health | jq .
# Attendu : {"status":"ok"}

# Smoke test : connexion Google OAuth possible (sans créer de compte)
curl -I https://sharinggo.fr/
# Attendu : HTTP/2 200
```

### 4.6 Temps de restore à mesurer

```bash
echo "DRILL END: $(date '+%Y-%m-%d %H:%M:%S')"
# Calculer la durée totale depuis DRILL START
# Objectif RTO : < 30 minutes (pilote)
```

### 4.7 Journal du drill

Consigner dans ce document (section 9) ou dans une issue GitHub :

| Champ | Valeur |
|-------|--------|
| Date | YYYY-MM-DD |
| Opérateur | — |
| Backup testé | `sharinggo_YYYY-MM-DD_HH-mm.sql.gz` |
| Durée restore | Xs |
| Durée totale drill | Xmin |
| RTO atteint | Oui / Non |
| Résultat validation | OK / KO |
| Observations | — |

---

## 5. RPO & RTO — Pilote V1

### 5.1 Définitions

| Indicateur | Définition | Objectif pilote |
|------------|------------|-----------------|
| **RPO** (Recovery Point Objective) | Perte de données maximale tolérée | **24 heures** |
| **RTO** (Recovery Time Objective) | Temps de reprise maximale toléré | **30 minutes** |

### 5.2 Justification pilote

**RPO = 24h :** backup quotidien à 02h00. En cas d'incident, on peut perdre au maximum les transactions du jour courant. Pour le pilote (volume faible, pas de paiements live au départ), cette perte est acceptable sous réserve de pouvoir reconstituer les réservations depuis les emails de confirmation et les événements Stripe (Dashboard Stripe conserve l'historique).

**RTO = 30min :** basé sur la mesure réelle du drill (section 4). Comprend :
- Identification du backup à restaurer : ~2 min
- Vérification intégrité (`check-backup.sh`) : ~1 min
- Restauration (`restore-postgres.sh`) : ~3-10 min selon volume
- Restart des services Docker : ~2 min
- Validation et smoke tests : ~5-10 min
- Marge opérationnelle : ~10 min

### 5.3 Évolution post-pilote

| Phase | RPO cible | RTO cible | Mécanisme |
|-------|-----------|-----------|-----------|
| Pilote V1 | 24h | 30 min | Backup quotidien `pg_dump` |
| S1 (croissance) | 4h | 15 min | WAL archiving + backup toutes les 4h |
| S2 (production) | 1h | 10 min | Streaming replication + standby |

---

## 6. Rollback après migration Prisma échouée

Ce scénario est distinct d'un restore classique : la migration peut avoir partiellement altéré le schéma.

### 6.1 Séquence obligatoire avant toute migration

```bash
# Étape 1 — Backup AVANT migration (obligatoire, non négociable)
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/backup-postgres.sh
# Noter le nom du fichier généré : sharinggo_YYYY-MM-DD_HH-mm.sql.gz

# Étape 2 — Vérifier le backup immédiatement
bash scripts/check-backup.sh /opt/sharinggo/backups/sharinggo_YYYY-MM-DD_HH-mm.sql.gz
# Ne pas continuer si INVALIDE

# Étape 3 — Appliquer la migration
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 6.2 Si la migration échoue (`migrate deploy` exit ≠ 0)

```bash
# Étape A — Ne pas tenter de "corriger" le schéma manuellement
# Une correction partielle aggrave souvent la situation

# Étape B — Restaurer depuis le backup pré-migration
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/restore-postgres.sh /opt/sharinggo/backups/sharinggo_YYYY-MM-DD_HH-mm.sql.gz
# → Entrer 'OUI' à la confirmation

# Étape C — Redéployer le tag applicatif précédent (code compatible avec l'ancien schéma)
cd /opt/sharinggo
git fetch origin
git checkout <tag-précédent-stable>
docker compose -f docker-compose.prod.yml up -d --build

# Étape D — Vérifier
curl -sf https://api.sharinggo.fr/health
curl -sf https://api.sharinggo.fr/ready
```

### 6.3 Si la migration réussit mais crée une régression applicative

```bash
# Même procédure que 6.2, étapes A→D
# La migration Prisma est dans prisma_migrations — elle sera "re-appliquée" proprement
# lors du prochain migrate deploy (Prisma gère l'idempotence via la table _prisma_migrations)
```

### 6.4 Rollback "schema only" sans restore (cas rare)

Uniquement si :
- La migration n'a ajouté que des colonnes nullable sans `DEFAULT` (rollback safe)
- Aucune donnée n'a été modifiée ou supprimée
- Confirmation CTO obtenue

```sql
-- Exemple de rollback manuel (colonne ajoutée)
ALTER TABLE "users" DROP COLUMN IF EXISTS "new_column";
```

**Cette approche est déconseillée par défaut.** Toujours préférer le restore depuis backup.

### 6.5 Checklist rollback Prisma

- [ ] Backup pré-migration vérifié (`check-backup.sh` → VALIDE)
- [ ] Migration testée sur PREPROD avant PROD
- [ ] Rollback décidé par CTO (pas unilatéralement par l'opérateur)
- [ ] Restore exécuté (`restore-postgres.sh`)
- [ ] Tag applicatif N-1 redéployé
- [ ] `GET /health` et `GET /ready` → 200
- [ ] Enregistrement dans `deployments` (rollback reason)
- [ ] Post-mortem planifié (comprendre l'échec de migration avant re-tentative)

---

## 7. Checklist catastrophe

### 7.1 Suppression accidentelle de la base

**Symptômes :** `ERROR: database "sharinggo" does not exist` · backend refuse de démarrer  
**Priorité :** P0 — action immédiate

```bash
# 1. Créer une base vide
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U sharinggo postgres -c "CREATE DATABASE sharinggo;"

# 2. Restaurer depuis dernier backup
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/restore-postgres.sh /opt/sharinggo/backups/$(ls -t /opt/sharinggo/backups/sharinggo_*.sql.gz | head -1)

# 3. Vérifier
curl -sf https://api.sharinggo.fr/ready
```

**RPO effectif :** temps depuis le dernier backup (max 24h en pilote)

---

### 7.2 Corruption PostgreSQL

**Symptômes :** erreurs `invalid page`, `could not read block`, crash du container postgres  
**Priorité :** P0

```bash
# 1. Arrêter les services pour éviter toute écriture supplémentaire
docker compose -f docker-compose.prod.yml stop backend admin passenger

# 2. Tenter une vérification (peut prendre du temps)
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U sharinggo -d sharinggo --no-password 2>/dev/null | head -20
# Si pg_dump échoue → corruption trop grave, passer à l'étape 3 directement

# 3. Arrêter PostgreSQL
docker compose -f docker-compose.prod.yml stop postgres

# 4. Supprimer le volume corrompu
# ATTENTION : destruction irréversible — backup déjà impossible si pg_dump échoue
docker volume rm sharinggo_postgres_data_prod

# 5. Redémarrer PostgreSQL (volume vide)
docker compose -f docker-compose.prod.yml up -d postgres

# 6. Restaurer depuis dernier backup valide
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/restore-postgres.sh /opt/sharinggo/backups/$(ls -t /opt/sharinggo/backups/sharinggo_*.sql.gz | head -1)

# 7. Redémarrer tous les services
docker compose -f docker-compose.prod.yml up -d
```

**Si tous les backups sur le VPS sont corrompus :** utiliser le backup hors VPS (section 3) — raison principale de la stratégie de sauvegarde externalisée.

---

### 7.3 VPS perdu (destruction totale de la machine)

**Symptômes :** VPS inaccessible, interface hébergeur montre le VPS comme terminé/détruit  
**Priorité :** P0

```bash
# Sur la machine locale de l'opérateur :

# Étape 1 — Créer un nouveau VPS chez l'hébergeur
# (même ou autre région — pas de dépendance géographique en V1)

# Étape 2 — Provisionner
ssh deploy@<NOUVELLE_IP>
bash /dev/stdin << 'EOF'
# Cloner le repo
git clone https://github.com/Kyria-Zaire/SharingGO.git /opt/sharinggo
cd /opt/sharinggo
git checkout <dernier-tag-stable>
EOF

# Étape 3 — Restaurer les secrets
# .env.prod doit exister dans un gestionnaire de secrets hors VPS
# → copier depuis coffre-fort/gestionnaire vers /opt/sharinggo/.env.prod
chmod 600 /opt/sharinggo/.env.prod

# Étape 4 — Récupérer les backups hors VPS
# (depuis Hetzner Object Storage / Backblaze B2 — voir section 3)
rclone copy sharinggo-backup:sharinggo-prod/ /opt/sharinggo/backups/

# Étape 5 — Démarrer les services (DB vide)
docker compose -f docker-compose.prod.yml up -d postgres
sleep 10  # attendre que postgres soit prêt

# Étape 6 — Restaurer depuis backup
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/restore-postgres.sh /opt/sharinggo/backups/$(ls -t /opt/sharinggo/backups/sharinggo_*.sql.gz | head -1)

# Étape 7 — Démarrer tous les services
docker compose -f docker-compose.prod.yml up -d

# Étape 8 — Mettre à jour les DNS vers la nouvelle IP
# (via interface hébergeur DNS — TTL peut prendre jusqu'à 1h pour se propager)

# Étape 9 — Vérifier
curl -sf https://api.sharinggo.fr/health
```

**Temps estimé :** 45-90 min (VPS + provisionnement + restore + propagation DNS)  
**Dépasse le RTO 30 min** si les backups sont uniquement sur le VPS détruit → validation de la stratégie hors VPS (section 3).

---

### 7.4 Erreur de migration Prisma

Voir section 6 — procédure complète avec rollback.

---

### 7.5 Rollback après migration Prisma réussie (régression découverte après)

**Symptômes :** migration appliquée avec succès, mais régression fonctionnelle détectée (paiements bloqués, auth cassée, etc.) après ouverture du trafic

```bash
# 1. Couper le trafic vers le backend (maintenance)
# Caddy : modifier temporairement pour renvoyer 503 (optionnel selon gravité)

# 2. Identifier le backup pré-migration
# (il doit avoir été créé obligatoirement avant migrate deploy — voir 6.1)
ls -lht /opt/sharinggo/backups/sharinggo_*.sql.gz | head -10

# 3. Restaurer
DATABASE_URL="$(grep DATABASE_URL /opt/sharinggo/.env.prod | cut -d= -f2-)" \
  bash scripts/restore-postgres.sh /opt/sharinggo/backups/sharinggo_<pré-migration>.sql.gz

# 4. Redéployer tag N-1 (code compatible ancien schéma)
cd /opt/sharinggo
git checkout <tag-n-1>
docker compose -f docker-compose.prod.yml up -d --build

# 5. Vérifier et rouvrir le trafic
curl -sf https://api.sharinggo.fr/health
curl -sf https://api.sharinggo.fr/ready
```

**Point de vigilance :** entre la migration et le rollback, des transactions peuvent avoir eu lieu (paiements Stripe, réservations). Ces transactions sont dans les backups Stripe et les emails de confirmation — elles devront être re-saisies manuellement si le volume le justifie.

---

## 8. Stratégie de backup avant migration (séquence complète)

Cette procédure est **obligatoire** avant tout `prisma migrate deploy` en PROD.

```
┌─────────────────────────────────────────────────────────────┐
│ AVANT MIGRATION                                              │
│                                                             │
│  1. bash scripts/backup-postgres.sh                         │
│     → sharinggo_YYYY-MM-DD_HH-mm.sql.gz                    │
│                                                             │
│  2. bash scripts/check-backup.sh <fichier>                  │
│     → VALIDE ✔ obligatoire pour continuer                   │
│                                                             │
│  3. Tester la migration sur PREPROD en premier              │
│                                                             │
│  4. Si PREPROD OK → PROD :                                  │
│     docker compose exec backend npx prisma migrate deploy   │
│                                                             │
│  5. Si migrate deploy échoue → Section 6.2 (rollback)      │
│                                                             │
│  6. Si migrate deploy réussit → Smoke tests § 12 runbook   │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Journal des drills (à maintenir)

| Date | Opérateur | Backup testé | Durée restore | RTO atteint | Résultat | Observations |
|------|-----------|-------------|---------------|-------------|----------|--------------|
| — | — | — | — | — | Drill à effectuer avant ouverture pilote | |

**Fréquence recommandée :**
- Pilote : 1 drill avant ouverture + 1 drill/mois
- Post-pilote : 1 drill/mois minimum

---

## 10. TODO DEPLOY-02 — Mesure réelle du RTO

> Recommandation CTO — à traiter dans DEPLOY-02 (premier déploiement VPS réel).

Aujourd'hui le RTO est **documenté** (30 min objectif). En DEPLOY-02, il doit être **mesuré**.

### Protocole de mesure

Sur une base PostgreSQL vierge (VPS REC ou PREPROD) :

- [ ] **T0** — Démarrer le chronomètre
- [ ] **T1** — `restore-postgres.sh` terminé → noter durée restore
- [ ] **T2** — `docker compose up -d backend` → backend prêt (`GET /ready` → 200) → noter durée restart
- [ ] **T3** — `GET /health` + smoke tests § 12 runbook → noter durée validation
- [ ] **T4** — Fin : comparer T4 − T0 au RTO cible (30 min)

### Résultats à consigner

| Mesure | Objectif | Réel (à remplir DEPLOY-02) |
|--------|----------|---------------------------|
| Durée restore (`restore-postgres.sh`) | < 10 min | — |
| Durée restart backend | < 2 min | — |
| Durée validation healthcheck | < 5 min | — |
| **RTO total** | **< 30 min** | **—** |

Si RTO réel > 30 min → identifier le goulot et ajuster la stratégie avant ouverture pilote.

---

## 11. Documents liés

| Document | Rôle |
|----------|------|
| `docs/ops/DEPLOY-01-RUNBOOK.md` § 10-11 | Politique backup & rollback |
| `docs/ops/DEPLOY-01-SECRETS.md` | Credentials nécessaires pour le restore |
| `scripts/backup-postgres.sh` | Script backup |
| `scripts/restore-postgres.sh` | Script restore |
| `scripts/check-backup.sh` | Vérification intégrité |
| `scripts/provision-vps.sh` | Crée `/opt/sharinggo/backups/` |
