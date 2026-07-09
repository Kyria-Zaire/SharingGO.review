#!/usr/bin/env bash
# check-backup.sh — Vérifie l'intégrité d'une archive backup SharingGO.
#
# Usage :
#   bash scripts/check-backup.sh <fichier.sql.gz>
#
# Sorties :
#   exit 0 — archive valide
#   exit 1 — archive invalide ou manquante (avec message d'erreur)
#
# Ce script peut être intégré dans une vérification post-backup ou un cron de contrôle.

set -euo pipefail

# --- Seuil taille minimale (octets) ---
# Taille réelle observée en prod (VPS OVH, schéma seul sans données pilote,
# base fraîchement migrée) : 5544 octets gzippés. L'estimation initiale de
# ~10 kB était fausse — même un dump complet et valide échouait le check.
# Seuil fixé à 3 kB : ~55% sous la taille réelle (absorbe la variance des
# migrations futures) tout en restant très au-dessus d'un fichier tronqué
# ou corrompu (quelques centaines d'octets ou 0).
# TODO(debt): remonter ce seuil une fois des données pilote réelles en base
#   (trajets/réservations). En l'état, un dump anormalement petit APRÈS
#   remplissage de la base ne serait pas détecté — seuil pensé pour la
#   phase pré-pilote uniquement.
MIN_SIZE_BYTES=3072    # 3 kB — voir note ci-dessus (pré-pilote)

# --- Argument ---
if [[ $# -lt 1 ]]; then
  echo "Usage : bash scripts/check-backup.sh <fichier.sql.gz>" >&2
  echo ""
  echo "Exemple :"
  echo "  bash scripts/check-backup.sh /opt/sharinggo/backups/sharinggo_2026-06-27_02-00.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
ERRORS=0
WARNINGS=0

ok()   { echo "  ✔ $*"; }
fail() { echo "  ✗ $*" >&2; ERRORS=$(( ERRORS + 1 )); }
warn() { echo "  ⚠ $*"; WARNINGS=$(( WARNINGS + 1 )); }

echo ""
echo "=== Vérification backup : ${BACKUP_FILE} ==="
echo ""

# --- 1. Existence du fichier ---
echo "[1/5] Existence du fichier..."
if [[ ! -f "${BACKUP_FILE}" ]]; then
  fail "Fichier introuvable : ${BACKUP_FILE}"
  echo ""
  echo "RÉSULTAT : INVALIDE — ${ERRORS} erreur(s)"
  exit 1
fi
ok "Fichier présent"

# --- 2. Taille minimale ---
echo "[2/5] Taille du fichier..."
if command -v stat &>/dev/null; then
  # stat -c '%s' = taille en octets (GNU coreutils)
  FILE_SIZE_BYTES="$(stat -c '%s' "${BACKUP_FILE}" 2>/dev/null || stat -f '%z' "${BACKUP_FILE}" 2>/dev/null || echo 0)"
else
  FILE_SIZE_BYTES=0
fi
FILE_SIZE_HUMAN="$(du -sh "${BACKUP_FILE}" | cut -f1)"

if [[ "${FILE_SIZE_BYTES}" -lt "${MIN_SIZE_BYTES}" ]]; then
  fail "Taille insuffisante : ${FILE_SIZE_HUMAN} (minimum ${MIN_SIZE_BYTES} octets)"
  fail "Le dump est probablement tronqué ou vide"
else
  ok "Taille : ${FILE_SIZE_HUMAN} (${FILE_SIZE_BYTES} octets)"
fi

# --- 3. Intégrité gzip ---
echo "[3/5] Intégrité gzip..."
if ! gunzip --test "${BACKUP_FILE}" 2>/dev/null; then
  fail "Archive gzip corrompue ou incomplète"
else
  ok "Archive gzip valide (CRC OK)"
fi

# --- 4. Présence de SQL dans le contenu ---
echo "[4/5] Contenu SQL..."
if ! command -v gunzip &>/dev/null; then
  warn "gunzip non disponible — vérification contenu SQL ignorée"
else
  # Décompresse partiellement (head 100 lignes) pour chercher des marqueurs SQL
  SQL_SAMPLE="$(gunzip -c "${BACKUP_FILE}" 2>/dev/null | head -100 || true)"

  # pg_dump insère ces commentaires en en-tête du dump
  if echo "${SQL_SAMPLE}" | grep -q "PostgreSQL database dump"; then
    ok "En-tête pg_dump détectée"
  elif echo "${SQL_SAMPLE}" | grep -qiE "^(CREATE|INSERT|COPY|SET|BEGIN|--) "; then
    ok "Contenu SQL détecté (CREATE/INSERT/COPY)"
  else
    fail "Aucun marqueur SQL détecté — dump vide ou format inattendu"
    warn "Si le dump utilise le format binaire (-Fc), utiliser pg_restore à la place de psql"
  fi
fi

# --- 5. Nommage conforme ---
echo "[5/5] Convention de nommage..."
BASENAME="$(basename "${BACKUP_FILE}")"
# Format attendu : sharinggo_YYYY-MM-DD_HH-mm.sql.gz
if echo "${BASENAME}" | grep -qE '^sharinggo_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}\.sql\.gz$'; then
  ok "Nommage conforme : ${BASENAME}"
else
  warn "Nommage non standard : ${BASENAME}"
  warn "Format attendu    : sharinggo_YYYY-MM-DD_HH-mm.sql.gz"
fi

# --- Résultat ---
echo ""
echo "================================================================="
if [[ "${ERRORS}" -eq 0 ]]; then
  echo "RÉSULTAT : VALIDE ✔"
  [[ "${WARNINGS}" -gt 0 ]] && echo "           ${WARNINGS} avertissement(s) — voir ci-dessus"
  echo "================================================================="
  exit 0
else
  echo "RÉSULTAT : INVALIDE ✗ — ${ERRORS} erreur(s), ${WARNINGS} avertissement(s)"
  echo "================================================================="
  exit 1
fi
