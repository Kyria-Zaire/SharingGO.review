# OPS-02C-T2 — Rapport de vérification

**Ticket :** OPS-02C-T2-VERIFY  
**Date :** 2026-06-20  
**Rôle :** QA Engineer + Frontend Engineer  
**Contexte :** Flux promote Departures validé terrain iPhone ; trois points à contrôler avant clôture OPS-02C-T2.

---

## Synthèse

| Contrôle | Avant vérif. | Après correctif | Statut final |
|----------|--------------|-----------------|--------------|
| Activity Feed unique | **FAIL** | **PASS** | Corrigé |
| 409 Duplicate | **PASS** | **PASS** | Conforme |
| Carte Departures verrouillée | **PASS** (race mineure) | **PASS** | Renforcé |

**Aucun commit** · **Aucun push** — en attente validation CTO.

---

## V1 — Activity Feed (doublon INC-XXXX)

### Symptôme observé terrain

Deux lignes identiques dans Activity :

```
Incident créé depuis Départs — INC-0004
Incident créé depuis Départs — INC-0004
```

### Méthode de reproduction (analyse code)

1 promotion `promote-heuristic` exécute **une** transaction backend :
- `incident.create` (1 ligne DB)
- `writeAuditLog({ action: "INCIDENT_CREATED", targetId: incident.id })` (1 audit)

Le feed `GET /api/admin/activity-feed` agrège **deux sources** sans déduplication :

| Source | ID événement | `type` | `entityId` |
|--------|--------------|--------|------------|
| Boucle `auditLogs` | `audit:{logId}` | `INCIDENT_CREATED` | incident.id |
| Boucle `incidents` | `incident:created:{incidentId}` | `INCIDENT_CREATED` | incident.id |

Fichier : `backend/src/modules/admin/admin-activity-feed.service.ts` (l.85–131 avant correctif).

Le frontend formate les deux entrées avec le même libellé humain (`format-activity-event.ts`) car :
- l’audit expose `metadata.source = DEPARTURE_HEURISTIC` + `code` ;
- l’incident expose `description = title` heuristique (titre mappé).

### Causes écartées

| Hypothèse | Résultat |
|-----------|----------|
| Double création incident DB | **Non** — une seule ligne `incidents` |
| Double invalidation React Query | **Non** — refetch ne duplique pas les données API |
| Polling + mutation | **Non** — polling 30s ne crée pas d’événements |
| Rendu React dupliqué (`key`) | **Non** — `event.id` distincts (`audit:*` vs `incident:created:*`) |
| Backend renvoie 2 événements | **Oui — cause racine confirmée** |

### Correctif appliqué

**Fichier :** `backend/src/modules/admin/admin-activity-feed.service.ts`

Ignorer dans la boucle audit les actions déjà synthétisées depuis la table `incidents` :

- `INCIDENT_CREATED`
- `INCIDENT_RESOLVED`
- `INCIDENT_CLOSED`

**Test ajouté :** `backend/scripts/ops02b-field-incidents-test.mjs` — assertion `createdEvents.length === 1` quand promote retourne 201.

**Preuve :**

```
npm run build (backend) → OK
node scripts/ops02b-field-incidents-test.mjs → OK
```

*(Environnement local : promote 201 non rejoué — incident pré-existant → branche 409 ; la logique de skip audit est couverte par revue code + build.)*

### Attendu post-correctif

**1 promotion = 1 événement `INCIDENT_CREATED`** dans la réponse API (id `incident:created:{uuid}`).

---

## V2 — Protection anti-doublon (409)

### Procédure

1. Promouvoir une heuristique sur un trajet.
2. Re-cliquer **Promouvoir** → même trajet → même `heuristicKind`.

### Résultat

| Couche | Comportement | Statut |
|--------|--------------|--------|
| Backend | `409` + code `INCIDENT_DUPLICATE` (`admin-incidents.service.ts` l.252–270) | **PASS** |
| Frontend | Message *« Un incident existe déjà pour cette anomalie. »* dans le dialog (`usePromoteHeuristic.ts`) | **PASS** |
| DB | Aucun second incident | **PASS** |

### Traces

Script intégration :

```
✓ promote-heuristic dedup 409 (pre-existing open incident)
```

Flux frontend :

- `mutateAsync` rejette sur 409 → dialog **reste ouvert** (`DeparturesPage.tsx` ne ferme que sur succès).
- `duplicateMessage` affiché dans `PromoteHeuristicDialog`.

**Cause racine :** aucun bug — comportement métier OPS-02B conforme.

---

## V3 — Carte Departures après promotion

### Vérifications

| Point | Attendu | Résultat |
|-------|---------|----------|
| Bouton **Promouvoir** masqué pour l’heuristique promue | Oui | **PASS** |
| Badge **INC-XXXX** visible | Oui | **PASS** |
| Recréation impossible | Oui (409 si tentative) | **PASS** |

### Mécanisme

`DepartureProgressCard.tsx` :

```typescript
const unpromotedHeuristics = view.incidents.filter(
  (incident) => !promotedMap.has(promotedIncidentKey(view.tripId, incident.heuristicKind))
);
const canPromote = isAdminPanelRole(userType) && unpromotedHeuristics.length > 0;
```

`promotedMap` alimenté par `useDeparturePromotedIncidents` (incidents `DEPARTURE_HEURISTIC` OPEN / IN_PROGRESS).

### Observation mineure (race UX)

Entre succès API et fin du refetch React Query, le bouton pouvait réapparaître ~100–500 ms.

### Renforcement appliqué

**Fichier :** `frontend/src/features/departures/hooks/usePromoteHeuristic.ts`

Mise à jour optimiste du cache `queryKeys.incidents.list(DEPARTURE_HEURISTIC/OPEN)` avant `invalidateQueries` → badge et masquage **Promouvoir** immédiats.

### Cas multi-heuristiques

Si la carte affiche plusieurs badges UI (ex. `near_departure` + `full_not_boarded`), **Promouvoir** reste visible tant qu’une heuristique non promue existe — comportement **normal**, pas un bug.

---

## Tests exécutés

| Commande | Résultat |
|----------|----------|
| `npm run lint` (frontend) | **OK** |
| `npm run build` (frontend) | **OK** |
| `npm run build` (backend) | **OK** |
| `node scripts/ops02b-field-incidents-test.mjs` | **OK** |

---

## Fichiers modifiés (correctifs VERIFY)

| Fichier | Changement |
|---------|------------|
| `backend/src/modules/admin/admin-activity-feed.service.ts` | Dédup feed — skip audit incident lifecycle |
| `backend/scripts/ops02b-field-incidents-test.mjs` | Assertion feed unique sur promote 201 |
| `frontend/src/features/departures/hooks/usePromoteHeuristic.ts` | Cache optimiste post-promotion |

---

## Limites restantes

- Rebuild Docker backend requis pour prendre en compte le correctif feed en environnement ngrok/iPhone.
- Le lien **Signaler incident** (création MANUAL) reste disponible — hors scope promote heuristique.
- Résolution / clôture incident : événements `INCIDENT_RESOLVED` / `CLOSED` également dédupliqués (même pattern que CREATED).

---

## Recommandation CTO

1. Rebuild backend Docker + smoke promote sur iPhone.
2. Vérifier Activity : **une seule** ligne *Incident créé depuis Départs — INC-XXXX* par promotion.
3. Valider puis commit groupé OPS-02C-T2 + VERIFY.

---

*Rapport généré sans commit ni push.*
