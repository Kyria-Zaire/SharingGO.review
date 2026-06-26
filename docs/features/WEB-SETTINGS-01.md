# WEB-SETTINGS-01 — Page Paramètres passager

**Statut :** accepté CTO  
**Route :** `/settings` (auth requise)

## Objectif

Centre de configuration application (distinct du profil identité) — premium, honnête MVP.

## Livrables

| Zone | Détail |
|------|--------|
| Shell | Icône ⚙️ après 🔔, avant avatar |
| Hero | Titre, sous-titre, déconnexion |
| Compte | Fournisseur, sync, dernière connexion, email, avatar |
| Onglets | Général · Notifications · Confidentialité · Sécurité · À propos |
| Zone dangereuse | Suppression compte — désactivée |
| Actions | Enregistrer désactivé + message sync |

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
node ../../tmp-screenshot-settings.mjs
```
