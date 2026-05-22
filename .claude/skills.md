# AI Skills Registry — Sharing Go

**Avant toute feature :** `docs/methodology/BMAD.md` + PRD dans `docs/prd/active/`.

Choisir le fichier à la **racine de `.claude/`** selon la tâche. Index : `docs/README.md`.

## Règles globales (souvent combinées)

| Fichier | Usage |
|---------|--------|
| `project-constitution.md` | CDC, périmètre V1, stack imposée |
| `security-baseline.md` | Helmet, CORS, auth, Stripe, backups |
| `rules.md` | Standards TS, Express, React, Git |

## Spécialistes

| Fichier | Usage |
|---------|--------|
| `seniordev.md` | Implémentation, Prisma, transactions métier, bugs |
| `architecte-api.md` | REST, modules core, Zod, mandatory route checks |
| `constructeur-ui.md` | Écrans React, Tailwind, DESIGN.md, parcours convoyeur |
| `reviewer-securite-code.md` | Audit sécurité avant merge → APPROVE / BLOCK |
| `code-review.md` | Review PR, conformité CDC |
| `ingenieur.md` | Docker Compose, Nginx, Postgres, VPS |
| `createur-workflow.md` | GitHub Actions, deploy DEV→RECETTE→PREPROD→PROD |
| `environments.md` | DEV/REC/PREPROD/PROD, backups, rabattage hebdo REC, Stripe par env |

## Plugins Claude Code (projet)

Config : `.claude/settings.json`

| Plugin | Marketplace | Statut |
|--------|-------------|--------|
| `frontend-design` | `claude-code-plugins` (`anthropics/claude-code`) | Installé · scope **project** |

**Priorité design Sharing Go :** `DESIGN.md` (noir + vert, sobre, pas de dégradé) **prime** sur les esthétiques « distinctives » du plugin `frontend-design`.

Compléter avec skills repo : `impeccable`, `design-taste-frontend`, `emil-design-eng` — voir `AGENTS.md`.

### Marketplace `anthropics/claude-mode`

Le dépôt public `anthropics/claude-mode` **n’existe pas** sur GitHub (2026-05). Utiliser `anthropics/claude-code` → marketplace `claude-code-plugins` (déjà ajouté au projet).

```bash
claude plugin marketplace add anthropics/claude-code --scope project
claude plugin install frontend-design@claude-code-plugins --scope project
```

## Rappel

- Paiement / réservation → `architecte-api.md` + `reviewer-securite-code.md`
- Infra / deploy → `ingenieur.md` + `environments.md` + `createur-workflow.md`
- Frontend → `constructeur-ui.md` + `DESIGN.md`

## Comment invoquer (Claude Code)

Exemple : *« Applique `architecte-api.md` pour le module pending-reservations »* ou *« Review selon `reviewer-securite-code.md` »*.
