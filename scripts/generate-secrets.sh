#!/usr/bin/env bash
# generate-secrets.sh — Génère les secrets applicatifs pour SharingGO production.
#
# Usage : bash scripts/generate-secrets.sh
#
# Ce script affiche uniquement en console. Il n'écrit jamais dans un fichier.
# Copiez les valeurs manuellement dans /opt/sharinggo/.env.prod sur le VPS.

set -euo pipefail

# --- Vérification des prérequis ---
if ! command -v openssl &>/dev/null; then
  echo "ERREUR : openssl est requis mais introuvable." >&2
  echo "Installez-le : sudo apt install openssl  (Debian/Ubuntu)" >&2
  exit 1
fi

echo ""
echo "================================================================="
echo " SharingGO — Génération des secrets production"
echo "================================================================="
echo ""
echo " Ces valeurs sont générées localement via openssl."
echo " Copiez-les dans /opt/sharinggo/.env.prod sur le VPS."
echo " Ne stockez JAMAIS ces valeurs dans Git."
echo "================================================================="
echo ""

echo "# --- Secrets applicatifs requis [R] ---"
echo "# (openssl rand -base64 48)"
echo ""

# BOARDING_JWT_SECRET : [R] — utilisé dans backend/src/modules/boarding/boarding-jwt.ts
# pour signer/vérifier les QR boarding (HS256). Minimum 32 caractères.
printf "BOARDING_JWT_SECRET=%s\n"  "$(openssl rand -base64 48)"

echo ""
echo "# --- Secrets futurs [NON UTILISÉS V1] — générés pour anticiper S1+ ---"
echo "# Commenter dans .env.prod si non utilisés pour ne pas induire en erreur."
echo ""

# SESSION_SECRET : non consommé en V1 (cookies opaques hashés DB, pas express-session)
printf "# SESSION_SECRET=%s\n"     "$(openssl rand -base64 48)"

# JWT_PRIVATE_KEY : non consommé en V1 (prévu pour migration RS256/EdDSA boarding)
printf "# JWT_PRIVATE_KEY=%s\n"    "$(openssl rand -base64 48)"

echo ""
echo "# --- PostgreSQL password (openssl rand -base64 32) ---"
echo "# Mettre à jour DATABASE_URL en conséquence."
echo ""

POSTGRES_PASSWORD="$(openssl rand -base64 32)"
printf "POSTGRES_PASSWORD=%s\n" "${POSTGRES_PASSWORD}"
printf "# DATABASE_URL=postgresql://sharinggo:%s@postgres:5432/sharinggo?schema=public\n" "${POSTGRES_PASSWORD}"

echo ""
echo "================================================================="
echo " Variables Stripe et Google OAuth : récupérer depuis les"
echo " dashboards respectifs (non générables localement)."
echo " Voir docs/ops/DEPLOY-01-SECRETS.md pour la procédure complète."
echo "================================================================="
echo ""
