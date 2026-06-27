# DEPLOY-01-H1 — VPS Hetzner Provisioning & Hardening

> **Statut :** EN COURS  
> **Owner :** CTO / Ops  
> **Date :** 2026-06-27  
> **Exécuté par :** Kyria-Zaire (manuel sur console Hetzner + SSH)

---

## 1. Spécifications VPS

| Champ | Valeur |
|-------|--------|
| Provider | Hetzner Cloud |
| Plan | **CX31** |
| vCPU | 2 |
| RAM | 8 GB |
| Disque | 80 GB SSD |
| OS | Ubuntu 24.04 LTS |
| Région | *(à compléter — ex. Falkenstein EU-Central)* |
| Hostname | `sharinggo-prod-01` |
| IP publique | *(à compléter après création)* |
| Prix | ~9,36 €/mois |

---

## 2. Runbook d'exécution

> Toutes les commandes ci-dessous sont exécutées **sur le VPS** sauf mention contraire.  
> Les lignes `# [LOCAL]` s'exécutent sur ton poste.

### Étape 1 — Créer le VPS sur Hetzner Cloud

```
1. Se connecter à console.hetzner.com
2. Nouveau projet ou projet existant → "Add Server"
3. Sélectionner :
   - Location    : EU (Falkenstein ou Helsinki au choix — documenter)
   - Image       : Ubuntu 24.04
   - Type        : CX31
   - Networking  : IPv4 + IPv6
   - SSH Key     : ajouter ta clé publique personnelle (pour l'accès root initial)
   - Hostname    : sharinggo-prod-01
4. Cliquer "Create & Buy"
5. Noter l'IP publique affichée → reporter dans §1 ci-dessus
```

### Étape 2 — Premier accès root et mise à jour système

```bash
# [LOCAL] Connexion root initiale
ssh root@<IP_VPS>

# Sur le VPS — mise à jour complète
apt update && apt upgrade -y

# Timezone (UTC retenu pour les logs et les backups cron)
# UTC est la valeur standard pour les serveurs prod — pas d'ambiguïté DST
timedatectl set-timezone UTC
timedatectl status    # vérifier : "Time zone: UTC (UTC, +0000)"

# Hostname
hostnamectl set-hostname sharinggo-prod-01
echo "127.0.1.1 sharinggo-prod-01" >> /etc/hosts
hostname    # vérifier : sharinggo-prod-01
```

**Timezone retenue : UTC.** Justification : logs horodatés sans ambiguïté DST, backups cron prévisibles, cohérence avec Docker et GitHub Actions.

### Étape 3 — Créer l'utilisateur `deploy`

```bash
# Toujours en root sur le VPS

# Créer l'utilisateur deploy (shell bash, pas de mot de passe)
adduser --disabled-password --gecos "SharingGO deploy user" deploy

# Ajouter au groupe sudo (pour docker, systemctl, etc.)
usermod -aG sudo deploy

# Créer le répertoire SSH
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Copier la clé publique de l'admin (ta clé personnelle)
# Option A — copier depuis root (si tu as ajouté ta clé en étape 1)
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys

# Option B — coller manuellement ta clé publique
echo "ssh-ed25519 AAAA... ton@email" >> /home/deploy/.ssh/authorized_keys

chown -R deploy:deploy /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Autoriser deploy à exécuter sudo sans mot de passe (pour GitHub Actions)
echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
chmod 440 /etc/sudoers.d/deploy
visudo -cf /etc/sudoers.d/deploy    # doit retourner "parsed OK"
```

```bash
# [LOCAL] Vérifier la connexion deploy AVANT de désactiver root
ssh deploy@<IP_VPS> "whoami && sudo whoami"
# Attendu :
# deploy
# root
```

### Étape 4 — Désactiver login root SSH

```bash
# Seulement après avoir vérifié que deploy fonctionne (étape précédente)
# Toujours en root sur le VPS

sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

# Vérifier les lignes modifiées
grep -E "PermitRootLogin|PasswordAuthentication" /etc/ssh/sshd_config

sshd -t    # vérification syntaxe — doit être silencieux
systemctl restart ssh

# [LOCAL] Vérifier que root est bien refusé
ssh root@<IP_VPS>    # attendu : "Permission denied (publickey)"
```

### Étape 5 — Firewall UFW

```bash
# En tant que deploy (ou root)
sudo apt install -y ufw

# Politique par défaut : tout bloquer en entrée
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser uniquement SSH, HTTP, HTTPS
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Activer (répondre "y" à la confirmation)
sudo ufw enable

# Vérifier
sudo ufw status verbose
```

