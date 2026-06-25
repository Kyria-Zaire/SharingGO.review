# WEB-DEMO-DATA-01 — Mode trajets démo UI (temporaire)

**Statut :** implémenté (validation CTO en attente)  
**Périmètre :** frontend passager uniquement — **aucun backend / PostgreSQL / seed**

## Pourquoi ce mode existe

Pendant la refonte UI passager (WEB-TRIPS-01, WEB-TRIP-DETAIL-01, WEB-BOOKINGS-01, etc.), la base locale peut ne plus contenir assez de trajets futurs réels pour valider les layouts.

Ce mode **complète temporairement** l’affichage côté frontend lorsque l’API retourne moins de 4 trajets futurs pertinents.

## Activation

Dans `frontend/apps/passenger/.env` (local, gitignored) :

```env
VITE_ENABLE_UI_DEMO_TRIPS=true
```

Puis redémarrer le dev server :

```powershell
cd frontend/apps/passenger
pnpm dev
```

## Désactivation

- Retirer la variable, ou la mettre à `false`
- Redémarrer le dev server

Par défaut : variable **absente** ou `false` → **aucune donnée démo**.

## Protection production

Si `import.meta.env.PROD === true` :

- `VITE_ENABLE_UI_DEMO_TRIPS` est **ignoré**
- **aucun** trajet démo injecté
- **aucun** badge affiché

Même si la variable est présente au moment du `pnpm build`, le bundle production ne peut pas activer le mode démo.

## Fonctionnement

1. L’API est toujours appelée en premier.
2. Si le flag est actif (hors PROD) **et** qu’il y a moins de 4 trajets futurs :
   - ajout de trajets `demo-trip-*` depuis le pool frontend
   - les trajets API existants ne sont **jamais** remplacés
   - déduplication par horaire + sens
   - tri chronologique conservé
3. Page détail : les IDs `demo-trip-*` sont résolus localement (pas d’appel API).
   - Listes : uniquement les créneaux **futurs**
   - Détail : URL stable (`/trips/demo-trip-01` … `08`) même si le créneau du jour est passé (QA UI)
4. Réservation sur un trajet démo : CTA désactivé (« Trajet démo UI »).

## Demo bookings (`/bookings`)

Complète les listes de réservations **uniquement** si le flag est actif (hors PROD) et qu’un état requis pour la QA UI manque dans la réponse API.

| Onglet | États couverts par le pool démo |
|--------|----------------------------------|
| À venir | 2 × `CONFIRMED` + paiement `SUCCEEDED` · 1 × `PENDING` + paiement `PENDING` |
| Passées | 2 × `USED` (terminée) + paiement `SUCCEEDED` |
| Annulées | 1 × `CANCELED` + paiement `FAILED` |

- IDs : `demo-booking-*` (ex. `demo-booking-upcoming-confirmed-01`)
- Références affichées : `#SGDEMO-*` (ex. `#SGDEMO-UPCOMING-CONFIRMED-01`)
- Les réservations API existantes ne sont **jamais** remplacées
- Injection **complémentaire** seulement si l’onglet ne contient pas déjà l’état cible
- CTA QR / billet **désactivés** sur les réservations démo (pas d’appel API)

Fichiers :

```
src/features/bookings/demo/demo-bookings.ts
src/features/bookings/demo/merge-demo-bookings.ts
src/hooks/useUserReservations.ts
src/hooks/useBookingsTabCounts.ts
src/features/bookings/lib/booking-card-format.ts   # #SGDEMO-*
```

## Badge

Quand le mode est actif en dev : bandeau discret **« Mode démonstration UI »** (fixe en bas de l’écran).

## Fichiers concernés

```
src/lib/ui-demo-trips.ts              # flag + garde PROD + demo-booking-*
src/lib/format-date.ts                # buildParisIsoDateTime
src/features/trips/demo/demo-trips.ts # pool 8 trajets
src/features/trips/demo/merge-demo-trips.ts
src/hooks/usePublicTrips.ts
src/hooks/usePublicTrip.ts
src/hooks/useLandingUpcomingTrips.ts
src/hooks/useNextAvailableTrip.ts
src/components/layout/UiDemoModeBadge.tsx
src/components/layout/PassengerShell.tsx
src/pages/TripDetailPage.tsx
.env.example
```

## Risques

| Risque | Mitigation |
|--------|------------|
| Confusion démo / prod | Garde `import.meta.env.PROD`, badge visible, IDs préfixés `demo-trip-` / `demo-booking-` |
| Réservation sur faux trajet | CTA désactivé sur trajets démo |
| Clic billet démo | CTA désactivé sur réservations `demo-booking-*` |
| Données fictives en prod | Flag ignoré en build production |
| Dette technique | Mode à supprimer ou désactiver avant pilote / prod |

---

## AVANT DEPLOY-01 / PILOT-01 — **tout retirer**

> Rappel CTO : ce module est **temporaire**. Ne pas merger en prod sans cette checklist.

- [ ] `VITE_ENABLE_UI_DEMO_TRIPS` **absent** ou `false` dans `.env` local **et** tous les environnements Railway / VPS / CI
- [ ] Redémarrer / rebuild après retrait du flag
- [ ] Vérifier en **préprod** : aucun badge « Mode démonstration UI »
- [ ] Vérifier qu’**aucun** ID `demo-trip-*` n’apparaît en liste ni en URL partagée
- [ ] Vérifier qu’**aucun** ID `demo-booking-*` n’apparaît sur `/bookings`
- [ ] Vérifier que les trajets affichés proviennent **uniquement** de l’API backend
- [ ] Optionnel (fin de refonte UI) : supprimer les dossiers `src/features/trips/demo/` et `src/features/bookings/demo/` si plus nécessaire

**URLs QA locales (à ne pas utiliser en prod) :**

- Trajets : `/trips/demo-trip-01` … `/trips/demo-trip-08`
- Réservations : IDs `demo-booking-upcoming-confirmed-01`, etc. (liste `/bookings` uniquement)

## Tests manuels

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build

# flag false (défaut) → API seule
pnpm dev

# flag true dans .env → API + démo si < 4 futurs
# VITE_ENABLE_UI_DEMO_TRIPS=true

# build prod : aucune injection même si flag=true au build
$env:VITE_ENABLE_UI_DEMO_TRIPS="true"; pnpm build; pnpm preview
```
