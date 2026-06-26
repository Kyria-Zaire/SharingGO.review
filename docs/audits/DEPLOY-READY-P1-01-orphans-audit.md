# DEPLOY-READY-01 · P1-01 — Audit orphelins (passenger)

**Date :** 2026-06-23  
**Périmètre :** `frontend/apps/passenger/src`  
**Méthode :** routes (`router.tsx`) · imports path (`rg` + `scripts/audit-orphans-path.mjs`) · revue manuelle  
**Statut :** **CLOSED** — 21 fichiers SAFE DELETE supprimés (validation CTO 2026-06-23 · P1-01b)

---

## Résumé exécutif

| Métrique | Avant (baseline QA) | Après audit | Après suppression (P1-01b) |
|----------|--------------------:|------------:|-------------------------:|
| Pages non routées | 1 | 1 | **0** |
| Fichiers orphelins (composants + libs + pages) | 1 (connu) | **21** | **0** |
| Composants orphelins QA | 1 | 1 | **0** |
| Hooks orphelins | 0 | **0** | **0** |
| Constants orphelins (fichiers) | 0 | **0** | **0** |
| FAIL audit liens | 0 | 0 | **0** |
| Lignes supprimées | — | ~778 | **~778** |
| Bundle JS | ~833.54 kB | — | **833.57 kB** (inchangé — code jamais importé) |

**Verdict P1-01b :** 21 fichiers supprimés · `pnpm lint` ✅ · `pnpm build` ✅ · `pnpm audit:links` ✅ (FAIL 0, WARN 0)

**Hors périmètre P1-01 (→ P1-02 exports morts) :** exports inutilisés dans fichiers **KEEP** (voir §10).

---

## Méthodologie

1. **Pages** — liste `src/pages/*.tsx` croisée avec `src/app/router.tsx` (`@/pages/<Name>`).
2. **Imports** — résolution `@/` et relatifs depuis chaque fichier `.ts/.tsx` (script `audit-orphans-path.mjs`).
3. **Preuves manuelles** — `rg` sur symboles et chemins d'import pour chaque candidat.
4. **Exclusions script** — points d'entrée (`main.tsx`, `App.tsx`) traités manuellement : `query-client.ts`, `router.tsx`, `AuthProvider.tsx` sont **KEEP** (importés par `App.tsx`).

```bash
cd frontend/apps/passenger
rg "BookingDetailPlaceholder" src app
rg "from \"@/features/home/components/HeroSection\"" src
node scripts/audit-orphans-path.mjs
```

---

## 1. Pages

| Fichier | Statut | Preuve | Recommandation |
|---------|--------|--------|----------------|
| `pages/BookingDetailPlaceholderPage.tsx` | **SAFE DELETE** | Absent de `router.tsx` ; `bookings/:reservationId` → `BookingDetailPage` ; `rg BookingDetailPlaceholder` → définition seule | Supprimer — placeholder F4A remplacé |
| *29 autres pages* | **KEEP** | Toutes référencées dans `router.tsx` | — |

---

## 2. Composants orphelins — landing (refonte `LandingPage`)

Remplacement actif dans `features/home/components/LandingPage.tsx` (`LandingHeroSection`, `LandingDeparturesSection`, etc.).

| Fichier | Statut | Preuve | Recommandation |
|---------|--------|--------|----------------|
| `features/home/components/HeroSection.tsx` | **SAFE DELETE** | `rg 'from "@/features/home/components/HeroSection"' src` → 0 | Ancienne landing |
| `features/home/components/BenefitsSection.tsx` | **SAFE DELETE** | idem pattern `@/features/home/components/BenefitsSection` → 0 | Ancienne landing |
| `features/home/components/FaqSection.tsx` | **SAFE DELETE** | idem → 0 | Ancienne landing |
| `features/home/components/FinalCtaSection.tsx` | **SAFE DELETE** | idem → 0 | Ancienne landing |
| `features/home/components/HowItWorksSection.tsx` | **SAFE DELETE** | idem → 0 | Ancienne landing |
| `features/home/components/PricingSection.tsx` | **SAFE DELETE** | idem → 0 | Ancienne landing |
| `features/home/components/RouteSection.tsx` | **SAFE DELETE** | idem → 0 | Ancienne landing |
| `features/home/components/LandingHeroVisual.tsx` | **SAFE DELETE** | `rg LandingHeroVisual src` → définition seule | Remplacé par visuels landing actuels |

