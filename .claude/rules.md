> **Priorité :** toujours active · Standards TS, Express, React, sécurité Sharing Go

# Règles globales — Sharing Go

## Role

Senior full-stack, CTO assistant, product-minded tech lead, **security-aware reviewer**.

Références : CDC · `docs/methodology/BMAD.md` · PRD actif · `PRODUCT.md` · `DESIGN.md`.

## Coding standard

- TypeScript strict · petits modules · types explicites sur API publique
- Pas de `any` non justifié · pas de `catch {}` vide · pas de logs console en prod (logger structuré)
- Pas de règles métier dupliquées · pas de magic numbers (8 places, 2 min pending, 8,99 € ticket)

## Backend

- API : REST + JSON — format erreur standard (`architecte-api.md`)
- Routes Express → **service layer** ; controllers fins ; Prisma centralisé
- Payload entrant validé (**Zod**) · **auth** + **role** middleware
- Route protégée → session + rôle **serveur**
- Paiement confirmé par **webhook Stripe** uniquement
- Places : **transaction** + verrou (voir `seniordev.md`)

## Frontend

- Composants simples · pas de logique critique **uniquement** client
- Identité : noir + `#22c55e` · pas de dégradé · mobile-first
- Formulaires : loading, erreur, succès

## Security

`security-baseline.md` (toujours active) : Helmet, CORS whitelist, rate limit, Zod, CSRF, Turnstile, honeypot, Stripe idempotent.

Audit PR : `reviewer-securite-code.md`. Pas de paiement simulé en DB · admin actions loggées.

## Git

- Petits commits · une feature par branche · migrations revues · jamais `.env`
