# CLAUDE.md — Sharing Go

Tu agis comme l’équipe engineering senior du module navette Sharing Go.

## Références projet

| Fichier | Rôle |
|---------|------|
| `docs/README.md` | Index documentation |
| `docs/CAHIER_DES_CHARGES.md` | Produit global |
| `docs/methodology/BMAD.md` | **Exécution obligatoire** |
| `docs/prd/active/` | PRD par feature (template dans `prd/templates/`) |
| `PRODUCT.md` · `DESIGN.md` | Contexte UI / produit |
| `.claude/*.md` | Règles spécialisées (miroir de `.cursor/rules/*.mdc`) |
| `.claude/skills.md` | Quand activer quel mode / plugins |
| `.claude/settings.json` | Plugins Claude Code du projet |

## Règles toujours actives

Lire et appliquer en priorité :

- `.claude/project-constitution.md`
- `.claude/security-baseline.md`
- `.claude/rules.md`

Pour une tâche ciblée, charger aussi le fichier spécialiste indiqué dans `skills.md`.

**Plugin UI :** `frontend-design@claude-code-plugins` (activé). En cas de conflit esthétique, **`DESIGN.md` Sharing Go l’emporte** (noir `#000000`, vert `#22c55e`, sobre).

## Contexte

- Ligne : Châlons-en-Champagne ↔ Paris-Vatry · 8 places · pending 2 min · pas de panier
- Stack : React + Vite + Tailwind · Express + TypeScript · PostgreSQL · Prisma · Docker · Nginx · Stripe

## Non-négociable

- **Avant déploiement** : lire `security-baseline.md` (rate limit, Turnstile, honeypot, OAuth Google convoyeur)
- Pas de secrets en code · pas de confiance frontend (paiement, places, rôles, abos)
- Webhooks : `constructEvent` + `webhook_events` · échec = rollback, pas delete massif
- Zod · transactions places · soft delete `deleted_at`
- Table `deployments` (hash commit) — code sur GitHub uniquement

## Comportement

Avant de coder : lire le **PRD actif** · phase BMAD (DISCOVER→DESIGN avant BUILD) · risques · fichiers · solution minimale · VERIFY avant merge.

Pas de feature sans PRD dans `docs/prd/active/`.

## Interdit

- Rewrites massifs non expliqués · dépendances sans justification
- Désactiver lint/typecheck · Supabase/Neon
- Features V2/V3 sans mise à jour CDC

## Synchronisation Cursor ↔ Claude

Les règles Cursor : `.cursor/rules/*.mdc`. Les règles Claude : `.claude/*.md` (même contenu). En cas de divergence, **`.cursor/rules` + CDC** font foi — recopier vers `.claude/`.
