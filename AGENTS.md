# SharingGO — Guide agents

**Projet :** Navette Sharing Go (Châlons-en-Champagne ↔ Paris-Vatry).

**Ingénierie produit :** [`docs/README.md`](docs/README.md)

| Fichier | Rôle |
|---------|------|
| `docs/CAHIER_DES_CHARGES.md` | Produit global V1 |
| `docs/methodology/BMAD.md` | **Exécution obligatoire** (humains + IA) |
| `docs/prd/templates/PRD-template.md` | Modèle — source de vérité **par feature** |
| `docs/prd/active/` | PRD en cours |
| `PRODUCT.md` · `DESIGN.md` | Contexte agents / UI |
| `.cursor/rules/*.mdc` | Rôles Cursor |
| `.claude/*.md` | Rôles Claude Code |
| `.claude/settings.json` | Plugins Claude |

**Merge PR :** PRD actif + DoD + security APPROVE + BMAD.

Ce dépôt configure des **Agent Skills** pour Cursor et les autres agents compatibles (CLI `skills`). Les skills vivent sous `.agents/skills/` ; le registre verrouillé est `skills-lock.json`.

## Stack design (prioritaire)

Utiliser ces skills pour tout travail **frontend / UI**. Les combiner selon le besoin : structure d’abord, motion ensuite, anti-slop en continu.

| Priorité | Skill | Rôle | Chemin |
|----------|-------|------|--------|
| 1 | **impeccable** | Layout, espacement, typo, couleur, hiérarchie, audit, polish, UX | `.agents/skills/impeccable/` |
| 2 | **emil-design-eng** | Motion, easing, micro-interactions, polish « invisible » | `.agents/skills/emil-design-eng/` |
| 3 | **design-taste-frontend** | Anti-slop : évite les biais UI génériques des LLM | `.agents/skills/design-taste-frontend/` |
| — | **image-to-code** | Image → analyse → code (landings, hero, marketing) | `.agents/skills/image-to-code/` |

### Quand invoquer quel skill

- **Nouvelle page, landing, hero, refonte visuelle forte** → `image-to-code` (workflow obligatoire : générer les images design, les analyser en profondeur, puis coder).
- **Composant, dashboard, formulaire, spacing, typo** → `impeccable` (+ sous-commandes : `craft`, `shape`, `audit`, `polish`, etc. — voir `reference/` dans le skill).
- **Animations, transitions, `:active`, courbes, `transform-origin`** → `emil-design-eng`.
- **Tout frontend** où l’UI risque d’être « template IA » → `design-taste-frontend` (baseline : variance 8, motion 6, densité 4).

### Impeccable — contexte projet

Avant design ou refonte, l’agent doit charger le contexte :

1. **PRODUCT.md** (requis) — utilisateurs, ton, anti-références.
2. **DESIGN.md** (recommandé) — couleurs, typo, tokens, composants.

Placer ces fichiers à la racine du projet (ou dans `.agents/context/` / `docs/`). Sans eux, Impeccable produit du générique.

### image-to-code — règles clés

- Une image **lisible par section**, pas un seul board compressé.
- Pas de « cards dans cards dans cards ».
- Hero **spacieux**, lisible sur petit laptop.
- Fidélité maximale entre l’image de référence et le code final.

## Skills Taste (complémentaires)

Installés depuis `leonxlnx/taste-skill` (casse GitHub : **`leonxlnx`**, pas `LeonxInx`).

| Skill | Usage typique |
|-------|----------------|
| `brandkit` | Système de marque / tokens |
| `minimalist-ui` | UI épurée |
| `industrial-brutalist-ui` | Brutalisme industriel |
| `high-end-visual-design` | Direction visuelle haut de gamme |
| `imagegen-frontend-web` / `imagegen-frontend-mobile` | Génération d’assets web / mobile |
| `redesign-existing-projects` | Refonte d’un existant |
| `stitch-design-taste` | Intégration design type Stitch |
| `gpt-taste` | Variante orientée GPT |
| `full-output-enforcement` | Sorties complètes, pas tronquées |

Skill anti-slop principal : **`design-taste-frontend`**.

## Installation et mise à jour

À la racine du projet :

```powershell
# Piliers design
npx skills add emilkowalski/skill --yes
npx skills add pbakaus/impeccable --yes
npx skills add leonxlnx/taste-skill --yes

# Uniquement image-to-code
npx skills add leonxlnx/taste-skill --skill image-to-code --yes
```

Après installation : **rouvrir le projet** ou démarrer une **nouvelle session** Cursor pour recharger les skills.

Sources :

- [emilkowalski/skill](https://github.com/emilkowalski/skill) — emil-design-eng
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
- [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill)
- Index : [skills.sh](https://skills.sh)

Ressources communauté : [beacons.ai/ia.irl](https://beacons.ai/ia.irl)

## Conventions agents (général)

1. **Frontend** : vérifier `package.json` avant d’importer une lib (framer-motion, lucide, etc.).
2. **Stack par défaut** (sauf consigne utilisateur) : React / Next.js, Tailwind, Server Components ; interactivité isolée en `'use client'`.
3. **Sécurité** : les skills s’exécutent avec les permissions de l’agent — relire `SKILL.md` avant usage en prod.
4. **Commits** : ne committer que sur demande explicite ; ne pas versionner de secrets (`.env`, clés API).

## Fichiers de référence

```
SharingGO/
├── AGENTS.md                 # ce fichier
├── PRODUCT.md                # produit V1 (Impeccable)
├── DESIGN.md                 # design imposé
├── docs/
│   ├── CAHIER_DES_CHARGES.md
│   ├── methodology/BMAD.md
│   ├── prd/templates/PRD-template.md
│   ├── prd/active/
│   ├── architecture/ · security/ · infra/ · decisions/
├── .cursor/rules/*.mdc
├── .claude/*.md
├── skills-lock.json          # versions / hashes des skills
└── .agents/skills/
    ├── emil-design-eng/
    ├── impeccable/
    ├── design-taste-frontend/
    ├── image-to-code/
    └── …                     # autres skills taste-skill
```

## Workflow type — nouvelle landing

1. Invoquer **`image-to-code`** : générer les visuels par section.
2. Analyser chaque image (hiérarchie, espacement, typo, couleur).
3. Implémenter le frontend en s’appuyant sur **`design-taste-frontend`**.
4. Passer **`impeccable`** (`audit` / `polish`) sur layout et typo.
5. Finir avec **`emil-design-eng`** pour motion et états interactifs.

---

*Dernière mise à jour des skills : voir `skills-lock.json`.*
