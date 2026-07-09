#!/usr/bin/env bash
# backup-postgres.sh — Sauvegarde PostgreSQL SharingGO production.
#
# Usage (sur le VPS ou via cron, cwd indifférent) :
#   bash scripts/backup-postgres.sh
#
# Le dump est réalisé via `docker compose exec` sur le service "postgres",
# résolvable uniquement depuis le réseau Docker interne. Le port 5432 n'est
# PAS exposé sur l'hôte et pg_dump n'est PAS installé sur l'hôte — c'est
# volontaire (décision : pas de port Postgres public).
#
# Le script ne contient aucun credential — POSTGRES_USER et POSTGRES_DB sont
# lus depuis .env.prod (sourcé automatiquement si présent). Le mot de passe
# n'est jamais manipulé : docker compose exec s'authentifie via le socket local
# du conteneur (trust/peer), sans transiter par la ligne de commande.

set -euo pipefail

# --- Configuration ---
# Chemins absolus : le script doit fonctionner quel que soit le cwd (cron).
PROJECT_DIR="${PROJECT_DIR:-/opt/sharinggo}"
COMPOSE_FILE="${COMPOSE_FILE:-${PROJECT_DIR}/docker-compose.prod.yml}"
COMPOSE_SERVICE="postgres"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_DIR}/backups}"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAILY=7      # jours — rotation documentée dans docs/ops/DEPLOY-01-BACKUP-RESTORE.md
RETENTION_WEEKLY=4     # semaines (non appliquée ici — voir rotation manuelle)
RETENTION_MONTHLY=6    # mois    (non appliquée ici — voir rotation manuelle)

# --- Sourcer .env.prod pour obtenir POSTGRES_USER / POSTGRES_DB ---
ENV_FILE="${ENV_FILE:-${PROJECT_DIR}/.env.prod}"
if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck source=/dev/null
  set -a; source "${ENV_FILE}"; set +a
fi

# --- Vérifications prérequis ---
# Le dump passe par `docker compose exec` : on a besoin du user et de la base,
# pas de DATABASE_URL (le port Postgres n'est pas exposé sur l'hôte).
if [[ -z "${POSTGRES_USER:-}" ]] || [[ -z "${POSTGRES_DB:-}" ]]; then
  echo "[ERROR] POSTGRES_USER et/ou POSTGRES_DB non définis." >&2
  echo "        Renseigner ${ENV_FILE} ou exporter les variables." >&2
  exit 1
fi

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "[ERROR] Fichier compose introuvable : ${COMPOSE_FILE}" >&2
  exit 1
fi

for cmd in docker gzip date du; do
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

# pg_dump exécuté DANS le conteneur postgres via docker compose exec.
# -T : pas de pseudo-TTY (obligatoire pour rediriger le flux, notamment sous cron).
# Format SQL plain + gzip -9 pour un restore simple via psql (voir restore-postgres.sh).
# set -o pipefail (activé plus haut) garantit qu'un échec de pg_dump propage
# un exit != 0 même si gzip réussit sur un flux tronqué.
if ! docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" \
      exec -T "${COMPOSE_SERVICE}" \
      pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
      | gzip -9 > "${BACKUP_FILE}"; then
  log "ERROR" "pg_dump (docker compose exec) a échoué — fichier partiel supprimé"
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
