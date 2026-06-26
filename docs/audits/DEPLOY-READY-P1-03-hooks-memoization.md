# DEPLOY-READY-01 · P1-03 — Hooks / callbacks / memoization hygiene

**Date :** 2026-06-26  
**Périmètre :** `frontend/apps/passenger/src`  
**Baseline bundle (P1-02, commit `e1650ab`) :** 833.57 kB  
**Statut :** **BUILD COMPLETE** — en attente GO CTO (aucun commit)

---

## Résumé exécutif

Audit ciblé des hooks React (`useEffect`, `useMemo`, `useCallback`, `memo`) sur le parcours passenger. Corrections limitées aux anti-patterns identifiés, sans refonte ni sur-optimisation. Aucun `eslint-disable` ajouté.

| Métrique | Avant | Après |
|----------|------:|------:|
| Fichiers modifiés (code) | — | **15** |
| Délais skeleton artificiels (280 ms) | 3 | **0** |
| Effets dérivés remplaçables | 2 | **0** |
| `useMemo` / `useCallback` triviaux retirés | 8+ | **0** résiduels ciblés |
| `eslint-disable` hooks | 0 | **0** |
| `pnpm lint` | ✅ | **✅ exit 0** |
| `pnpm build` | ✅ | **✅ exit 0** |
| `pnpm audit:links` FAIL | 0 | **0** |
| Bundle JS (`index-*.js`) | 833.57 kB | **827.63 kB** (−5.94 kB) |

---

## 1. Fichiers inspectés

Scan : `rg "useEffect|useMemo|useCallback|memo\(" src` + revue manuelle parcours métier.

### Pages (parcours passenger)

| Fichier | Hooks | Verdict audit |
|---------|-------|---------------|
| `pages/TripsPage.tsx` | `useMemo`, `useCallback` | Inspecté — KEEP |
| `pages/TripDetailPage.tsx` | — (data via hooks) | Inspecté — OK |
| `pages/BookingFormPage.tsx` | `useEffect` | Inspecté — KEEP deps `[user]` |
| `pages/BookingsPage.tsx` | `useMemo`, `useEffect`→handler | **Corrigé** |
| `pages/BoardingPassPage.tsx` | `useEffect` | Inspecté — KEEP |
| `pages/PaymentSuccessPage.tsx` | `useMemo`, `useEffect` | Inspecté — KEEP |
| `pages/PendingReservationPage.tsx` | — | Inspecté — OK |

### Features (interaction / listes / filtres)

| Fichier | Hooks | Verdict audit |
|---------|-------|---------------|
| `features/help/components/HelpView.tsx` | `useMemo`, `useEffect` | **Corrigé** |
| `features/contact/components/ContactView.tsx` | `useEffect` (démo) | **Corrigé** |
| `features/legal/components/LegalDocumentLayout.tsx` | `useEffect` (démo) | **Corrigé** |
| `features/legal/hooks/useLegalActiveSection.ts` | `useEffect` | Inspecté — KEEP |
| `features/notifications/hooks/useNotifications.ts` | `useMemo`, `useCallback`→fn | **Corrigé** |
| `features/notifications/components/NotificationsView.tsx` | `useMemo` | **Corrigé** (simplifié) |
| `features/subscriptions/components/SubscriptionsView.tsx` | `useMemo` | Inspecté — KEEP / ajusté deps |
| `features/settings/components/SettingsAccountCard.tsx` | `useMemo` trivial | **Corrigé** |
| `features/profile/edit/components/ProfileEditSyncStatus.tsx` | `useMemo` trivial | **Corrigé** |
| `features/profile/edit/components/tabs/ProfileEditInformationTab.tsx` | `useEffect` | Inspecté — KEEP |
| `features/trips/components/trip-detail/TripDetailHeroMap.tsx` | `useMemo` | **Corrigé** (1 trivial) |

### Hooks métier & contexte

| Fichier | Hooks | Verdict audit |
|---------|-------|---------------|
| `context/AuthProvider.tsx` | `useCallback`, `useEffect`, `useMemo` | Inspecté — KEEP |
| `hooks/usePassengerShell.ts` | `useMemo` | Inspecté — KEEP |
| `hooks/useUserReservations.ts` | `useMemo` trivial | **Corrigé** |
| `hooks/usePublicTrip.ts` | — | Inspecté — OK (react-query pur) |
| `hooks/usePublicTrips.ts` | — | Inspecté — OK |
| `hooks/useLandingUpcomingTrips.ts` | `useMemo` | Inspecté — KEEP |
| `hooks/usePaymentConfirmationPoll.ts` | `useEffect` | Inspecté — KEEP (checkout) |
| `hooks/usePendingCountdown.ts` | `useEffect` | Inspecté — KEEP |
| `hooks/useBoardingCountdown.ts` | `useEffect` | Inspecté — KEEP |

