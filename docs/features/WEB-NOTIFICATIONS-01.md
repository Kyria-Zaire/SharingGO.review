# WEB-NOTIFICATIONS-01 — Page Notifications passager

**Statut :** accepté CTO  
**Route :** `/notifications` (auth requise)  
**API :** aucune — empty state par défaut, démo UI si `VITE_ENABLE_UI_DEMO_TRIPS=true`

## Livrables

| Zone | Détail |
|------|--------|
| Route | `/notifications` + cloche shell → lien actif si connecté |
| Hero | Titre, sous-titre, « Tout marquer comme lu » (local, si notifications) |
| Onglets | Toutes · Trajets · Réservations · Paiements · Système + compteurs |
| Toolbar | Filtre local (toutes / non lues / lues) |
| Liste | Cartes premium, groupement temporel, liens internes |
| Démo | `demo-notification-*` uniquement hors PROD + flag |
| Empty | Premium + CTA `/trips` |

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
node ../../tmp-screenshot-notifications.mjs
```
