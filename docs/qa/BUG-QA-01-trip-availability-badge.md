# BUG-QA-01 — Trip Availability Badge Consistency

**Ticket :** BUG-QA-01 (+ BUG-QA-01B/C)  
**Feature :** FEATURE-QA-02  
**Date :** 2026-06-19  
**Verdict :** **VALIDÉ CTO** (frontend) · aucun backend modifié

---

## 1. Cause racine

| Finding | Détail |
|---------|--------|
| **Référentiel UI** | Liste `/trips` affichait des **places restantes** alors que l’utilisateur lit **X/8** comme des places **réservées** |
| **Symptôme** | « 2 places libres sur 8 » + badge « Bientôt complet » — incohérent pour l’utilisateur (il lit 2/8 pris → Disponible) |
| **Réalité métier** | 2 restantes = 6 réservées → badge « Bientôt complet » était correct côté seuil, mais **mauvais référentiel affiché** |
| **Risque technique** | Écart possible entre `remainingSeats` API et `reservedSeats` — normalisation basée sur `reservedSeats` |

**Conclusion :** correction du **référentiel affiché** (réservées) + badges alignés sur l’occupation.

---

## 2. Règles appliquées

Ordre d’évaluation (`deriveTripAvailability`) :

| # | Condition | Badge | CTA |
|---|-----------|-------|-----|
| 1 | `isDisabled` | Indisponible | disabled |
| 2 | départ passé | Passé | disabled |
| 3 | `isFull` ou `remainingSeats <= 0` | Complet | disabled |
| 4 | `reservedSeats >= totalSeats - 2` | Bientôt complet | actif |
| 5 | sinon | Disponible | actif |

Seuil : `ALMOST_FULL_REMAINING_THRESHOLD = 2` → `almostFullReservedThreshold(total)` (= 6 sur 8).

Normalisation : `remainingSeats = totalSeats - reservedSeats` (source : `reservedSeats` API).

---

## 3. Matrice QA manuelle

| reserved | remaining | total | Attendu badge | Libellé liste `/trips` |
|----------|-----------|-------|---------------|------------------------|
| 0 | 8 | 8 | Disponible | `0 place réservée sur 8` |
| 2 | 6 | 8 | Disponible | `2 places réservées sur 8` |
| 6 | 2 | 8 | Bientôt complet | `6 places réservées sur 8` |
| 8 | 0 | 8 | Complet | `8 places réservées sur 8` |

Lecture produit intuitive :

```text
0/8 réservé → Disponible
6/8 réservé → Bientôt complet
8/8 réservé → Complet
```

Page détail : `TripSeatsCard` conserve restantes + capacité + libellé restantes.

---

## 4. Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `lib/trip-availability.ts` | `formatReservedSeatsLabel`, badge sur `reservedSeats`, `almostFullReservedThreshold` |
| `TripCard.tsx` | « Places réservées » + `formatReservedSeatsLabel` |
| `TripSeatsCard.tsx` | restantes sur détail (inchangé fonctionnellement) |
| `TripAvailabilityBadge.tsx` | inchangé (variants OK) |

---

## 5. Composants vérifiés

- [x] `trip-availability.ts` — source unique
- [x] `TripCard` — badge + occupation + CTA
- [x] `TripsList` — délègue à TripCard
- [x] `TripDetailHero` — badge
- [x] `TripSeatsCard` — compteurs détail
- [x] Backend — **non modifié** (`public-trips.service.ts` cohérent)

---

## 6. Tests

`npm run lint` · `npm run build` — PASS. Pas de runner test unitaire configuré dans passenger.

---

*BUG-QA-01 — VALIDÉ CTO · commit `fix(passenger): align trip availability display with reserved seats`.*
