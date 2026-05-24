# F3-T5 — Boarding Operations Console

## Objectif

Console terrain V1 pour valider et consommer des JWT boarding, afficher le contrat UI backend (S2-T5), manifest offline, et historique session (20 scans max). Pas de caméra, pas d’offline réel, pas de websocket.

## Endpoints consommés

| Méthode | Route | Usage |
|---------|-------|--------|
| POST | `/api/boarding/validate` | Contrôle sans consommer |
| POST | `/api/boarding/consume` | Embarquement réel + `ui` contract |
| GET | `/api/boarding/offline-capabilities` | Manifest public (staleTime 60s) |

Aucune modification backend.

## Validate vs Consume

| Action | Effet |
|--------|--------|
| **Valider** | Vérifie le JWT, n’écrit pas USED |
| **Consommer** | Valide + passe réservation en USED (action terrain prioritaire) |

Bouton **Consommer** : `primary` + `lg` + style renforcé.  
Bouton **Valider** : `secondary`.

## Effacer le scan

- Vide le textarea JWT
- Reset résultat validate/consume courant
- **Ne supprime pas** l’historique session

## Historique session

- State React uniquement (pas localStorage / DB)
- Max **20** scans (`BOARDING_SCAN_HISTORY_MAX`)
- Entrées : heure, action, statut UI, titre, reason, reservationId court
- **Jamais** de JWT complet dans l’historique

## UI contract (consume)

Affichage exclusif de `ui.status`, `ui.title`, `ui.message` du backend.  
Pas de traduction locale des raisons métier (`INVALID_TOKEN`, `BOARDING_ALREADY_USED`, etc.).

Validate : pas de `ui` API — messages UX génériques de contrôle + badge `reason`.

## Composants

| Composant | Rôle |
|-----------|------|
| `BoardingScannerPanel` | Textarea JWT + boutons |
| `BoardingValidateResult` | Résultat contrôle |
| `BoardingConsumeResult` | Résultat consommation (ui backend) |
| `BoardingResultCard` | Carte résultat |
| `BoardingStatusBadge` | success / warning / error |
| `BoardingReasonBadge` | Code raison (affichage brut) |
| `ScanHistoryList` | Historique session |
| `OfflineCapabilityCard` | ONLINE_FIRST, HS256, futur RS256/EdDSA |

## Offline manifest

- `recommendedMode: ONLINE_FIRST`
- `offlineValidation.supported: false` (V1)
- Cibles `RS256`, `EdDSA` documentées

## Sécurité

- JWT saisi dans textarea (opérateur) — non loggé en console
- Historique : IDs courts via `formatShortId`
- Pas d’affichage payload JWT décodé côté frontend

## Auth

Page admin actuelle : `ADMIN` / `SUPER_ADMIN` via `AdminRoute`.  
API boarding accepte aussi `DRIVER` (futur app chauffeur) — composants non couplés au rôle admin.

## Limitations V1

- Pas de caméra / QR reader natif
- Pas d’offline cryptographique réel
- Pas de websocket / temps réel
- Pas de persistance historique serveur

## Prochains tickets

- App chauffeur DRIVER + scan caméra
- Offline RS256/EdDSA + JWKS
- Toasts terrain / vibrations
- Historique serveur optionnel

## Test manuel

1. Obtenir JWT via flow passager (QR contract) ou seed
2. `/boarding` : validate success, consume success
3. Double consume → `BOARDING_ALREADY_USED` (warning)
4. JWT invalide → error + reason
5. Effacer le scan, historique max 20, manifest offline visible
