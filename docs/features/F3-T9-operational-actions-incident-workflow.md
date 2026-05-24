# F3-T9 — Operational Actions & Incident Workflow

## Objectif

Évoluer le cockpit admin de la **supervision** vers un **workflow incident opérationnel local** : signalement terrain, suivi open/resolved, actions rapides — **frontend-only**, sans backend ni persistance serveur.

## Architecture locale

```text
frontend/src/features/incidents/
  constants/     incidents-config, search-pinned patterns
  storage/       localStorage load/save + custom event
  hooks/         useOperationalIncidents, useOpenIncidentCount
  utils/         INC-XXXX generator, sort, filter, format time
  components/    cards, badges, forms, actions panel, toast
```

| Clé localStorage | Usage |
|------------------|-------|
| `sharinggo.admin.incidents` | Liste JSON `OperationalIncident[]` |
| `sharinggo.admin.incidents.counter` | Compteur séquence INC-XXXX |

Événement same-tab : `sharinggo:incidents-updated` (badge sidebar).

## Modèle `OperationalIncident`

- `incidentCode` : `INC-0001`, `INC-0002`, …
- `severity` : `info` \| `warning` \| `critical`
- `status` : `open` \| `resolved`
- `category` : boarding, departure, capacity, payment, system, other
- `resolvedAt` affiché en **Resolved HH:mm** (locale `fr-FR`)

Champs futurs réservés : `assignedTo`, `assignedToLabel`, `notes`, `collapsed`.

## Incident IDs (INC-XXXX)

- Générateur local basé sur compteur + max codes existants
- **Jamais réutilisé** après clear resolved
- Stable après refresh navigateur

## Tri & sections

1. **Critical sticky** — `severity=critical` + `status=open` en haut (section dédiée)
2. **Auto-sort** autres incidents : warning open → info open → resolved
3. Section **Resolved** structurée pour futur collapse (`data-future-collapse`)

## UX obligatoire V1

| Feature | Implémentation |
|---------|----------------|
| Create incident | Formulaire léger + confirm si critical |
| Toast création | `Incident INC-0004 créé` (~3,5 s) |
| Resolve | Confirm + `resolvedAt` |
| Clear resolved | Confirm + suppression locale |
| Filtres | open only, severity, category |
| Sidebar badge | Count incidents **open** sur nav Incidents |
| Actions panel | Créer, ouverts, critiques, departures, boarding, clear |

## Intégrations cockpit

| Source | Lien |
|--------|------|
| Monitoring | `Créer incident système` → `/incidents?category=system&create=1` |
| Departures | `Signaler incident` → `/incidents?tripId=…&category=departure&create=1` |

Route : `/incidents` — sidebar **Incidents** (+ badge count).

## Sécurité

Ne jamais stocker : JWT, boarding tokens, Stripe IDs, secrets, payloads sensibles.

Titres/descriptions opérateur uniquement — pas de données PII lourdes requises V1.

## Limites V1

- Pas de persistance serveur / sync multi-opérateur
- Pas de websocket / realtime
- Pas d’assignation opérateur réelle
- Pas de ticketing enterprise
- Toast local page-level (pas de lib notifications)

## Futur documenté (non implémenté)

| Enhancement | Préparation |
|-------------|-------------|
| Sticky « Nouveau incident » | Follow-up UX cockpit dense |
| Timeline Today / Earlier / Resolved | `data-future-collapse`, sections resolved |
| Critical pulse | `INCIDENT_CRITICAL_PULSE_CLASS` sur badge critical open |
| Operator ownership | `assignedTo`, `assignedToLabel` |
| Operator avatar | metadata future |
| Audit trail / shared incidents | types + doc |
| Backend incidents API | remplacera localStorage |
| Realtime | hooks documentés |

## Test plan

- [ ] Créer incident info/warning/critical
- [ ] Confirm critical à la création
- [ ] Toast `Incident INC-XXXX créé`
- [ ] Refresh → persistence localStorage
- [ ] Resolve + timestamp Resolved HH:mm
- [ ] Critical sticky en haut
- [ ] Auto-sort warning/info/resolved
- [ ] Filtres open/severity/category
- [ ] Clear resolved + confirm
- [ ] Sidebar badge count open
- [ ] Monitoring → incident système prérempli
- [ ] Departures → signalement avec tripId
- [ ] Aucun secret en storage
- [ ] `npm run lint` / `npm run build`

## Fichiers

- `frontend/src/pages/IncidentsPage.tsx`
- `frontend/src/types/incidents.types.ts`
- `frontend/src/features/incidents/**`
- `frontend/src/constants/routes.ts`, `navigation.ts`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/pages/MonitoringPage.tsx`
- `frontend/src/features/departures/components/DepartureProgressCard.tsx`
