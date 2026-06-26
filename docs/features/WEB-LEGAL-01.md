# WEB-LEGAL-01 — Conditions Générales d'Utilisation

**Statut :** en attente validation CTO  
**Route :** `/legal/terms` (publique)

## Objectif

Page CGU premium, structure UX professionnelle, contenu synthétique remplaçable par un juriste.

## Livrables

| Zone | Détail |
|------|--------|
| Hero | Titre, date MAJ, intro |
| Sommaire | Sticky desktop · accordéon mobile |
| Sections | 13 sections avec icônes discrètes |
| Navigation | Scroll fluide + surbrillance section active |
| Contact | Email, téléphone, CTA → `/contact` |
| Footer légal | Liens vers privacy, notice, contact, CGU |
| Routes préparées | `/legal/privacy`, `/legal/notice`, `/contact` |

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
node ../../tmp-screenshot-legal-terms.mjs
```

Captures : `docs/qa/WEB-LEGAL-01-desktop.png`, `WEB-LEGAL-01-mobile.png`