**Résultat attendu :**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
22/tcp (v6)                ALLOW IN    Anywhere (v6)
80/tcp (v6)                ALLOW IN    Anywhere (v6)
443/tcp (v6)               ALLOW IN    Anywhere (v6)
```

### Étape 6 — fail2ban

```bash
sudo apt install -y fail2ban

# Créer une config locale (ne jamais modifier jail.conf directement)
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = 22
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Vérifier
sudo fail2ban-client status sshd
# Attendu : "Currently banned: 0" (normal, pas encore de tentatives)
```

### Étape 7 — unattended-upgrades (mises à jour sécurité automatiques)

```bash
sudo apt install -y unattended-upgrades

# Activer les upgrades de sécurité automatiques
sudo dpkg-reconfigure --priority=low unattended-upgrades
# → répondre "Yes"

# Vérifier la config active
grep "Unattended-Upgrade::Allowed-Origins" /etc/apt/apt.conf.d/50unattended-upgrades | head -5
```

### Étape 8 — Installer Docker Engine

```bash
# Dépendances
sudo apt install -y ca-certificates curl gnupg lsb-release

# Clé GPG officielle Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Repo Docker stable
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker Engine + Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# Ajouter deploy au groupe docker (évite sudo devant chaque docker)
sudo usermod -aG docker deploy

# Activer Docker au démarrage
sudo systemctl enable docker
sudo systemctl start docker

# Vérifier — IMPORTANT : se reconnecter pour que le groupe docker soit pris en compte
exit
ssh deploy@<IP_VPS>
docker --version        # ex: Docker version 27.x.x, build ...
docker compose version  # ex: Docker Compose version v2.x.x
docker run --rm hello-world  # doit afficher "Hello from Docker!"
```

### Étape 9 — Préparer le dossier projet

```bash
# Toujours en tant que deploy sur le VPS

# Créer la structure
sudo mkdir -p /opt/sharinggo/backups
sudo chown -R deploy:deploy /opt/sharinggo

# Créer .env.prod vide avec permissions restrictives
touch /opt/sharinggo/.env.prod
chmod 600 /opt/sharinggo/.env.prod

# Vérifier
ls -la /opt/sharinggo/
# attendu :
# drwxr-xr-x  deploy  deploy  .
# drwxr-xr-x  deploy  deploy  backups/
# -rw-------  deploy  deploy  .env.prod

stat /opt/sharinggo/.env.prod | grep "Access:"
# attendu : Access: (0600/-rw-------)
```

### Étape 10 — Cloner le dépôt

```bash
# Toujours en deploy sur le VPS

# Installer git si absent
sudo apt install -y git

# Cloner dans /opt/sharinggo
# Note : /opt/sharinggo existe déjà, git clone dans un dossier vide
cd /opt
sudo rm -rf sharinggo    # retirer le dossier vide créé à l'étape 9
git clone https://github.com/<ORG>/sharinggo.git sharinggo
# OU via SSH si tu as configuré une deploy key :
# git clone git@github.com:<ORG>/sharinggo.git sharinggo

# Recréer les dossiers manquants après clone
mkdir -p /opt/sharinggo/backups
touch /opt/sharinggo/.env.prod
chmod 600 /opt/sharinggo/.env.prod

# Vérifier
git -C /opt/sharinggo log --oneline -3
```

### Étape 11 — Ajouter la clé SSH GitHub Actions

```bash
# [LOCAL] Générer une clé ED25519 dédiée à GitHub Actions (voir DEPLOY-01-G-cicd.md §2.1)
ssh-keygen -t ed25519 -C "github-actions-deploy@sharinggo" \
  -f ~/.ssh/sharinggo_deploy
# Laisser la passphrase vide

cat ~/.ssh/sharinggo_deploy.pub
# → copier cette ligne
```

```bash
# Sur le VPS (en tant que deploy)
echo "ssh-ed25519 AAAA... github-actions-deploy@sharinggo" \
  >> /home/deploy/.ssh/authorized_keys

