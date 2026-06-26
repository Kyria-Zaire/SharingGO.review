#!/usr/bin/env bash
# restore-postgres.sh — Restauration PostgreSQL SharingGO depuis un backup .sql.gz
#
# Usage :
#   DATABASE_URL="postgresql://..." bash scripts/restore-postgres.sh <fichier.sql.gz>
#
# ATTENTION : cette opération DÉTRUIT et REMPLACE toutes les données actuelles.
# À exécuter uniquement sur REC/PREPROD pour le drill, ou sur PROD en cas d'incident.
#
# Le script ne contient aucun credential — DATABASE_URL est lu depuis l'environnement
# ou depuis .env.prod (sourcé automatiquement si présent et non déjà défini).

set -euo pipefail

# --- Argument ---
if [[ $# -lt 1 ]]; then
  echo "Usage : bash scripts/restore-postgres.sh <fichier.sql.gz>" >&2
  echo ""
  echo "Exemple :"
  echo "  DATABASE_URL='postgresql://sharinggo:SECRET@postgres:5432/sharinggo' \\"
  echo "    bash scripts/restore-postgres.sh /opt/sharinggo/backups/sharinggo_2026-06-27_02-00.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

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

for cmd in gunzip psql; do
  if ! command -v "${cmd}" &>/dev/null; then
    echo "[ERROR] Commande requise introuvable : ${cmd}" >&2
    exit 1
  fi
done

# --- Vérifier que le fichier existe ---
if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "[ERROR] Fichier introuvable : ${BACKUP_FILE}" >&2
  exit 1
fi

# --- Vérifier l'extension ---
if [[ "${BACKUP_FILE}" != *.sql.gz ]]; then
  echo "[ERROR] Le fichier doit avoir l'extension .sql.gz : ${BACKUP_FILE}" >&2
  exit 1
fi

# --- Vérifier intégrité gzip (lecture complète) ---
echo ""
echo "Vérification intégrité de l'archive..."
if ! gunzip --test "${BACKUP_FILE}" 2>/dev/null; then
  echo "[ERROR] Archive corrompue ou illisible : ${BACKUP_FILE}" >&2
  echo "        Vérifier avec : scripts/check-backup.sh ${BACKUP_FILE}" >&2
  exit 1
fi
echo "  ✔ Archive gzip valide"

# --- Taille du fichier ---
FILE_SIZE="$(du -sh "${BACKUP_FILE}" | cut -f1)"
echo "  Taille archive : ${FILE_SIZE}"

# --- Confirmation utilisateur ---
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                        ATTENTION                               ║"
echo "║                                                                ║"
echo "║  Cette opération remplacera TOUTES les données actuelles.     ║"
echo "║                                                                ║"
echo "║  Fichier : $(printf '%-51s' "${BACKUP_FILE}")║"
echo "║  Taille  : $(printf '%-51s' "${FILE_SIZE}")║"
echo "║  Cible   : $(printf '%-51s' "${DATABASE_URL:0:50}")║"
echo "║                                                                ║"
echo "║  Un backup de l'état actuel est FORTEMENT recommandé avant   ║"
echo "║  cette opération si la base contient des données récentes.    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
read -r -p "Continuer ? Tapez exactement 'RESTORE' pour confirmer : " CONFIRM

if [[ "${CONFIRM}" != "RESTORE" ]]; then
  echo ""
  echo "Restauration annulée."
  exit 0
fi

# --- Log helper ---
RESTORE_LOG="/opt/sharinggo/backups/restore_$(date +%Y-%m-%d_%H-%M).log"
log() {
  local level="$1"; shift
  local msg="$*"
  local ts
  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  echo "[${ts}] [${level}] ${msg}" | tee -a "${RESTORE_LOG}"
}

echo ""
log "INFO" "=== Restauration démarrée ==="
log "INFO" "Source  : ${BACKUP_FILE}"
log "INFO" "Cible   : ${DATABASE_URL}"

START_TS="$(date +%s)"

# --- Restauration via gunzip | psql ---
# psql --single-transaction : restaure en une transaction atomique.
# En cas d'erreur, toute la restauration est annulée (pas d'état partiel).
log "INFO" "Restauration en cours (gunzip | psql --single-transaction)..."
if ! gunzip -c "${BACKUP_FILE}" | psql --no-password --single-transaction "${DATABASE_URL}" 2>>"${RESTORE_LOG}"; then
  log "ERROR" "Restauration échouée — voir log : ${RESTORE_LOG}"
  echo ""
  echo "[ERROR] La restauration a échoué. Voir : ${RESTORE_LOG}" >&2
  exit 1
fi

END_TS="$(date +%s)"
DURATION=$(( END_TS - START_TS ))

log "INFO" "Durée   : ${DURATION}s"
log "INFO" "Statut  : SUCCESS"
log "INFO" "Log     : ${RESTORE_LOG}"
log "INFO" "=== Restauration terminée ==="

echo ""
echo "✔ Restauration réussie depuis : ${BACKUP_FILE} (${DURATION}s)"
echo ""
echo "Étapes suivantes recommandées :"
echo "  1. Vérifier la connectivité backend : curl https://api.sharinggo.fr/health"
echo "  2. Vérifier l'intégrité des tables clés (users, reservations, trips)"
echo "  3. Consigner l'opération dans le runbook (date, opérateur, motif)"