---

## 3. Composants orphelins — trips (refonte liste / filtres)

| Fichier | Statut | Preuve | Recommandation |
|---------|--------|--------|----------------|
| `features/trips/components/TripCard.tsx` | **SAFE DELETE** | `TripsList.tsx` importe `TripCardMobile` + `TripListRow` ; `rg TripCard[^M]` → définition seule | Remplacé par mobile + row |
| `features/trips/components/TripsDateFilter.tsx` | **SAFE DELETE** | `TripsPage.tsx` utilise `TripsQuickFilters` ; aucun import `TripsDateFilter` | Filtre UI remplacé |
| `features/trips/components/TripsRouteSummary.tsx` | **SAFE DELETE** | `rg TripsRouteSummary` → définition seule | Non branché |
| `features/trips/components/TripsTrustBlock.tsx` | **SAFE DELETE** | `rg TripsTrustBlock` → définition seule | Non branché |
| `features/trips/constants/trips-assets.ts` | **SAFE DELETE** | `rg trips-assets` → définition seule | Constante jamais importée |

---

## 4. Error cards non branchées

`NotificationsErrorCard` est **utilisé** (`NotificationsView.tsx`) → **KEEP**.

| Fichier | Statut | Preuve | Recommandation |
|---------|--------|--------|----------------|
| `features/contact/components/ContactErrorCard.tsx` | **SAFE DELETE** | `rg ContactErrorCard` → définition seule ; `ContactView` sans état erreur | Créé mais jamais intégré |
| `features/help/components/HelpErrorCard.tsx` | **SAFE DELETE** | `rg HelpErrorCard` → définition seule | idem |
| `features/legal/components/LegalErrorCard.tsx` | **SAFE DELETE** | `rg LegalErrorCard` → définition seule | idem |
| `features/settings/components/SettingsErrorCard.tsx` | **SAFE DELETE** | `rg SettingsErrorCard` → définition seule | idem |

---

## 5. Layout — bottom nav abandonnée

| Fichier | Statut | Preuve | Recommandation |
|---------|--------|--------|----------------|
| `components/layout/PassengerBottomNav.tsx` | **SAFE DELETE** | Export barrel-only ; `PassengerShell` sans `<PassengerBottomNav>` ; `usePassengerShell` commente « pas de bottom nav web » | Supprimer composant mort |
| `components/layout/index.ts` | **SAFE DELETE** | `rg 'from "@/components/layout"' src` → 0 ; barrel jamais consommé (imports directs `./PassengerHeader`, etc.) | Supprimer barrel ; **ne pas** toucher aux composants exportés |

---

## 6. Libs orphelines

| Fichier | Statut | Preuve | Recommandation |
|---------|--------|--------|----------------|
| `features/bookings/lib/booking-departure-label.ts` | **SAFE DELETE** | `rg booking-departure-label` → 0 import | Lib jamais branchée |

**KEEP (faux positifs script naïf v1) :**

| Fichier | Preuve |
|---------|--------|
| `features/bookings/lib/booking-actions.ts` | Importé par `BookingCardMobile`, `BookingCardDesktop`, `BookingCardActionZone` |
| `features/trips/lib/trip-detail-calendar.ts` | `downloadTripCalendarIcs` ← `TripDetailReservationCard` |
| `features/notifications/lib/notification-format.ts` | `formatNotificationDateTime` ← `NotificationCard` |
| `features/notifications/lib/notification-grouping.ts` | `groupNotificationsByTime` ← `NotificationsView` |
| `features/help/lib/help-categories.ts` | Types `HelpCategory` ← `HelpView`, `help-content`, `help-search` |

---

## 7. Hooks (`src/hooks` + `features/profile/hooks`)

