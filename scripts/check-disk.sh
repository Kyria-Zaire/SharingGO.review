#!/usr/bin/env bash
# check-disk.sh — Vérifie l'espace disque du VPS SharingGO.
#
# Usage :
#   bash scripts/check-disk.sh [chemin]
#
# Par défaut surveille /opt/sharinggo. Passe un chemin en argument pour surveiller
# un autre point de montage (ex: bash scripts/check-disk.sh /).
#
# Codes de retour :
#   0 — OK (< 80%)
#   1 — WARNING (>= 80% et < 90%)
#   2 — CRITICAL (>= 90%)
#
# Cron recommandé (VPS) :
#   0 * * * * root /opt/sharinggo/scripts/check-disk.sh >> /var/log/sharinggo-disk.log 2>&1

set -euo pipefail

TARGET="${1:-/opt/sharinggo}"
WARN_THRESHOLD=80
CRIT_THRESHOLD=90

# --- Vérification prérequis ---
if ! command -v df &>/dev/null; then
  echo "[ERROR] Commande df introuvable." >&2
  exit 2
fi

TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"

# df -h : taille lisible · -P : format POSIX portable (une ligne par filesystem)
# Chercher le point de montage qui contient TARGET
DISK_INFO="$(df -hP "${TARGET}" 2>/dev/null | tail -1)"

if [[ -z "${DISK_INFO}" ]]; then
  echo "[${TIMESTAMP}] [ERROR] Impossible de lire les informations disque pour : ${TARGET}" >&2
  exit 2
fi

# Colonnes : Filesystem  Size  Used  Avail  Use%  Mounted on
FILESYSTEM="$(echo "${DISK_INFO}" | awk '{print $1}')"
SIZE="$(echo "${DISK_INFO}"       | awk '{print $2}')"
USED="$(echo "${DISK_INFO}"       | awk '{print $3}')"
AVAIL="$(echo "${DISK_INFO}"      | awk '{print $4}')"
USE_PCT="$(echo "${DISK_INFO}"    | awk '{print $5}' | tr -d '%')"
MOUNTPOINT="$(echo "${DISK_INFO}" | awk '{print $6}')"

echo "[${TIMESTAMP}] Disque : ${FILESYSTEM} (monté sur ${MOUNTPOINT})"
echo "[${TIMESTAMP}] Taille totale : ${SIZE}"
echo "[${TIMESTAMP}] Utilisé      : ${USED} (${USE_PCT}%)"
echo "[${TIMESTAMP}] Disponible   : ${AVAIL}"

if [[ "${USE_PCT}" -ge "${CRIT_THRESHOLD}" ]]; then
  echo "[${TIMESTAMP}] [CRITICAL] Disque à ${USE_PCT}% — intervention requise immédiatement."
  echo "[${TIMESTAMP}] Actions : purger backups anciens, logs Docker, images inutilisées."
  echo "[${TIMESTAMP}] Commandes : docker system prune -f · find /opt/sharinggo/backups -mtime +7 -delete"
  exit 2
elif [[ "${USE_PCT}" -ge "${WARN_THRESHOLD}" ]]; then
  echo "[${TIMESTAMP}] [WARNING] Disque à ${USE_PCT}% — surveiller de près. Escalade CTO si > ${CRIT_THRESHOLD}%."
  exit 1
else
  echo "[${TIMESTAMP}] [OK] Disque à ${USE_PCT}% — dans les limites normales."
  exit 0
fi
