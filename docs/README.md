# Documentation — Sharing Go

Système d'ingénierie produit (décision CTO).

## Hiérarchie des sources

| Priorité | Document | Portée |
|----------|----------|--------|
| 1 | [`CAHIER_DES_CHARGES.md`](CAHIER_DES_CHARGES.md) | Produit global V1 |
| 2 | [`methodology/BMAD.md`](methodology/BMAD.md) | Exécution obligatoire (humains + IA) |
| 3 | [`prd/active/*.md`](prd/active/) | Une feature = un PRD |
| 4 | [`prd/templates/PRD-template.md`](prd/templates/PRD-template.md) | Modèle PRD |
| 5 | Racine : `PRODUCT.md`, `DESIGN.md` | Contexte agents / UI |

## Arborescence

```txt
docs/
├── README.md                 # ce fichier
├── CAHIER_DES_CHARGES.md     # CDC v1.x
├── prd/
│   ├── templates/
│   │   └── PRD-template.md   # source de vérité par feature (modèle)
│   └── active/               # PRD en cours (PRD-001-reservation.md, …)
├── methodology/
│   └── BMAD.md               # BUILD → MEASURE → ANALYZE → DECIDE
├── architecture/             # MONOREPO, coding standards, API (à venir)
├── security/                 # baseline, audits, incidents
├── infra/                    # envs, Docker, deploy, backups
└── decisions/                # ADR / décisions majeures
```

## Démarrer une feature

1. Copier `prd/templates/PRD-template.md` → `prd/active/PRD-XXX-nom.md`
2. Remplir en phase **DISCOVER** (statut PRD)
3. Suivre [`methodology/BMAD.md`](methodology/BMAD.md)
4. Merger uniquement si DoD + security **APPROVE**

## Prochaine étape CTO (ordre imposé)

1. `architecture/MONOREPO-ARCHITECTURE.md`
2. `architecture/CODING-STANDARDS.md`
3. `architecture/API-CONVENTIONS.md`
4. Bootstrap infra + Docker
