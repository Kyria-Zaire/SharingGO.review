#!/usr/bin/env bash
# backup-postgres.sh — Sauvegarde PostgreSQL SharingGO production.
#
# Usage (sur le VPS, depuis /opt/sharinggo) :
#   DATABASE_URL="postgresql://..." bash scripts/backup-postgres.sh
#
# Ou via docker exec :
#   docker compose -f docker-compose.prod.yml exec -T postgres \
#     pg_dump -U sharinggo -d sharinggo | gzip > /opt/sharinggo/backups/sharinggo_$(date +%Y-%m-%d_%H-%M).sql.gz
#
# Le script ne contient aucun credential — DATABASE_URL est lu depuis l'environnement
# ou depuis .env.prod (sourcé automatiquement si présent et non déjà défini).

set -euo pipefail

# --- Configuration ---
BACKUP_DIR="${BACKUP_DIR:-/opt/sharinggo/backups}"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAILY=7      # jours — rotation documentée dans docs/ops/DEPLOY-01-BACKUP-RESTORE.md
RETENTION_WEEKLY=4     # semaines (non appliquée ici — voir rotation manuelle)
RETENTION_MONTHLY=6    # mois    (non appliquée ici — voir rotation manuelle)

# --- Sourcer .env.prod si DATABASE_URL non défini ---
ENV_FILE="${ENV_FILE:-/opt/sharinggo/.env.prod}"
if [[ -z "${DATABASE_URL:-}" ]] && [[ -f "${ENV_FILE}" ]]; then
  # shellcheck source=/dev/null
  set -a; source "${ENV_FILE}"; set +a
fi

# --- Vérifications prérequis ---
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[ERROR] DATABASE_URL non défini. Sourcer .env.prod ou exporter la variable." >&2
  exit 1
fi

for cmd in pg_dump gzip date du; do
  if ! command -v "${cmd}" &>/dev/null; then
    echo "[ERROR] Commande requise introuvable : ${cmd}" >&2
    exit 1
  fi
done

if [[ ! -d "${BACKUP_DIR}" ]]; then
  echo "[ERROR] Répertoire backup inexistant : ${BACKUP_DIR}" >&2
  echo "        Exécuter provision-vps.sh pour créer la structure." >&2
  exit 1
fi

# --- Nommage fichier ---
TIMESTAMP="$(date +%Y-%m-%d_%H-%M)"
BACKUP_FILE="${BACKUP_DIR}/sharinggo_${TIMESTAMP}.sql.gz"

# --- Log helper ---
log() {
  local level="$1"; shift
  local msg="$*"
  local ts
  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  echo "[${ts}] [${level}] ${msg}" | tee -a "${LOG_FILE}"
}

# --- Début backup ---
log "INFO" "=== Backup démarré ==="
log "INFO" "Destination : ${BACKUP_FILE}"

START_TS="$(date +%s)"

# pg_dump via DATABASE_URL (format postgresql://user:pass@host:port/dbname)
# -Fc = format custom PostgreSQL (binaire compressé) — plus rapide, restore via pg_restore
# Ici on utilise le format SQL plain + gzip pour un restore simple via psql
if ! pg_dump --no-password "${DATABASE_URL}" | gzip -9 > "${BACKUP_FILE}"; then
  log "ERROR" "pg_dump a échoué — fichier partiel supprimé"
  rm -f "${BACKUP_FILE}"
  exit 1
fi

END_TS="$(date +%s)"
DURATION=$(( END_TS - START_TS ))

# --- Vérification intégrité immédiate après dump ---
log "INFO" "Vérification intégrité gzip..."
if ! gunzip --test "${BACKUP_FILE}" 2>/dev/null; then
  log "ERROR" "Archive corrompue après dump — suppression"
  rm -f "${BACKUP_FILE}"
  exit 1
fi
log "INFO" "Intégrité : OK (gzip CRC valide)"

# --- Statistiques ---
FILE_SIZE="$(du -sh "${BACKUP_FILE}" | cut -f1)"
log "INFO" "Taille   : ${FILE_SIZE}"
log "INFO" "Durée    : ${DURATION}s"
log "INFO" "Statut   : SUCCESS"
log "INFO" "Fichier  : ${BACKUP_FILE}"
log "INFO" "=== Backup terminé ==="

# --- Rotation daily (7 jours) ---
# Supprime les backups quotidiens de plus de RETENTION_DAILY jours.
# La rotation weekly et monthly est documentée mais non automatisée en V1 (pilote).
log "INFO" "Rotation : suppression backups > ${RETENTION_DAILY} jours..."
find "${BACKUP_DIR}" -maxdepth 1 -name "sharinggo_*.sql.gz" \
  -mtime "+${RETENTION_DAILY}" -delete 2>/dev/null \
  && log "INFO" "Rotation : OK" \
  || log "WARN"  "Rotation : aucun fichier supprimé (normal si < ${RETENTION_DAILY} jours)"

echo ""
echo "✔ Backup réussi : ${BACKUP_FILE} (${FILE_SIZE}, ${DURATION}s)"
