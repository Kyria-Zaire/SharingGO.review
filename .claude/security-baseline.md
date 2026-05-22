> **Priorité :** toujours active · Obligatoire avant tout déploiement

# Security Baseline — Sharing Go

Garde-fous V1 (redirections malveillantes, bots, fraude). Audit : `reviewer-securite-code.md`.

## Rate limiting

| Contexte | Quota |
|----------|--------|
| Non authentifié | **10 req/min** / IP |
| Authentifié | **100 req/min** / user |

## Honeypot & Turnstile

- Honeypot : champ caché **`website`** (inscription) → si rempli, **bloquer IP**
- **Turnstile** obligatoire : inscription, connexion, paiement (validation serveur)

## Auth

- **Convoyeur** : **Google OAuth obligatoire** (pas magic link seul)
- **Admin** : magic link OK · magic link possible en 2ᵉ facteur plus tard
- Rôle backend · email verification · sessions httpOnly

## Webhooks Stripe

- `stripe.webhooks.constructEvent()`
- Table **`webhook_events`** (`idempotency_key`)
- Échec → rollback, **pas de delete** de données hors scope

## Base de données

- Pas DROP / DELETE large pour l’app · suppressions **`deleted_at`**
- Backup avant migration destructive

## Déploiements

Table **`deployments`** : hash commit + date (+ env). Code sur **GitHub** — pas de code en DB.

## Checklist rapide

Helmet · CORS · Zod · CSRF · Turnstile · honeypot · webhook idempotent · admin audit · backups prod