### Layout

| Fichier | Hooks | Verdict audit |
|---------|-------|---------------|
| `components/layout/PassengerUserMenu.tsx` | `useEffect` | Inspecté — KEEP |

### Fichiers supprimés (orphelins post-correction)

| Fichier | Raison |
|---------|--------|
| `features/help/components/HelpSkeleton.tsx` | Plus aucun import |
| `features/contact/components/ContactSkeleton.tsx` | Plus aucun import |
| `features/legal/components/LegalSkeleton.tsx` | Plus aucun import |

---

## 2. Problèmes détectés

| ID | Type | Fichier(s) | Description |
|----|------|------------|-------------|
| P1-03-01 | Effet dérivé | `BookingsPage.tsx` | `useEffect([filter])` appelait `setSort(defaultBookingsSort(filter))` — état dérivable au changement de filtre, double render |
| P1-03-02 | Effet dérivé | `useNotifications.ts` + `NotificationsView.tsx` | Reset pagination via callback manuel `resetVisibleOnFilterChange` au lieu d’effet lié à `[tab, readFilter]` |
| P1-03-03 | Effet post-démo | `HelpView`, `ContactView`, `LegalDocumentLayout` | `setTimeout(280ms)` + `contentReady` pour afficher skeleton sur contenu **statique** — effet sans valeur métier |
| P1-03-04 | `useMemo` trivial | `SettingsAccountCard.tsx` | `useMemo(() => formatLastLoginLabel(new Date()), [])` — calcul O(1), pas de ref transmise |
| P1-03-05 | `useMemo` trivial | `ProfileEditSyncStatus.tsx` | `useMemo` sur `Intl.DateTimeFormat` — idem |
| P1-03-06 | `useMemo` trivial | `TripDetailHeroMap.tsx` | `useMemo(() => shouldShowHeroMapDynamicOverlay(), [])` — constante runtime, pas de deps |
| P1-03-07 | `useMemo` trivial | `useUserReservations.ts` | `useMemo(() => buildListQuery(filter), [filter])` — objet recréé acceptable, `filter` déjà dans `queryKey` |
| P1-03-08 | `useCallback` inutile | `useNotifications.ts` | 5 handlers (`markAllRead`, etc.) mémoïsés sans enfant `React.memo` |
| P1-03-09 | Gate auth inutile | `HelpView.tsx` | `authLoading` bloquait skeleton sur page **publique** (P0-01) |

**Non détecté :** `eslint-disable` hooks · `memo()` sur composants · dépendances inline instables critiques sur checkout/auth.

---

## 3. Corrections appliquées

| ID | Fichier | Correction |
|----|---------|------------|
| P1-03-01 | `BookingsPage.tsx` | `handleFilterChange` : `setFilter` + `setSort(defaultBookingsSort(next))` ; suppression `useEffect` |
| P1-03-02 | `useNotifications.ts` | `useEffect(() => setVisibleCount(PAGE_SIZE), [tab, readFilter])` ; handlers en fonctions simples |
| P1-03-02 | `NotificationsView.tsx` | `setTab` / `setReadFilter` passés directement aux onglets et filtres |
| P1-03-03 | `HelpView.tsx` | Suppression `contentReady`, délai 280 ms, import `useAuth` / `HelpSkeleton` |
| P1-03-03 | `ContactView.tsx` | Rendu immédiat, suppression effet + skeleton |
| P1-03-03 | `LegalDocumentLayout.tsx` | Rendu immédiat ; `useLegalActiveSection(..., true)` dès montage |
| P1-03-03 | `*Skeleton.tsx` (×3) | Fichiers supprimés (orphelins) |
| P1-03-04 | `SettingsAccountCard.tsx` | Calcul inline `formatLastLoginLabel(new Date())` |
| P1-03-05 | `ProfileEditSyncStatus.tsx` | Calcul inline `Intl.DateTimeFormat` |
| P1-03-06 | `TripDetailHeroMap.tsx` | `const showDynamicOverlay = shouldShowHeroMapDynamicOverlay()` |
| P1-03-07 | `useUserReservations.ts` | `buildListQuery(filter)` inline dans `queryKey` / `queryFn` |
| P1-03-08 | `useNotifications.ts` | Suppression des `useCallback` sur handlers |
| P1-03-09 | `HelpView.tsx` | Contenu FAQ affiché sans attendre auth |

