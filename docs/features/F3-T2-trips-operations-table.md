# F3-T2 — Trips Operations Table

## Objectif

Premier écran métier du cockpit admin : supervision des trajets (liste, filtres, statut UI, remplissage à la demande, enable/disable).

## Endpoints consommés

| Méthode | Route | Usage |
|---------|-------|--------|
| GET | `/api/admin/trips` | Liste avec filtres `lineId`, `from`, `to`, `includeDisabled` |
| GET | `/api/admin/lines` | Select filtre ligne |
| GET | `/api/admin/trips/:id/occupancy` | Remplissage à la demande (évite N+1) |
| POST | `/api/admin/trips/:id/disable` | Désactivation |
| POST | `/api/admin/trips/:id/enable` | Réactivation |

Aucune modification backend dans ce ticket.

## Composants créés

| Composant | Rôle |
|-----------|------|
| `TripsTable` | Table opérationnelle + actions |
| `TripsFilters` | Filtres date / ligne / disabled + refresh |
| `OccupancyPanel` | Détail occupancy du trajet sélectionné |
| `OccupancyBadge` | Affichage visuel `occupied / total` |
| `StatusBadge` | Statut UI trip |
| `TableSkeleton` | Loading liste |
| `ErrorState` | Erreur + retry |

Fichiers API : `api/admin-trips.api.ts`  
Types : `types/trips.types.ts`  
Utils : `features/trips/utils/trip-ui-status.ts`, `occupancy-visual.ts`

## TanStack Query

- Liste trips : `staleTime: 30_000` (30 s)
- Occupancy (à la demande) : `staleTime: 30_000`, `enabled` si trajet sélectionné
- Après enable/disable : `invalidateQueries({ queryKey: queryKeys.admin.trips.all })`

## OccupancyBadge (visuel uniquement)

- Affichage : `occupied / total`
- Vert : ratio &lt; 60 %
- Orange : ratio ≥ 60 % et non complet
- Rouge : complet (`occupied >= total`)

Aucune règle métier critique dans le composant — le backend reste source de vérité.

## Statuts UI (table)

Dérivés côté frontend : `disabled`, `past`, `full` (si occupancy chargée), `upcoming`.

## Filtres

- Départ après / avant (`datetime-local` → ISO)
- Ligne (`lineId`)
- Inclure trajets désactivés
- Bouton Actualiser

## Actions

- **Voir remplissage** : toggle panneau + requête occupancy
- **Désactiver / Réactiver** : `window.confirm` + mutation + invalidate liste

## Limites F3-T2

- Pas de CRUD création/édition trajet
- Pas de realtime / websocket
- Pas de suppression définitive
- Confirmation native (`confirm` / `alert`) en V1

## Prochains tickets

- F3-T3+ : réservations / paiements tables
- Formulaire création/édition trajet
- Toasts et confirmations UI custom
- Code-splitting bundle admin

## Test manuel

1. `npm run dev` (frontend) + backend + seed demo
2. Connexion `admin@sharinggo.demo`
3. `/trips` — liste, filtres, refresh
4. Œil → panneau occupancy + badge dans la ligne
5. Désactiver / réactiver un trajet
6. `DRIVER` → accès refusé (guard F3-T1)
