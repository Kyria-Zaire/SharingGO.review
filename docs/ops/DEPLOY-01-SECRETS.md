# DEPLOY-01-SECRETS — Production Secrets & Environment Provisioning

> Référence opérationnelle pour provisionner `.env.prod` sur le VPS SharingGO.  
> Aucun secret réel dans ce fichier. Template : `.env.prod.example` à la racine du repo.

---

## 1. Variables par catégorie

### Légende

| Symbole | Signification |
|---------|---------------|
| **[R]** | Requis — `requireEnv()` dans `backend/src/config/env.ts` — le backend refuse de démarrer si absent ou invalide |
| **[O]** | Optionnel en V1 — non consommé par `requireEnv`, ignoré au démarrage si absent |
| **[B]** | Build-time Vite — injecté au `docker build`, pas lu au runtime |
| **[PG]** | Consommé par le container postgres directement (pas le backend) |

### Environnement

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `NODE_ENV` | **[R]** | `production` | Hardcodé dans compose |
| `PORT` | **[R]** | `3000` | `.env.prod` |
| `ALLOW_DEMO_SEED` | **[O]** | `false` | Hardcodé dans compose — ne pas surcharger |
| `ENABLE_API_DOCS` | **[O]** | `false` | Hardcodé dans compose — ne pas surcharger |

### PostgreSQL

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `POSTGRES_USER` | **[PG]** | `sharinggo` | `.env.prod` |
| `POSTGRES_PASSWORD` | **[PG]** | Secret généré | `openssl rand -base64 32` |
| `POSTGRES_DB` | **[PG]** | `sharinggo` | `.env.prod` |
| `DATABASE_URL` | **[R]** | `postgresql://sharinggo:<PASSWORD>@postgres:5432/sharinggo?schema=public` | `.env.prod` — doit pointer vers le service Docker `postgres` |

### CORS & URLs

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `CORS_ORIGIN` | **[R]** | `https://sharinggo.fr,https://www.sharinggo.fr,https://admin.sharinggo.fr` | `.env.prod` |
| `APP_URL` | **[O]** | `https://sharinggo.fr` | `.env.prod` |
| `ADMIN_URL` | **[O]** | `https://admin.sharinggo.fr` | `.env.prod` |
| `API_URL` | **[O]** | `https://api.sharinggo.fr` | `.env.prod` |
| `FRONTEND_URL` | **[O]** | `https://sharinggo.fr` | `.env.prod` |

### Sessions

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `SESSION_TTL_DAYS` | **[R]** | `7` | `.env.prod` |
| `SESSION_COOKIE_NAME` | **[R]** | `sharinggo_session` | `.env.prod` |
| `SESSION_SECRET` | **[NON UTILISÉ V1]** | — | Le backend utilise des tokens opaques `randomBytes(32)` hashés SHA-256 en DB. Le cookie `httpOnly` n'est **pas** signé par express-session. Aucune lecture de `SESSION_SECRET` dans `backend/src/`. Prévu S1+ si migration express-session. |

### Argon2

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `ARGON2_MEMORY_COST` | **[R]** | `65536` | `.env.prod` — ne pas réduire |
| `ARGON2_TIME_COST` | **[R]** | `3` | `.env.prod` |
| `ARGON2_PARALLELISM` | **[R]** | `1` | `.env.prod` |

### JWT & Boarding

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `BOARDING_JWT_SECRET` | **[R]** | Secret généré ≥ 32 chars | `openssl rand -base64 48` — vérifié par `requireEnv` + `length < 32` dans `env.ts:140`. Utilisé dans `boarding-jwt.ts:69` pour signer/vérifier les QR (HS256). |
| `JWT_PRIVATE_KEY` | **[NON UTILISÉ V1]** | — | Réservé pour la migration vers RS256/EdDSA documentée dans `boarding-offline.constants.ts` (`BOARDING_JWT_ALGORITHMS_TARGET`). Absent de tout `requireEnv` en V1. |

### Google OAuth

**Méthode réelle (V1) :** Google One Tap / Identity Services côté passenger. Le frontend obtient un ID token JWT signé par Google et l'envoie via `POST /api/auth/google`. Le backend le vérifie avec `OAuth2Client.verifyIdToken()` (`google-auth-library`). **Pas de redirect OAuth, pas de code exchange serveur.**

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `GOOGLE_CLIENT_ID` | **[R]** | `xxxxxxxxx.apps.googleusercontent.com` | Google Cloud Console — `auth.google.service.ts:16` (`new OAuth2Client`) et `:69` (`audience` dans `verifyIdToken`) |
| `GOOGLE_CLIENT_SECRET` | **[NON UTILISÉ V1]** | — | Non consommé dans `backend/src/`. Flow ID token ne nécessite pas le client secret. Prévu si migration Authorization Code Flow (S2+). |
| `GOOGLE_CALLBACK_URL` | **[NON UTILISÉ V1]** | — | Non consommé dans `backend/src/`. Pas de redirect OAuth en V1. Prévu S2+. |

