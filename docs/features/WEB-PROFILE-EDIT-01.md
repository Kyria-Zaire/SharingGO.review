# WEB-PROFILE-EDIT-01 — Page édition du profil passager

**Statut :** accepté CTO  
**Route :** `/profile/edit` (auth requise)  
**Dépendances :** `GET /api/auth/me` uniquement

## Objectif

Page premium « Modifier mon profil » préparant la gestion de compte sans simuler de capacités backend absentes.

## Livrables

| Zone | Détail |
|------|--------|
| Route | `/profile/edit` + CTA depuis `/profile` |
| Hero | Retour, titre, sous-titre, avatar + caméra (placeholder) |
| Bandeau | Info réservations / QR |
| Onglets | Informations · Paiement · Préférences · Sécurité |
| Actions | Save désactivé + message ; Annuler → `/profile` |
| Mobile | Save / Annuler / Supprimer compte en bas |

## Exclusions respectées

- Pas de backend / API / auth / Stripe modifiés
- Pas de faux upload, wallet, MDP, suppression, sauvegarde

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
node ../../tmp-screenshot-profile-edit.mjs
```
