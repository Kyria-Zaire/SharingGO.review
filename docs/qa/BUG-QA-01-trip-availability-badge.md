# BUG-QA-01 — Trip Availability Badge Consistency

**Ticket :** BUG-QA-01  
**Feature :** FEATURE-QA-02  
**Date :** 2026-06-19  
**Verdict :** **PASS** (frontend) · aucun backend modifié

---

## 1. Cause racine

| Finding | Détail |
|---------|--------|
| **Logique badge** | Déjà centralisée dans `trip-availability.ts` — règles **correctes** |
| **Comportement observé** | 8/8 restantes → « Disponible » · 2/8 restantes → « Bientôt complet » — **conforme** aux règles métier |
| **Confusion UX** | Format `2 / 8` sous « Places restantes » ambigu (places libres vs occupées) |
| **Risque technique** | Écart possible entre `remainingSeats`, `reservedSeats`, `isFull` API |

**Conclusion :** pas de bug de seuil badge ; renforcement normalisation + libellé places explicite.

---

## 2. Règles appliquées

Ordre d’évaluation (`deriveTripAvailability`) :

| # | Condition | Badge | CTA |
|---|-----------|-------|-----|
| 1 | `isDisabled` | Indisponible | disabled |
| 2 | départ passé | Passé | disabled |
| 3 | `isFull` ou `remainingSeats <= 0` | Complet | disabled |
| 4 | `remainingSeats <= 2` | Bientôt complet | actif (navigation / réserver) |
| 5 | sinon | Disponible | actif |

Seuil exporté : `ALMOST_FULL_REMAINING_THRESHOLD = 2`.

Normalisation : `normalizeTripSeats()` recalcule `remainingSeats = totalSeats - reservedSeats` si incohérence API.

---

## 3. Matrice QA manuelle

| remaining | reserved | total | isFull | Attendu badge | CTA liste | CTA détail |
|-----------|----------|-------|--------|---------------|-----------|------------|
| 8 | 0 | 8 | false | Disponible | Voir le trajet ✓ | Réserver ✓ |
| 7 | 1 | 8 | false | Disponible | ✓ | ✓ |
| 3 | 5 | 8 | false | Disponible | ✓ | ✓ |
| 2 | 6 | 8 | false | Bientôt complet | ✓ | ✓ |
| 1 | 7 | 8 | false | Bientôt complet | ✓ | ✓ |
| 0 | 8 | 8 | true | Complet | disabled | disabled |
| * | * | * | * | Passé (départ < now) | disabled | disabled |

Libellé places (liste) : `N places libres sur 8` (plus de `N / 8` seul).

---

## 4. Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `lib/trip-availability.ts` | `normalizeTripSeats`, seuil constant, `isTripBookable`, `formatRemainingSeatsLabel` |
| `TripCard.tsx` | Libellé places + `isTripBookable` |
| `TripSeatsCard.tsx` | Normalisation + libellé cohérent |
| `TripAvailabilityBadge.tsx` | inchangé (variants OK) |
| `TripDetailHero.tsx` | inchangé (utilise `deriveTripAvailability`) |
| `ReservationEntryFooter.tsx` | inchangé (CTA via `deriveTripDetailReservationCta`) |

---

## 5. Composants vérifiés

- [x] `trip-availability.ts` — source unique
- [x] `TripCard` — badge + places + CTA
- [x] `TripsList` — délègue à TripCard
- [x] `TripDetailHero` — badge
- [x] `TripSeatsCard` — compteurs
- [x] `TripDetailPage` / `ReservationEntryFooter` — CTA réserver
- [x] Backend — **non modifié** (`public-trips.service.ts` cohérent)

---

## 6. Tests

Pas de runner test configuré dans `frontend/apps/passenger` — matrice QA manuelle ci-dessus.

---

## 7. Limitations

- Seuil « Bientôt complet » fixe à **2** (CDC 8 places) — non configurable UI.
- `isDisabled` backend non exposé — statut Indisponible réservé futur.

---

*BUG-QA-01 — prêt review CTO · pas de commit sans validation.*
