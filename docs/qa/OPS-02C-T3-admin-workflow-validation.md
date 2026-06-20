# OPS-02C-T3 — Validation cockpit Incidents Admin

**Ticket :** OPS-02C-T3  
**Date :** 2026-06-20  
**Prérequis :** OPS-02B · OPS-02C-T1/T1B/T2 validés

---

## Environnement

| Élément | Valeur |
|---------|--------|
| Rôle | `admin@sharinggo.demo` |
| Frontend | Vite `:5173` ou build déployé |
| Données | ≥ 5 incidents (terrain, départs, manuel) |

---

## Checklist acceptance

### Filtres exploitation

| # | Test | Attendu | OK |
|---|------|---------|-----|
| F1 | Source **Terrain** | Uniquement `BOARDING_FIELD` | ☐ |
| F2 | Source **Départs** | Uniquement `DEPARTURE_HEURISTIC` | ☐ |
| F3 | Statut **Actifs** | OPEN + IN_PROGRESS seulement | ☐ |
| F4 | Statut **Résolu** / **Clôturé** | Sections correspondantes | ☐ |
| F5 | Sévérité **Critique** | Filtre severity CRITICAL | ☐ |
| F6 | Recherche `INC-` | Trouve par code | ☐ |
| F7 | Recherche trajet `Châlons` ou `Vatry` | Filtre par libellé trajet | ☐ |

### Fiche incident

| # | Vérification | OK |
|---|--------------|-----|
| C1 | En-tête : code + titre + badges source/sévérité/statut/type | ☐ |
| C2 | Bloc trajet : villes + date/heure | ☐ |
| C3 | **Assigné à** : Non assigné ou nom admin | ☐ |
| C4 | Affectation via select (OPEN/IN_PROGRESS) | ☐ |
| C5 | **Résolu par** visible si RESOLVED | ☐ |

### Résolution

| # | Test | Attendu | OK |
|---|------|---------|-----|
| R1 | Dialog affiche résumé Type / Source / Trajet | ☐ |
| R2 | Note &lt; 10 car. → bouton désactivé | ☐ |
| R3 | Note valide → statut RESOLVED | ☐ |

### Sections

| # | Vérification | OK |
|---|--------------|-----|
| S1 | **Incidents actifs** séparés de **Résolus** et **Clôturés** | ☐ |
| S2 | Critiques ouverts en bandeau dédié | ☐ |

### KPI

| # | KPI | OK |
|---|-----|-----|
| K1 | Ouverts | ☐ |
| K2 | En cours | ☐ |
| K3 | Critiques | ☐ |
| K4 | Résolus aujourd'hui | ☐ |

### Activity linking

| # | Test | Attendu | OK |
|---|------|---------|-----|
| A1 | Activity → **Voir l'incident** | Navigation `/incidents?incidentId=…` | ☐ |
| A2 | Carte incident surlignée + scroll | ☐ |
| A3 | Dispatch feed lien Incident | Même deep-link | ☐ |

### Non-régression

| # | Vérification | OK |
|---|--------------|-----|
| N1 | Boarding signalement terrain | ☐ |
| N2 | Départs promote heuristique | ☐ |
| N3 | Clear resolved → CLOSED | ☐ |

---

## Description UX (résumé)

```
┌─────────────────────────────────────────┐
│ KPI : Ouverts | En cours | Critiques | … │
├─────────────────────────────────────────┤
│ Filtres : Source | Statut | Sévérité     │
│           Recherche | Trajet              │
├─────────────────────────────────────────┤
│ ▼ Critiques ouverts (bandeau rouge)      │
│ ▼ Incidents actifs                       │
│ ▼ Résolus (section atténuée)             │
│ ▼ Clôturés (section atténuée)            │
└─────────────────────────────────────────┘
```

Carte incident mobile : badges empilés, bloc trajet lisible, select affectation pleine largeur.

---

## Limitations connues

| Limite | Détail |
|--------|--------|
| Recherche texte / trajet | **Client-side** sur les 100 derniers incidents chargés — pas de pagination API |
| Source **Activité** (`ACTIVITY_SUGGESTION`) | Non listée dans le filtre source (hors scope libellés demandés) |
| KPI | Calculés sur le jeu chargé, pas sur l'historique complet |
| Affectation | `PATCH assignedToUserId` — liste admins via `/api/admin/users` existant |
| Pas de endpoint recherche full-text | Documenté — filtre local uniquement |

---

## Commandes smoke

```powershell
cd frontend
npm run lint
npm run build
```

---

*Checklist à cocher après validation CTO.*
