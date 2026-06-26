# DEPLOY-READY-01 · P1-02 — Exports / imports morts & orphelin résiduel

**Date :** 2026-06-23  
**Périmètre :** `frontend/apps/passenger/src` (+ scripts audit)  
**Méthode :** `rg` symboles · imports path · exclusion entrées app  
**Statut :** **BUILD COMPLETE** — en attente validation CTO pour commit

---

## Résumé exécutif

| Métrique | Avant P1-02 | Après P1-02 |
|----------|------------:|------------:|
| Fichiers orphelins | 1 (`SectionHeading.tsx`) | **0** |
| Exports/symboles morts supprimés | 6 connus + 14 audit | **20** |
| Re-exports morts supprimés | — | **3** |
| Exports internalisés (non publics) | — | **2** |
| FAIL audit:links | 0 | **0** |
| Bundle JS | 833.57 kB | **833.57 kB** (stable — code mort non bundlé) |

**Verdict :** aucun changement UX · routes · API · packages npm.

---

## 1. Fichier orphelin résiduel

| Fichier | Symbole | Preuve | Décision |
|---------|---------|--------|----------|
| `features/home/components/SectionHeading.tsx` | `SectionHeading` | `rg SectionHeading src` → définition seule (consommateurs supprimés P1-01) | **DELETE** fichier |

---

## 2. Exports candidats CTO (symboles listés)

| Fichier | Symbole | Preuve (`rg` hors définition) | Décision |
|---------|---------|--------------------------------|----------|
| `features/bookings/lib/booking-actions.ts` | `formatBookingReference` | 0 import | **DELETE** |
| `features/notifications/lib/notification-format.ts` | `formatNotificationTime` | 0 import | **DELETE** |
| `features/notifications/lib/notification-format.ts` | `countUnread` | 0 import | **DELETE** |
| `features/help/lib/help-categories.ts` | `HELP_CATEGORIES` | 0 import (types `HelpCategory` utilisés) | **DELETE** |
| `types/auth.ts` | `PASSENGER_USER_TYPES` | 0 import runtime ; type dérivé remplacé par union inline | **DELETE** |
| `constants/brand-assets.ts` | `BRAND_META_DESCRIPTION` | 0 import TS ; texte dans `index.html` | **DELETE** |
| `constants/brand-assets.ts` | `BRAND_THEME_COLOR` | 0 import | **DELETE** |
| `constants/brand-assets.ts` | `BRAND_SITE_URL` | 0 import ; scripts `generate-robots.mjs` utilise env | **DELETE** |
| `constants/brand-assets.ts` | `BRAND_ICONS` | 0 import | **DELETE** |

---

## 3. Exports morts — audit élargi

| Fichier | Symbole | Preuve | Décision |
|---------|---------|--------|----------|
| `features/home/constants/landing-content.ts` | `HOW_IT_WORKS_STEPS` | `@deprecated` · 0 import post-P1-01 | **DELETE** |
| `features/home/constants/landing-content.ts` | `PRICING_PLANS` | idem | **DELETE** |
| `features/home/constants/landing-content.ts` | `BENEFITS` | idem | **DELETE** |
| `features/home/constants/landing-content.ts` | `FAQ_ITEMS` | idem (Help utilise `HELP_FAQ_ITEMS`) | **DELETE** |
| `features/home/constants/landing-content.ts` | `ROUTE_FACTS` | idem | **DELETE** |
| `types/routes.ts` | `BOTTOM_NAV_ITEMS` | 0 import post-suppression `PassengerBottomNav` | **DELETE** |
| `types/routes.ts` | `BottomNavItem` | 0 import | **DELETE** |
| `features/help/lib/help-search.ts` | `export { HELP_FAQ_ITEMS }` | `HelpView` importe depuis `help-content` | **DELETE** re-export |
| `features/settings/lib/settings-form.ts` | `export { isGoogleOAuthSession }` | 0 import depuis settings-form | **DELETE** re-export |
| `lib/reservation-status.ts` | `export { getReservationStatusLabel }` | 0 import externe | **DELETE** re-export |
| `features/notifications/lib/notification-grouping.ts` | `compareNotificationsNewestFirst` | usage interne uniquement | **INTERNALIZE** |
| `features/notifications/lib/notification-grouping.ts` | `sortNotificationsDescending` | usage interne uniquement | **INTERNALIZE** |

---

## 4. Exports conservés (KEEP)

| Fichier | Symbole | Justification |
|---------|---------|---------------|
| `constants/brand-assets.ts` | `BRAND_LOGO_SRC`, `BRAND_LOGO_ALT` | `BrandLogo.tsx` |
| `features/bookings/lib/booking-actions.ts` | `canAccessBoardingPass`, `getBookingPrimaryAction`, etc. | Booking cards |
| `features/notifications/lib/notification-format.ts` | `formatNotificationDateTime` | `NotificationCard` |
| `features/help/lib/help-categories.ts` | `HelpCategory`, `HelpCategoryFilter` | Help feature |
| `types/auth.ts` | `PassengerUser`, `PassengerUserType` | Auth / profile / bookings |
| `features/home/constants/landing-content.ts` | `HERO_CONTENT`, `SUBSCRIPTION_PLANS`, etc. | Landing active |
| `lib/reservation-status.ts` | `export { getPaymentStatusLabel }` | `BookingCardDesktop`, etc. |
| `features/profile/edit/lib/profile-edit-form.ts` | `isGoogleOAuthSession` | Profile edit tabs |

---

## 5. UNCERTAIN → KEEP

| Candidat | Raison |
|----------|--------|
| `components/layout/PassengerLayout.tsx` | `@deprecated` mais routé via `router.tsx` — hors scope P1-02 |
| `lib/trip-availability.ts` | `@deprecated` commentaire interne · fonctions activement importées |

---

## 6. Vérifications post-changement

```bash
cd frontend/apps/passenger
pnpm lint
pnpm build
pnpm audit:links
```

---

## 7. KPI gate P1-02

| Critère | Cible | État |
|---------|-------|------|
| `SectionHeading.tsx` supprimé si 0 usage | oui | ✅ |
| Exports morts supprimés avec preuve | oui | ✅ 20 symboles |
| Imports morts nettoyés | oui | ✅ (`NotificationItem` retiré) |
| Comportement produit inchangé | oui | ✅ |
| lint / build / audit:links | OK | ✅ lint · build · FAIL 0 |

---

## Validation CTO

- [ ] Valider suppressions P1-02
- [ ] Autoriser commit

*Aucun commit sans validation CTO explicite.*