**`useMemo` conservés (justifiés) :**

- Filtres / tris listes : `TripsPage`, `BookingsPage`, `HelpView`, pipeline `useNotifications`, `NotificationsView.grouped`
- Données API dérivées : `useLandingUpcomingTrips.trips`
- Géométrie SVG : `TripDetailHeroMap` (`percentPoints`, `routePath`, `chevrons`)
- Checkout : `PaymentSuccessPage.checkoutContext` (stabilise `usePaymentConfirmationPoll`)
- Abonnements : `SubscriptionsView.tabCounts` (`buildSubscriptionHistoryItems`)
- Contexte : `AuthProvider.value` + handlers auth

---

## 4. Corrections volontairement non appliquées

| Zone | Raison |
|------|--------|
| `AuthProvider.tsx` — `useCallback` + `useMemo` contexte | Pattern standard ; toute modification risque re-renders auth globaux |
| `usePaymentConfirmationPoll.ts` | Parcours Stripe / webhook sensible — hors scope hygiène (audit WEB-PASSENGER § risques checkout) |
| `TripsPage.tsx` — `scrollToResults` en `useCallback` | Handler passé à `TripsFiltersSheet.onApply` ; stabilisation légitime |
| `usePassengerShell.ts` — `useMemo` | Objet config layout consommé par shell ; évite recréation à chaque render |
| `PassengerUserMenu.tsx` — `useEffect` click-outside | Effet DOM légitime, deps `[open]` correctes |
| `BookingFormPage.tsx` — `useEffect` préremplissage `[user]` | Sync formulaire à la connexion ; deps validées ESLint `exhaustive-deps` |
| `BoardingPassPage.tsx` — redirect 401 | Effet navigation légitime |
| `ProfileEditInformationTab.tsx` — sync `user.firstName/lastName` | Formulaire édition : reset partiel si profil rafraîchi |
| Ajout `React.memo` sur `TripsList`, `BookingCard*`, `NotificationsGroup` | Optimisation prématurée — pas de preuve de re-render coûteux ; report P1-05/P1-06 |
| `usePublicTrips.ts` — `filterKey` inline dans `queryKey` | React Query compare en profondeur ; impact négligeable |

---

## 5. Risques éventuels

| Risque | Niveau | Mitigation |
|--------|--------|------------|
| Help / Contact / Legal sans skeleton 280 ms | Faible | Contenu statique identique ; seul le flash skeleton disparaît (hygiène post-démo, pas de changement de données) |
| `SettingsAccountCard` / `ProfileEditSyncStatus` — heure recalculée au render | Négligeable | Affichage « à l’instant » / heure courante ; coût O(1) |
| `useNotifications` reset pagination via effet | Faible | Comportement identique à l’appel manuel précédent |
| `BookingsPage` tri reset au changement d’onglet | Aucun | Comportement métier inchangé, exécution synchrone |
| Régression checkout / boarding | Faible | Hooks checkout et boarding **non modifiés** |

---

## 6. Résultat des checks qualité

Exécuté le **2026-06-26** depuis `frontend/apps/passenger` :

```text
> pnpm lint
eslint src --max-warnings 0
→ exit 0 (0 errors, 0 warnings)

> pnpm build
tsc --noEmit && vite build
→ exit 0
dist/assets/index-DyCx2U57.js    827.63 kB │ gzip: 228.47 kB
dist/assets/index-DVMjiEsd.css    58.04 kB │ gzip:  10.26 kB

> pnpm audit:links
Files scanned: 325
FAIL: 0
WARN: 0
→ exit 0
```

**Tests frontend :** aucun script `test` dans `package.json` passenger — non exécuté.

**Variation bundle :** 833.57 kB → **827.63 kB** (−5.94 kB, ~−0.7 %) — suppression skeletons + code effets démo, pas de nouvelle dépendance.

---

## 7. Gate acceptance P1-03

| Critère | État |
|---------|------|
| Audit hooks réel effectué | ✅ |
| Corrections ciblées et justifiées | ✅ |
| Comportement métier passenger inchangé | ✅ (sauf flash skeleton cosmétique) |
| Aucun `eslint-disable` abusif | ✅ |
| Rapport `DEPLOY-READY-P1-03-hooks-memoization.md` | ✅ |
| `pnpm lint` | ✅ |
| `pnpm build` | ✅ |
| `pnpm audit:links` FAIL 0 | ✅ |
| Commit | ❌ **En attente GO CTO** |

---

*Prochain ticket recommandé : **P1-04** — Revue TypeScript strict.*