# [LOCAL] Tester la connexion GitHub Actions
ssh -i ~/.ssh/sharinggo_deploy deploy@<IP_VPS> "echo OK"
# Attendu : OK (sans demande de passphrase)
```

```bash
# [LOCAL] Copier la clé privée dans GitHub Secrets
cat ~/.ssh/sharinggo_deploy
# → GitHub → Settings → Secrets → Actions → VPS_SSH_KEY (coller le contenu complet)
# → VPS_HOST = <IP_VPS>
# → VPS_USER = deploy
```

---

## 3. Checklist de validation finale

Cocher chaque point après exécution.

### VPS

- [ ] VPS CX31 Ubuntu 24.04 créé sur Hetzner Cloud
- [ ] IP publique notée : `___________________`
- [ ] Hostname : `sharinggo-prod-01` (`hostname` = `sharinggo-prod-01`)
- [ ] Timezone : UTC (`timedatectl` = `UTC`)
- [ ] `apt upgrade` complété sans erreur

### Accès SSH

- [ ] User `deploy` créé
- [ ] `ssh deploy@<IP_VPS>` → connexion OK, `whoami` = `deploy`
- [ ] `sudo whoami` → `root` (sans mot de passe)
- [ ] Login `root` SSH refusé (`Permission denied (publickey)`)
- [ ] Auth par mot de passe désactivée

### Firewall

- [ ] `ufw status verbose` → `Status: active`
- [ ] Port 22 ouvert
- [ ] Port 80 ouvert
- [ ] Port 443 ouvert
- [ ] Aucun autre port ouvert en entrée

### Sécurité

- [ ] `fail2ban` actif : `systemctl is-active fail2ban` → `active`
- [ ] `fail2ban-client status sshd` → jail SSH activée
- [ ] `unattended-upgrades` activé

### Docker

- [ ] `docker --version` → version affichée (≥ 26)
- [ ] `docker compose version` → version affichée (≥ 2.24)
- [ ] `docker run --rm hello-world` → Hello from Docker!
- [ ] `groups deploy` contient `docker`

### Dossier projet

- [ ] `/opt/sharinggo` existe, owner `deploy:deploy`
- [ ] `/opt/sharinggo/backups` existe
- [ ] `/opt/sharinggo/.env.prod` existe
- [ ] `stat .env.prod` → `0600` (`-rw-------`)
- [ ] `git -C /opt/sharinggo log --oneline -1` → dernier commit du dépôt

### GitHub Actions

- [ ] Clé `sharinggo_deploy` (ED25519) générée localement
- [ ] Clé publique ajoutée dans `~/.ssh/authorized_keys` du user `deploy`
- [ ] Secret `VPS_SSH_KEY` créé dans GitHub
- [ ] Secret `VPS_HOST` créé dans GitHub (`<IP_VPS>`)
- [ ] Secret `VPS_USER` créé dans GitHub (`deploy`)
- [ ] Test SSH local avec la clé privée → `OK`

---

## 4. Résultats à reporter ici après exécution

| Champ | Valeur |
|-------|--------|
| IP VPS | *(à compléter)* |
| Région Hetzner | *(à compléter)* |
| Date provisioning | 2026-06-27 |
| Version Docker | *(à compléter)* |
| Version Docker Compose | *(à compléter)* |
| Version Ubuntu | Ubuntu 24.04 LTS |
| Clé SSH deploy | `~/.ssh/sharinggo_deploy` (local) |
| Date validation checklist | *(à compléter)* |

---

## 5. Points restants pour H2

| Item | Ticket | Prérequis |
|------|--------|-----------|
| DNS `sharinggo.fr` → IP VPS | DEPLOY-01-H2 | IP VPS connue (ce ticket) |
| DNS `api.sharinggo.fr` → IP VPS | DEPLOY-01-H2 | IP VPS connue |
| Caddy HTTPS (`/etc/caddy/Caddyfile`) | DEPLOY-01-H2 | DNS propagé |
| `.env.prod` rempli (Stripe, Sentry, DB, Google) | DEPLOY-01-H2 | Secrets créés (Stripe Live, Sentry DSN, Google OAuth prod) |
| Premier déploiement via `git tag v0.1.0` | DEPLOY-01-H2 | DNS + `.env.prod` + GitHub Secrets OK |
| Validation GitHub Actions CI/CD en conditions réelles | DEPLOY-01-H2 | Déploiement réussi |
| Smoke tests production (`/health`, `/ready`, Stripe webhook) | DEPLOY-01-H2 | Application démarrée |

---

## 6. Documents liés

| Document | Rôle |
|----------|------|
| `docs/ops/DEPLOY-01-G-cicd.md` | Workflows GitHub Actions — secrets à créer |
| `docs/ops/DEPLOY-01-SECRETS.md` | Variables `.env.prod` complètes |
| `docs/ops/DEPLOY-01-RUNBOOK.md` | Runbook global — §3 VPS |
| `docs/ops/DEPLOY-01-BACKUP-RESTORE.md` | Stratégie backup (cron à configurer en H2) |
| `scripts/provision-vps.sh` | Script de provisioning automatisé (référence) |
