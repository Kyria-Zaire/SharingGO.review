# S0-T4 — Fondation authentification (provider-agnostic)

Ticket : sessions opaques, cookies sécurisés, register/login/logout/me, RBAC middleware. Aucun OAuth.

## Architecture

```
Client (cookie httpOnly)
    ↓ raw opaque token (64 hex chars)
Express auth routes
    ↓ SHA-256 → hashedToken
PostgreSQL Session
    ↓ userId
User (email, passwordHash Argon2id, userType)
```

## Pourquoi provider-agnostic

Les providers (Google, Apple, magic links) brancheront plus tard sur la même couche :
- `Session` + cookie
- `requireAuth` / `requireRole`
- audit logs auth

Sans réécrire sessions, cookies ni RBAC.

## Modèle `Session`

| Champ | Rôle |
|-------|------|
| `hashedToken` | SHA-256 du token cookie (unique) |
| `expiresAt` | Expiration alignée cookie `maxAge` |
| `userId` | Lien utilisateur |

Le token brut n’est **jamais** stocké en base.

## Stratégie token opaque

1. `crypto.randomBytes(32).toString('hex')` → cookie
2. `sha256(raw)` → DB
3. `requireAuth` : relire cookie → hasher → lookup session

## Cookies

| Flag | Valeur |
|------|--------|
| `httpOnly` | true |
| `secure` | true en `production` |
| `sameSite` | `lax` |
| `path` | `/` |
| `maxAge` | `SESSION_TTL_DAYS` (sync `expiresAt`) |
| nom | `SESSION_COOKIE_NAME` |

## Endpoints (techniques S0-T4)

| Méthode | Route | Auth |
|---------|-------|------|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | `requireAuth` |
| POST | `/api/auth/logout` | — (idempotent 204) |
| GET | `/api/auth/foundation/rbac-admin` | `requireAuth` + `requireRole(ADMIN, SUPER_ADMIN)` |

Register/login sont des endpoints de **stabilisation** — pas le flow produit final (Google OAuth plus tard).

## Middleware

- **`requireAuth`** : cookie → session valide → `req.user`, `req.sessionId` ; session expirée supprimée → 401
- **`requireRole(...roles)`** : vérifie `user.userType` → 403 si insuffisant

## Audit auth (logs JSON)

Actions : `REGISTER_SUCCESS`, `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`.

Inclus : `requestId`, `userId` (si connu), `timestamp`.  
Jamais : password, token, cookie.

## Variables d’environnement

- `SESSION_TTL_DAYS`, `SESSION_COOKIE_NAME`
- `ARGON2_MEMORY_COST`, `ARGON2_TIME_COST`, `ARGON2_PARALLELISM`

## Limites actuelles

- Pas de Google OAuth / Passport / JWT / refresh tokens
- Pas de rate limiting / Turnstile (tickets suivants)
- Pas de frontend auth
- `register`/`login` pourront être désactivés après OAuth

## Intégration Google OAuth (futur)

1. Provider crée ou lie un `User`
2. Appeler `recordUserLastLogin(user.id)` depuis `backend/src/lib/user-login.ts` (F3-T12 — même règle que login email)
3. Appeler `createSessionForUser` (même flow cookie/DB)
4. Réutiliser `requireAuth` / `requireRole` inchangés

## Prisma Docker

```bash
docker exec sharinggo-backend-dev npx prisma migrate dev --name add_auth_foundation
docker exec sharinggo-backend-dev npx prisma migrate deploy
```

Ne pas utiliser l’IP Docker `172.x.x.x` depuis Windows — privilégier le conteneur backend.
