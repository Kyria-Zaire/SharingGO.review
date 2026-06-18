# F4A-T5A — Backend Google OAuth Foundation

Ticket : vérification Google ID Token côté backend, liaison compte CONVOYEUR, session cookie existante.

## Endpoint

| Méthode | Route | Auth | Rate limit |
|---------|-------|------|------------|
| `POST` | `/api/auth/google` | Publique | `authLimiter` (10 / 15 min / IP) |

### Request

```json
{
  "idToken": "<Google ID Token JWT>"
}
```

Validation Zod : `idToken` requis, non vide.

### Response

- **200** — utilisateur existant (OAuth déjà lié ou email connu)
- **201** — nouveau `User` CONVOYEUR créé
- Body : **`UserSafe` direct** (aligné `GET /api/auth/me`), pas `{ user }`
- Cookie HttpOnly posé (`SESSION_COOKIE_NAME`, TTL `SESSION_TTL_DAYS`)

### Erreurs

| Code HTTP | `error.code` | Cas |
|-----------|--------------|-----|
| 400 | `VALIDATION_ERROR` | Body invalide |
| 401 | `INVALID_GOOGLE_TOKEN` | Signature / audience / token invalide |
| 401 | `GOOGLE_EMAIL_MISSING` | Claim `email` absent |
| 401 | `GOOGLE_EMAIL_NOT_VERIFIED` | `email_verified !== true` |
| 403 | `ACCOUNT_DISABLED` | `User.deletedAt` renseigné |
| 429 | `RATE_LIMITED_AUTH` | Trop de tentatives |

## Flow

```text
Client POST { idToken }
  → google-auth-library verifyIdToken (audience = GOOGLE_CLIENT_ID)
  → extraire sub, email, given_name, family_name
  → 1. OAuthAccount (provider=google, providerUserId=sub) ?
  → 2. sinon User par email ?
  → 3. sinon créer User CONVOYEUR + OAuthAccount
  → recordUserLastLogin
  → createSessionForUser (session opaque + cookie — logique S0-T4)
  → UserSafe
```

Règles :
- Ne pas écraser `firstName` / `lastName` existants — compléter seulement si vides
- Compte soft-deleted → refus
- Pas de `GOOGLE_CLIENT_SECRET` (flux ID Token côté client)

## Modèle Prisma

`OAuthAccount` :
- `provider`, `providerUserId`, `userId`
- `@@unique([provider, providerUserId])`
- `onDelete: Cascade` sur `User`

Migration : `20260618120000_add_oauth_accounts`

## Variables d'environnement

| Variable | Obligatoire | Usage |
|----------|-------------|--------|
| `GOOGLE_CLIENT_ID` | Oui | Audience ID Token Google |

Non ajoutées (hors scope) : `GOOGLE_CLIENT_SECRET`, redirect URI serveur.

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `backend/src/modules/auth/auth.google.service.ts` | Vérification token + résolution user |
| `backend/src/modules/auth/auth.controller.ts` | `googleAuthHandler` |
| `backend/src/modules/auth/auth.routes.ts` | Route `POST /google` |
| `backend/src/modules/auth/auth.service.ts` | `createSessionForUser` exporté |
| `backend/src/config/env.ts` | `googleClientId` |
| `backend/prisma/schema.prisma` | `OAuthAccount` |

## Limites hors scope (F4A-T5A)

- Aucun frontend
- Aucun JWT auth utilisateur
- Aucun refresh token
- Pas Turnstile / CSRF / honeypot
- Pas de redirect OAuth serveur (authorization code flow)
- Auth email/password inchangée (`/login`, `/register`)

## Prochain ticket recommandé

**F4A-T5B** — Passenger frontend : Google Identity Services → `POST /api/auth/google` + session UI.

## Dépendance

- `google-auth-library` (npm)
