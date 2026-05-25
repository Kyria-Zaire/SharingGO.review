# F3-T11 — Dispatch Timeline (activity-feed)

## Objectif

Vue dispatcher unifiée sur `/dispatch` : flux opérationnel paginé via `GET /api/admin/activity-feed`, polling 30s, résumé sticky basé sur les hooks existants (incidents, départs).

## Architecture

```
DispatchPage
├── DispatchStickySummary     → useIncidentsList + fetchDepartureBoard (queries existantes)
├── ActivityFilters           → URLSearchParams (?severity=&type=)
├── useDispatchActivityFeed   → useInfiniteQuery → listAdminActivityFeed
├── ActivityFeedList          → ActivityFeedCard × N
└── LoadMoreButton            → fetchNextPage
```

- **Source du feed** : uniquement `/api/admin/activity-feed` (AuditLog + incidents persistés).
- **Pas de feed local** : le sticky summary n’alimente pas la liste d’événements.

### Forme API (`ActivityFeedEvent`)

| Champ | Type | Affiché UI |
|-------|------|------------|
| `id` | string | clé dédup |
| `type` | string | oui |
| `severity` | info \| warning \| critical | oui |
| `title` | string | oui |
| `description` | string? | oui si sanitizé |
| `timestamp` | ISO string | `relativeTime()` |
| `actorName` | string? | oui |
| `entityId` / `entityType` | string? | lien court vers entité |

Réponse paginée : `{ events, limit, offset, total }`.

## Filtrage

- **Backend** : `severity` et `type` passés en query string (support confirmé F3-T9-CORRECTION).
- **Frontend** : persistance via `URLSearchParams` ; changement de filtre = nouvelle clé TanStack Query (reset pagination).
- Le select « Type » propose les types **déjà présents dans les pages chargées** ; un type absent du premier chargement peut être ajouté manuellement via l’URL (`?type=RESERVATION_CANCELLED`).

## Pagination

- `useInfiniteQuery` : `initialPageParam: 0`, `getNextPageParam` = `offset + limit` si `< total`.
- Taille page : `DISPATCH_FEED_PAGE_SIZE` (20).
- Fusion : `mergeActivityFeedPages` — `Map` par `event.id`, tri `timestamp` desc.
- Bouton **Charger plus** (`fetchNextPage`), désactivé pendant `isFetchingNextPage`.

## Polling & stale UI

- `refetchInterval: 30_000` (sauf pendant cooldown refresh manuel 2s).
- `placeholderData: keepPreviousData` (TanStack Query v5) — les événements restent visibles pendant le refetch.
- Indicateur « Mise à jour en arrière-plan… » si `isFetching && data`.

## Sticky summary (données locales)

| Métrique | Source |
|----------|--------|
| Incidents critiques ouverts | `listAdminIncidents` + `isCriticalOpen` |
| Départs imminents (< 15 min) | `fetchDepartureBoard` → `nearDeparture` |
| Boarding actif | `readiness === "BOARDING_IN_PROGRESS"` |

Liens : `/incidents`, `/departures`, `/boarding`.

## Sécurité UI

- `sanitizeFeedDescription` : masque JSON brut (metadata audit), motifs sensibles (jwt, stripe, secrets).
- Pas d’affichage de metadata brute, tokens, IDs Stripe complets.
- Entités : ID raccourci via `formatShortId`.

## Fichiers clés

- `frontend/src/pages/DispatchPage.tsx`
- `frontend/src/features/dispatch/**`
- `frontend/src/lib/relativeTime.ts`
- Route : `ROUTES.dispatch` → `/dispatch`, sidebar icône `Clock`.

## Limitations

- Cap backend ~250 événements par source avant merge/filtre en mémoire.
- Liste des types dans le filtre dépend des événements déjà chargés.
- `/activity` reste une vue simple (50 événements, `useQuery`) ; la timeline dispatcher complète est sur `/dispatch`.

## Test manuel

1. Se connecter admin, ouvrir `http://localhost:5173/dispatch` (ou port Vite configuré).
2. Créer un incident critique → vérifier apparition dans le feed + compteur sticky.
3. Annuler une réservation admin → événement `RESERVATION_CANCELLED` (ou type audit équivalent).
4. **Charger plus** si `total > 20`.
5. Changer filtre sévérité → URL + liste filtrée côté API.
6. Rafraîchir manuel → cooldown 2s, données conservées pendant fetch.
7. Attendre 30s → refetch auto sans flash vide.
