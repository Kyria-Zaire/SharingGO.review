# F3-T12 — Settings & Team Management

## Résumé

Module fullstack de gestion d'équipe admin : CRUD utilisateurs (soft delete), protections dernier admin / self-service, page Settings avec onglet Team opérationnel et préférences General/Company en localStorage.

## Backend

### Modèle Prisma

| Champ | Détail |
|-------|--------|
| `User.deletedAt` | Soft delete (déjà présent) |
| `User.lastLoginAt` | Nullable — mis à jour à chaque login/register email |
| `User.createdByUserId` | Nullable — renseigné à la création via admin |
| Migration | `20260525120000_add_user_created_by_last_login` |

Relation `createdBy` → `User` (self-reference, `onDelete: SetNull`).

### Endpoints (`ADMIN` / `SUPER_ADMIN`)

| Méthode | Route | Action |
|---------|-------|--------|
| GET | `/api/admin/users` | Liste paginée — **actifs seuls par défaut** |
| POST | `/api/admin/users` | Création (mot de passe initial admin, min. 8) |
| PATCH | `/api/admin/users/:id/role` | Changement de rôle |
| DELETE | `/api/admin/users/:id` | Soft delete + invalidation sessions |

#### GET — filtrage

- **Défaut** : `deletedAt IS NULL` (comptes actifs uniquement).
- `includeDisabled=true` : inclut aussi les comptes désactivés (sauf si `status` est déjà fixé).
- `status=ACTIVE` | `status=DISABLED` : filtre explicite.
- `role`, `email`, `limit` (défaut 20, max 100), `offset`.

### Réponse utilisateur safe

`id`, `email`, `firstName`, `lastName`, `userType`, `status`, `createdAt`, `deletedAt`, `lastLoginAt`, `createdByUserId`, `createdBy` (id, email, prénom, nom).

Jamais exposé : `passwordHash`, sessions, tokens.

### Auth — `lastLoginAt`

- `POST /api/auth/login` et `POST /api/auth/register` appellent `recordUserLastLogin()` (`backend/src/lib/user-login.ts`).
- **Google OAuth** (futur S0-T2+) : appeler la même fonction après session créée — voir `docs/features/S0-T4-auth-foundation.md`.

### Mot de passe initial (V1)

L’admin saisit un mot de passe initial à la création. **Limite V1** : pas de génération aléatoire ni d’email d’invitation.

**Futur** : mot de passe aléatoire + envoi email d’invitation + reset password.

### Rôle OPERATOR

Mentionné dans la roadmap produit mais **non ajouté** à l’enum Prisma `UserType` (V1). Rôles assignables : `SUPER_ADMIN`, `ADMIN`, `DRIVER`, `CONVOYEUR`.

### Protections

| Code | Cas |
|------|-----|
| `LAST_ADMIN_PROTECTED` | Suppression ou downgrade du dernier `ADMIN`/`SUPER_ADMIN` actif |
| `SELF_ROLE_CHANGE_FORBIDDEN` | Modifier son propre rôle |
| `SELF_DELETE_FORBIDDEN` | Se désactiver soi-même |
| `ADMIN_USER_EMAIL_ALREADY_EXISTS` | Email déjà utilisé |

### Fichiers backend

- `backend/src/lib/password.ts`, `backend/src/lib/user-login.ts`
- `backend/src/modules/admin/admin-users.*`
- `backend/scripts/f3-t12-admin-users-test.mjs`

## Frontend

### Route `/settings`

Onglets : **Équipe** (API), **Général** / **Société** (localStorage), **Sécurité** / **Système** (informatifs).

- Filtre statut : Actifs (défaut API), Désactivés, Tous (`includeDisabled=true`).
- `lastLoginAt` affiché via `relativeTime` si présent, sinon « Non disponible ».

### localStorage V1

| Clé | Contenu |
|-----|---------|
| `sharinggo.settings.general` | compactMode, relativeTimestamps, autoRefresh, defaultPageSize |
| `sharinggo.settings.company` | companyName, contactEmail, phone, address, logoUrl |

## Tests

```bash
cd backend && npm run lint && npm run build
docker exec sharinggo-backend-dev npx prisma migrate deploy
node scripts/f3-t12-admin-users-test.mjs

cd frontend && npm run lint && npm run build
```

## Futur

- Invitations email, reset password, 2FA, Google OAuth convoyeur.
- `OPERATOR` dans enum + dispatch partagé.
- `CompanySettings` backend.
- Réutilisation email compte désactivé (stratégie DB).
