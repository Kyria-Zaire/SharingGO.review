# WEB-CONTACT-01 — Centre de contact & support

**Statut :** en attente validation CTO  
**Route :** `/contact` (publique)

## Objectif

Point d'entrée unique du support — hero, moyens de contact, formulaire MVP (désactivé), FAQ, réassurance.

## Livrables

| Zone | Détail |
|------|--------|
| Hero | Titre, sous-titre, CTA mailto |
| Moyens | Email · Téléphone · Centre d'aide |
| Formulaire | Champs complets · bouton désactivé · note honnête |
| FAQ | 4 questions → `/help#anchor` |
| Réassurance | 5 thématiques support |
| Liens | Help · CGU · Privacy · Notice |

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
node ../../tmp-screenshot-contact.mjs
```

Captures : `docs/qa/WEB-CONTACT-01-desktop.png`, `WEB-CONTACT-01-mobile.png`
