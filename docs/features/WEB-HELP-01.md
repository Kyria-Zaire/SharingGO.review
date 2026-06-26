# WEB-HELP-01 — Centre d'aide passager

**Statut :** en attente validation CTO  
**Route :** `/help` (auth requise)

## Objectif

Centre d'aide premium, 100 % frontend — recherche locale, catégories, FAQ accordéon, support et liens utiles.

## Livrables

| Zone | Détail |
|------|--------|
| Hero | Titre, sous-titre, CTA mailto support |
| Recherche | Filtrage instantané question / réponse / catégorie |
| Catégories | 7 thèmes + « Toutes » |
| FAQ | 13 questions alignées MVP (pas de promesses fictives) |
| Support | Email, téléphone, CTA mailto |
| Liens utiles | Légal (home #hash), Profil, Paramètres, Abonnements |
| Conseils trajet | Style boarding pass (4 tips) |
| Empty state | Recherche sans résultat + CTA support |
| États | Skeleton chargement, HelpErrorCard (composant prêt) |

## Architecture

```
features/help/
  constants/help-content.ts
  lib/help-categories.ts, help-search.ts
  components/Help*.tsx
pages/HelpPage.tsx
```

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
node ../../tmp-screenshot-help.mjs
```

Captures : `docs/qa/WEB-HELP-01-desktop.png`, `WEB-HELP-01-mobile.png`