### Stripe Live

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `STRIPE_SECRET_KEY` | **[R]** | `sk_live_…` | Dashboard Stripe → Développeurs → Clés API |
| `STRIPE_WEBHOOK_SECRET` | **[R]** | `whsec_…` | Dashboard Stripe → Webhooks → endpoint |
| `STRIPE_TICKET_PRICE_CENTS` | **[R]** | `899` | `.env.prod` — **ne pas modifier sans validation CTO** |
| `STRIPE_CURRENCY` | **[R]** | `eur` | `.env.prod` |
| `STRIPE_SUCCESS_URL` | **[R]** | `https://sharinggo.fr/bookings/payment/success?session_id={CHECKOUT_SESSION_ID}` | `.env.prod` |
| `STRIPE_CANCEL_URL` | **[R]** | `https://sharinggo.fr/bookings/payment/cancel` | `.env.prod` |
| `STRIPE_PRICE_MOSOLF_MONTHLY` | **[R]** | `price_live_…` | Dashboard Stripe → Produits (mode Live) |
| `STRIPE_PRICE_CONVOYEUR_MONTHLY` | **[R]** | `price_live_…` | Dashboard Stripe → Produits (mode Live) |
| `STRIPE_SUBSCRIPTION_SUCCESS_URL` | **[R]** | `https://admin.sharinggo.fr/subscription/success` | `.env.prod` |
| `STRIPE_SUBSCRIPTION_CANCEL_URL` | **[R]** | `https://admin.sharinggo.fr/subscription/cancel` | `.env.prod` |

### Cloudflare Turnstile

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `CLOUDFLARE_TURNSTILE_SITE_KEY` | **[O]** | Clé publique widget | Dashboard Cloudflare → Turnstile |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | **[O]** | Clé secrète widget | Dashboard Cloudflare → Turnstile |

Note : Turnstile est validé backend uniquement. Le frontend passenger ne charge pas de script Turnstile (confirmé par grep `frontend/apps/passenger/src/`).

### Frontend passenger (build-time)

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `VITE_API_URL` | **[B]** | `https://api.sharinggo.fr` | Hardcodé dans les `args:` du service `passenger` dans compose |
| `VITE_GOOGLE_CLIENT_ID` | **[B]** | Même valeur que `GOOGLE_CLIENT_ID` | `.env.prod` — lu par le compose comme `${VITE_GOOGLE_CLIENT_ID}` |

### Monitoring

| Variable | Type | Valeur prod | Source |
|----------|------|-------------|--------|
| `SENTRY_DSN` | **[O]** | `https://…@….ingest.sentry.io/…` | Dashboard Sentry → Settings → SDK Setup |

---

## 2. Génération des secrets

```bash
# Session secret (≥ 48 chars recommandé)
openssl rand -base64 48

# JWT private key
openssl rand -base64 48

# Boarding JWT secret (minimum 32 chars — validé au démarrage)
openssl rand -base64 48

# PostgreSQL password
openssl rand -base64 32

# Format hex si préféré (64 chars)
openssl rand -hex 32
```

**Règles :**
- Jamais `Math.random()` ou dérivés pour des secrets cryptographiques.
- Chaque secret doit être unique — ne pas réutiliser le même pour SESSION_SECRET et JWT_PRIVATE_KEY.
- Générer les secrets en local, ne jamais les transiter par un service tiers non chiffré.

---

## 3. Procédure de création `.env.prod` sur le VPS

```bash
# 1. Se connecter au VPS
ssh deploy@<IP_VPS>

# 2. Créer le répertoire de déploiement si inexistant
sudo mkdir -p /opt/sharinggo
sudo chown deploy:deploy /opt/sharinggo

# 3. Copier le template depuis le repo (sur la machine locale)
scp .env.prod.example deploy@<IP_VPS>:/opt/sharinggo/.env.prod

# 4. Sur le VPS — éditer et remplir toutes les valeurs CHANGEME
nano /opt/sharinggo/.env.prod

# 5. Sécuriser les permissions
chmod 600 /opt/sharinggo/.env.prod
chown deploy:deploy /opt/sharinggo/.env.prod
# (ou root:root si l'utilisateur docker est root)

# 6. Vérifier qu'aucun CHANGEME ne subsiste
grep "CHANGEME" /opt/sharinggo/.env.prod
# Résultat attendu : aucune ligne

# 7. Vérifier que le fichier est illisible par les autres utilisateurs
ls -la /opt/sharinggo/.env.prod
# Résultat attendu : -rw------- 1 deploy deploy ...
```

---

## 4. Checklist Stripe Production

### Avant déploiement

- [ ] Se connecter au Dashboard Stripe en **mode Live** (toggle en haut à gauche)
- [ ] Copier la clé secrète **live** (`sk_live_…`) — jamais `sk_test_…`
- [ ] Créer un endpoint webhook pour `https://api.sharinggo.fr/api/webhooks/stripe`
- [ ] Copier le `whsec_…` généré par Stripe pour cet endpoint
- [ ] Créer un Product "Navette SharingGO" avec un Price récurrent mensuel pour chaque abonnement :
  - Convoyeur mensuel → noter le `price_live_…`
  - Mosolf mensuel → noter le `price_live_…`

