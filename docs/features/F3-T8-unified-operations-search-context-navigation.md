# F3-T8 — Unified Operations Search & Context Navigation

## Objectif

Recherche opérationnelle unifiée dans la topbar admin : retrouver rapidement une réservation, un paiement ou un trajet, puis naviguer vers la page cible avec contexte (`?selected=`, `?paymentId=`, `?tripId=`).

Frontend uniquement — aucune modification backend, aucune nouvelle API.

## Composants

| Fichier | Rôle |
|---------|------|
| `frontend/src/features/search/components/OperationsSearch.tsx` | Input, dropdown, clear, ESC, états UX |
| `frontend/src/features/search/services/search-operations.ts` | Agrégation + filtrage client |
| `frontend/src/features/search/hooks/useDebouncedValue.ts` | Debounce 300 ms |
| `frontend/src/features/search/hooks/useStabilizedLoading.ts` | Loading min ~150 ms |
| `frontend/src/features/search/constants/search-config.ts` | Constantes V1 |
| `frontend/src/features/search/constants/search-entity-config.ts` | Badges, headers, mapping icônes futur |
| `frontend/src/features/search/constants/search-pinned.config.ts` | Architecture pinned entities (V2) |
| `frontend/src/types/search.types.ts` | `OperationSearchResult` unifié |

Intégration : `frontend/src/components/layout/Topbar.tsx` (centré desktop `lg+`).

## APIs consommées (existantes)

| Méthode | Route | Usage V1 |
|---------|-------|----------|
| GET | `/api/admin/reservations` | `limit=50`, filtrage client |
| GET | `/api/admin/payments` | `limit=50`, filtre `reservationId` si query ≥ 8 chars |
| GET | `/api/admin/trips` | Liste récente, filtrage client |

Aucun endpoint search global — pas de chargement DB complet.

## Stratégie V1

1. **Query &lt; 2 caractères** → aucune requête, message « Entrez au moins 2 caractères ».
2. **Debounce 300 ms** (`SEARCH_DEBOUNCE_MS`).
3. **3 requêtes parallèles** limitées (`SEARCH_FETCH_LIMIT = 50`).
4. **Filtrage frontend** sur ID (complet ou partiel via `formatShortId`), email, nom passager, ligne, villes.
5. **Score + tri** → max **5 résultats par catégorie** (`SEARCH_RESULT_LIMIT_PER_CATEGORY`).
6. **Affichage sécurisé** : `formatShortId()` uniquement — jamais JWT, boardingToken, Stripe IDs complets, secrets.

## Navigation contextuelle

| Type | URL | Page cible |
|------|-----|------------|
| Reservation | `/reservations?selected=<id>` | Ouvre le panneau détail |
| Payment | `/payments?paymentId=<id>` | Surligne la ligne + bannière si hors page |
| Trip | `/trips?tripId=<id>` | Ouvre le panneau occupancy |

**Fallback documenté** : trajet depuis départs → `/departures?tripId=<id>` (non implémenté en V1 ; `/trips` prioritaire).

## UX obligatoire V1

| Feature | Implémentation |
|---------|----------------|
| Debounce | 300 ms |
| Query min | 2 caractères |
| ESC | Ferme dropdown + reset index clavier futur |
| Clear × | Vide query, ferme dropdown, reset état |
| Loading stabilization | ~150 ms minimum visible (`useStabilizedLoading`) |
| Max résultats | 5 / catégorie |
| Category headers | Reservations, Payments, Trips (sections dropdown) |
| Déduplication | 1 entrée max par `type:id` (pas de doublon multi-match) |
| Badges | Reservation, Payment, Trip (vert cockpit) |

## États dropdown

- **Trop court** : « Entrez au moins 2 caractères »
- **Loading** : spinner + « Recherche en cours… »
- **Error** : message erreur réseau/API
- **Empty** : « Aucun résultat opérationnel » + suggestion
- **Results** : sections par catégorie (headers) + badges type par ligne

## Micro-ajustements CTO (post-review)

1. **Category headers** — sections `Reservations`, `Payments`, `Trips` dans le dropdown.
2. **No duplicate results** — déduplication par clé `type:id` avant affichage (`takeTopMatches` + `dedupeSearchResults`).
3. **Future pinned entities** — `search-pinned.config.ts` + champ `pinned` sur `OperationSearchResult`.

## Architecture extensible (non implémenté V1)

### Ctrl+K global

Raccourci palette documenté pour V2. `OperationsSearch` expose déjà `activeIndex` et roles ARIA combobox/listbox.

### Navigation clavier ↑ ↓ Enter

- `activeIndex` préparé dans le composant
- `aria-activedescendant` sur l'input
- Pas de focus trap V1

### Recent search memory

Champs réservés sur `OperationSearchResult` : `recent`, `pinned`. Hook/service extensible sans breaking change.

### Pinned entities (favoris opérateur)

Fichier `frontend/src/features/search/constants/search-pinned.config.ts` :

- `PinnedSearchEntity` — trajets favoris, lignes favorites, IDs support fréquents
- `PINNED_SEARCH_STORAGE_KEY` — persistance locale future (max 10)
- V2 : section « Épinglés » en tête du dropdown, `pinned: true` sur les résultats

### Query highlight

Champ `highlightedLabel` réservé. Futur : surbrillance `Reservation #**a12**f9`.

### Entity iconography

`SEARCH_ENTITY_ICONS` (Ticket, CreditCard, MapPin) — V1 badges texte uniquement.

### Backend global search

Futur : endpoint unifié type `GET /api/admin/search?q=` — remplacera le fan-out 3 APIs + filtrage client.

## Limites V1

- Pas de recherche passager dédiée sans réservation/paiement associé
- Résultats limités aux ~50 entrées récentes par API list
- Pas de Ctrl+K, pas de ↑↓ Enter, pas d'historique récent
- Paiement hors pagination : bannière informative, pas de fetch unitaire (pas d'API GET payment by id admin exposée au frontend)
- Mobile : search visible uniquement `lg+` (topbar compacte)

## Sécurité

Ne jamais afficher : JWT, boardingToken, Stripe payment intent/session refs, metadata brute, secrets env.

## Test plan

- [ ] Recherche réservation par ID court / email
- [ ] Recherche paiement par ID
- [ ] Recherche trajet par ligne / ID
- [ ] Query 1 caractère → hint, pas de fetch
- [ ] Debounce 300 ms observable
- [ ] Loading stable (~150 ms min)
- [ ] Bouton × reset complet
- [ ] ESC ferme dropdown
- [ ] Max 5 résultats par type
- [ ] Clic → navigation + contexte page
- [ ] Aucun secret dans les subtitles
- [ ] `npm run lint` OK
- [ ] `npm run build` OK

## Fichiers modifiés (pages contexte)

- `frontend/src/pages/ReservationsPage.tsx` — `?selected=`
- `frontend/src/pages/PaymentsPage.tsx` — `?paymentId=`
- `frontend/src/pages/TripsPage.tsx` — `?tripId=`
- `frontend/src/features/payments/components/PaymentsTable.tsx` — surbrillance ligne
- `frontend/src/constants/query-keys.ts` — `search.operations`
