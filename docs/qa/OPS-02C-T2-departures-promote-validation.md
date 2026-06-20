# OPS-02C-T2 — Validation promotion heuristique Departures

**Ticket :** OPS-02C-T2  
**Date :** 2026-06-20  
**Prérequis :** OPS-02B déployé · OPS-02C-T1/T1B validés · route `POST /api/admin/incidents/promote-heuristic`

---

## Environnement

| Élément | Valeur attendue |
|---------|-----------------|
| Backend | Docker `sharinggo-backend-dev` ≥ commit `76baaf3` |
| Frontend | Vite `:5173` ou build déployé |
| Rôle test | `admin@sharinggo.demo` ou `superadmin` |

---

## Checklist

### 1. Promotion succès

| # | Action | Résultat attendu | OK |
|---|--------|------------------|-----|
| 1.1 | Admin → **Departures** | Cartes avec heuristiques (ex. BOARDING, badges warning) | ☐ |
| 1.2 | Carte avec anomalie → **Promouvoir** | Dialog confirmation avec libellé anomalie lisible | ☐ |
| 1.3 | **Confirmer** | Toast `Incident INC-XXXX créé` | ☐ |
| 1.4 | Admin → **Incidents** | Incident visible, source **Départs**, trajet lisible | ☐ |

### 2. Promotion doublon (409)

| # | Action | Résultat attendu | OK |
|---|--------|------------------|-----|
| 2.1 | Re-cliquer **Promouvoir** sur la même anomalie | Message **Un incident existe déjà pour cette anomalie.** | ☐ |
| 2.2 | Pas de second incident créé | ☐ |
| 2.3 | Bouton **Promouvoir** masqué pour cette heuristique | ☐ |

### 3. Badge carte départ

| # | Vérification | Résultat attendu | OK |
|---|--------------|------------------|-----|
| 3.1 | Après promotion | Badge **INC-XXXX** (ou INCIDENT OUVERT) sur la carte | ☐ |
| 3.2 | Badge persiste après refresh page | ☐ |

### 4. Activity Feed

| # | Vérification | Résultat attendu | OK |
|---|--------------|------------------|-----|
| 4.1 | Après promotion | **Incident créé depuis Départs — INC-XXXX** | ☐ |
| 4.2 | Pas de type brut `INCIDENT_CREATED` en titre principal | ☐ |

### 5. Non-régression

| # | Vérification | OK |
|---|--------------|-----|
| 5.1 | Compteurs Occupés / Embarqués inchangés | ☐ |
| 5.2 | Readiness badges inchangés | ☐ |
| 5.3 | Boarding scan non impacté | ☐ |
| 5.4 | Lien **Signaler incident** manuel toujours présent | ☐ |

---

## Smoke API (optionnel)

```powershell
# 401 sans session attendu
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/incidents/promote-heuristic" `
  -Method POST -ContentType "application/json" `
  -Body '{"relatedTripId":"x","heuristicKind":"full_not_boarded"}'
```

---

## Limites connues (hors T2)

- Heuristiques sans badge UI → pas de bouton Promouvoir (anomalie doit être détectée par le board).
- Filtre incidents par source côté UI admin : hors scope.
- Cycle lifecycle WAITING → DEPARTED : hors scope OPS-02.

---

*Checklist à cocher après validation CTO.*