### Événements webhook à activer sur l'endpoint

```
checkout.session.completed
checkout.session.expired
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

### Test vs Live — règle absolue

| Élément | Test | Live |
|---------|------|------|
| Clé secrète | `sk_test_…` | `sk_live_…` |
| Price ID | `price_1TaCv…` | `price_live_…` (nouveau) |
| Webhook secret | `whsec_…` (test) | `whsec_…` (live, différent) |
| Cartes de test | `4242 4242 4242 4242` | Cartes réelles |

**Ne jamais copier un `price_` de test en production.** Les Price IDs test sont invalides avec une clé live — Stripe retourne une erreur `No such price`.

### Ticket unitaire

```
STRIPE_TICKET_PRICE_CENTS=899   # 8,99 € TTC — validé CTO
```

Ce montant est codé dans `.env.prod` et vérifié par `requireEnv` au démarrage. Toute modification nécessite une validation CTO et un redéploiement.

---

## 5. Checklist Google OAuth Production

### Configuration Google Cloud Console

- [ ] Ouvrir [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
- [ ] Sélectionner ou créer un OAuth 2.0 Client ID de type **Web application**
- [ ] Dans **Authorized JavaScript origins**, ajouter :
  ```
  https://sharinggo.fr
  https://admin.sharinggo.fr
  ```
- [ ] Dans **Authorized redirect URIs**, ajouter :
  ```
  https://api.sharinggo.fr/api/auth/google/callback
  ```
- [ ] Copier le **Client ID** → `GOOGLE_CLIENT_ID` dans `.env.prod`
- [ ] Copier le **Client Secret** → `GOOGLE_CLIENT_SECRET` dans `.env.prod`

### Relation GOOGLE_CLIENT_ID / VITE_GOOGLE_CLIENT_ID

`VITE_GOOGLE_CLIENT_ID` (build-time passenger) doit avoir **la même valeur** que `GOOGLE_CLIENT_ID` (backend). Ce sont deux variables distinctes car l'une est injectée dans le bundle Vite au build, l'autre est lue par le backend à l'exécution.

```bash
# Dans .env.prod
GOOGLE_CLIENT_ID=xxxxxxxxx.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=xxxxxxxxx.apps.googleusercontent.com   # même valeur
```

---

## 6. Scan anti-secrets

Commande à exécuter avant tout commit ou push :

```bash
# Détecter les secrets live potentiels dans les fichiers versionnés
rg "sk_live|whsec_[a-zA-Z0-9]{10}|rk_live|client_secret[^_=]|BEGIN PRIVATE KEY|BEGIN RSA" \
  --glob "!.git" \
  --glob "!node_modules" \
  --glob "!*.env.prod"

# Vérifier que .env.prod n'est pas suivi par git
git status .env.prod
# Résultat attendu : fichier absent de git status (gitignored)

# Vérifier que .env.prod.example ne contient pas de valeurs réelles
grep -E "sk_live_[a-zA-Z0-9]{20}|whsec_[a-zA-Z0-9]{20}" .env.prod.example
# Résultat attendu : aucune ligne
```

---

## 7. Validation locale (sans démarrage prod)

```bash
# Créer un .env.prod factice pour valider la syntaxe du compose
cat > /tmp/.env.prod.validate << 'EOF'
POSTGRES_USER=sharinggo
POSTGRES_PASSWORD=fakeforfakefake
POSTGRES_DB=sharinggo
DATABASE_URL=postgresql://sharinggo:fakeforfakefake@postgres:5432/sharinggo?schema=public
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://sharinggo.fr,https://www.sharinggo.fr,https://admin.sharinggo.fr
SESSION_TTL_DAYS=7
SESSION_COOKIE_NAME=sharinggo_session
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=1
BOARDING_JWT_SECRET=fakeforfakefakefakefakefakefakefake
GOOGLE_CLIENT_ID=fake.apps.googleusercontent.com
STRIPE_SECRET_KEY=sk_test_fakeforfakeforfakeforfake
STRIPE_WEBHOOK_SECRET=whsec_fakeforfakeforfake
STRIPE_SUCCESS_URL=https://sharinggo.fr/bookings/payment/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=https://sharinggo.fr/bookings/payment/cancel
STRIPE_TICKET_PRICE_CENTS=899
STRIPE_CURRENCY=eur
STRIPE_PRICE_MOSOLF_MONTHLY=price_fakeforfake
STRIPE_PRICE_CONVOYEUR_MONTHLY=price_fakeforfake
STRIPE_SUBSCRIPTION_SUCCESS_URL=https://admin.sharinggo.fr/subscription/success
STRIPE_SUBSCRIPTION_CANCEL_URL=https://admin.sharinggo.fr/subscription/cancel
VITE_GOOGLE_CLIENT_ID=fake.apps.googleusercontent.com
EOF

# Valider la syntaxe du compose
docker compose -f docker-compose.prod.yml --env-file /tmp/.env.prod.validate config --quiet

# Nettoyer
rm /tmp/.env.prod.validate
```

Résultat attendu : exit 0, warning sur `VITE_GOOGLE_CLIENT_ID` si non défini dans le fichier factice.