| Résultat | Détail |
|----------|--------|
| **KEEP (27 + 2)** | Chaque hook a ≥1 import path (`rg 'from "@/hooks/'` / `@/features/profile/hooks/`) |
| **SAFE DELETE** | **0** |

---

## 8. Constants (`src/constants`)

| Fichier | Statut | Preuve |
|---------|--------|--------|
| `query-keys.ts` | **KEEP** | Hooks React Query |
| `shell-navigation.ts` | **KEEP** | `PassengerHeader`, `PassengerFooter` |
| `pricing.ts` | **KEEP** | `TripCardMobile`, `PendingReservationPage`, etc. |
| `status-labels.ts` | **KEEP** | `reservation-status.ts` |
| `brand-assets.ts` | **KEEP** | `BrandLogo` ; `BRAND_META_DESCRIPTION` = export mort → **P1-02** |

---

## 9. Points d'entrée (ne pas supprimer)

| Fichier | Statut | Preuve |
|---------|--------|--------|
| `app/router.tsx` | **KEEP** | `import { router } from "./router"` dans `App.tsx` |
| `app/query-client.ts` | **KEEP** | `import { queryClient } from "./query-client"` dans `App.tsx` |
| `context/AuthProvider.tsx` | **KEEP** | `import { AuthProvider } from "@/context/AuthProvider"` dans `App.tsx` |

---

## 10. Exports morts (P1-02 — pas suppression fichier)

| Fichier | Export mort | Preuve |
|---------|-------------|--------|
| `features/bookings/lib/booking-actions.ts` | `formatBookingReference` | `rg formatBookingReference` → définition seule |
| `features/notifications/lib/notification-format.ts` | `formatNotificationTime`, `countUnread` | Seul `formatNotificationDateTime` importé |
| `features/help/lib/help-categories.ts` | `HELP_CATEGORIES` | `HelpCategoriesGrid` utilise `HELP_CATEGORY_*` de `help-content` |
| `types/auth.ts` | `PASSENGER_USER_TYPES` (runtime) | Type `PassengerUser` / `PassengerUserType` utilisés ; array jamais importé |
| `constants/brand-assets.ts` | `BRAND_META_DESCRIPTION` | Texte dans `index.html` ; export TS non référencé |

---

## 11. Liste consolidée SAFE DELETE (21 fichiers)

Ordre de suppression recommandé (du plus isolé au plus groupé) :

1. `pages/BookingDetailPlaceholderPage.tsx`
2. `features/bookings/lib/booking-departure-label.ts`
3. `features/trips/constants/trips-assets.ts`
4. `features/trips/components/TripCard.tsx`
5. `features/trips/components/TripsDateFilter.tsx`
6. `features/trips/components/TripsRouteSummary.tsx`
7. `features/trips/components/TripsTrustBlock.tsx`
8–14. 7× `features/home/components/{Hero,Benefits,Faq,FinalCta,HowItWorks,Pricing,Route}Section.tsx` + `LandingHeroVisual.tsx`
15–18. 4× `*ErrorCard.tsx` (contact, help, legal, settings)
19. `components/layout/PassengerBottomNav.tsx`
20. `components/layout/index.ts`

**Post-suppression obligatoire :**

```bash
cd frontend/apps/passenger
pnpm lint && pnpm build
# Mettre à jour scripts/audit-internal-links.mjs (retirer BookingDetailPlaceholder des orphanCandidates)
```

---

## 12. KPI gate P1-01

| Critère | Cible | État final |
|---------|-------|------------|
| Orphelins fichiers | 21 → **0** | **0** ✅ |
| Composants orphelins QA | 1 → **0** | **0** ✅ |
| FAIL | **0** | **0** ✅ |
| Régression | **0** | lint + build + audit:links OK ✅ |

---

## Validation CTO

- [x] Valider liste SAFE DELETE (21 fichiers) — 2026-06-23
- [x] Autoriser exécution suppression P1-01b
- [x] Confirmer suppression `components/layout/index.ts` (barrel mort)
- [x] `PassengerBottomNav` supprimé — décision produit : web passager sans bottom nav mobile

**Commit :** `refactor(passenger): remove orphaned files (DEPLOY-READY P1-01)`
