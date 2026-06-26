#!/usr/bin/env bash
# provision-vps.sh — Provisionne la structure de répertoires pour SharingGO sur le VPS.
#
# Usage : bash scripts/provision-vps.sh
#
# Ce script ne contient aucun secret, aucune IP, aucune credential SSH.
# Il est destiné à être exécuté directement sur le VPS après connexion SSH.
# Exécuter en tant qu'utilisateur deploy (sudo disponible si nécessaire).

set -euo pipefail

DEPLOY_DIR="/opt/sharinggo"
BACKUPS_DIR="${DEPLOY_DIR}/backups"
ENV_FILE="${DEPLOY_DIR}/.env.prod"
REPO_URL="https://github.com/Kyria-Zaire/SharingGO.git"

echo ""
echo "================================================================="
echo " SharingGO — Provisionnement VPS"
echo "================================================================="
echo ""

# --- 1. Créer le répertoire de déploiement ---
echo "[1/4] Création de ${DEPLOY_DIR}..."
if [ ! -d "${DEPLOY_DIR}" ]; then
  sudo mkdir -p "${DEPLOY_DIR}"
  sudo chown "$(whoami):$(whoami)" "${DEPLOY_DIR}"
  echo "      Créé : ${DEPLOY_DIR}"
else
  echo "      Déjà existant : ${DEPLOY_DIR} (aucune modification)"
fi

# --- 2. Cloner le repo si absent ---
echo "[2/4] Vérification du repo..."
if [ ! -d "${DEPLOY_DIR}/.git" ]; then
  echo "      Clonage depuis ${REPO_URL}..."
  git clone "${REPO_URL}" "${DEPLOY_DIR}"
  echo "      Cloné dans ${DEPLOY_DIR}"
else
  echo "      Repo déjà présent dans ${DEPLOY_DIR} (aucun git pull automatique)"
  echo "      Pour mettre à jour : cd ${DEPLOY_DIR} && git fetch && git checkout <tag>"
fi

# --- 3. Créer .env.prod vide si absent et sécuriser ---
echo "[3/4] Sécurisation de ${ENV_FILE}..."
if [ ! -f "${ENV_FILE}" ]; then
  touch "${ENV_FILE}"
  echo "      Créé : ${ENV_FILE} (vide — à remplir manuellement)"
else
  echo "      Déjà existant : ${ENV_FILE} (aucune modification du contenu)"
fi
chmod 600 "${ENV_FILE}"
echo "      Permissions appliquées : chmod 600 ${ENV_FILE}"

# --- 4. Créer le répertoire backups ---
echo "[4/4] Création de ${BACKUPS_DIR}..."
if [ ! -d "${BACKUPS_DIR}" ]; then
  mkdir -p "${BACKUPS_DIR}"
  chmod 700 "${BACKUPS_DIR}"
  echo "      Créé : ${BACKUPS_DIR}"
else
  echo "      Déjà existant : ${BACKUPS_DIR} (aucune modification)"
fi

echo ""
echo "================================================================="
echo " Provisionnement terminé."
echo "================================================================="
echo ""
echo " Étapes suivantes (dans cet ordre) :"
echo ""
echo " 1. Générer les secrets applicatifs (en local ou sur le VPS) :"
echo "      bash scripts/generate-secrets.sh"
echo ""
echo " 2. Remplir ${ENV_FILE} avec toutes les valeurs CHANGEME :"
echo "      nano ${ENV_FILE}"
echo "    Vérifier qu'aucun CHANGEME ne subsiste :"
echo "      grep CHANGEME ${ENV_FILE}"
echo "    (résultat attendu : aucune ligne)"
echo ""
echo " 3. Vérifier la configuration Docker Compose :"
echo "      cd ${DEPLOY_DIR}"
echo "      docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE} config --quiet"
echo "    (résultat attendu : exit 0, aucune erreur)"
echo ""
echo " 4. Ne pas lancer le déploiement tant que :"
echo "    - Toutes les variables [R] sont renseignées"
echo "    - Les clés Stripe LIVE (sk_live_*) sont configurées"
echo "    - Les Price IDs LIVE sont créés dans le Dashboard Stripe"
echo "    - Le webhook https://api.sharinggo.fr/api/webhooks/stripe est enregistré"
echo "    - Google OAuth est configuré pour les domaines production"
echo ""
echo " Référence : docs/ops/DEPLOY-01-SECRETS.md"
echo "================================================================="
echo ""
