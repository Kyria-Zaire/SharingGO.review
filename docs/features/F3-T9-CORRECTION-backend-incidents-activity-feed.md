# F3-T9-CORRECTION — Backend Incidents, Annulation & Activity Feed

## Objectif

Remplacer le workflow incidents **localStorage** (F3-T9) par une persistance **PostgreSQL** partagée entre admins, ajouter l’**annulation admin** des réservations et un **flux d’activité** unifié (`AuditLog` + `Incident`).

## Migration Prisma

`20260525071148_add_incidents_model`

```text
Incident + enums IncidentType | IncidentStatus | IncidentSeverity
User.incidentsCreated → Incident.creator
```

## Endpoints backend

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/incidents` | Liste paginée (filtres status, type, severity, dates) |
| POST | `/api/admin/incidents` | Création (`code` auto INC-XXXX) |
| GET | `/api/admin/incidents/:id` | Détail |
| PATCH | `/api/admin/incidents/:id` | Mise à jour (resolve → `resolvedAt` + audit) |
| DELETE | `/api/admin/incidents/:id` | Fermeture V1 (`status=CLOSED`) |
| POST | `/api/admin/incidents/import-local` | Import batch depuis format localStorage legacy |
| POST | `/api/admin/reservations/:id/cancel` | `status=CANCELED` + `RESERVATION_CANCELLED` audit |
| GET | `/api/admin/activity-feed` | Fusion AuditLog + incidents (pagination mémoire V1) |

Auth : `ADMIN` / `SUPER_ADMIN` (cookie session).

## Annulation réservation

- Pas de remboursement Stripe V1
- Refus si déjà `CANCELED` ou `USED`
- Audit : `RESERVATION_CANCELLED` avec `reason` optionnelle dans le body

## Activity feed

Sources fusionnées côté serveur (cap ~250 chacune) :

- Tous les `AuditLog` récents
- `INCIDENT_CREATED` + `INCIDENT_RESOLVED` dérivés des incidents

Champs événement : `id`, `type`, `severity`, `title`, `description`, `timestamp`, `actorUserId`, `actorName`, `entityId`, `entityType`.

## Import localStorage legacy

Le frontend détecte encore `sharinggo.admin.incidents` et appelle `POST /import-local` avec mapping :

| Legacy | Backend |
|--------|---------|
| category departure | DELAY |
| boarding/capacity | BEHAVIOR |
| system/payment | TECHNICAL |
| severity info/warning/critical | LOW/MEDIUM/CRITICAL |
| status open/resolved | OPEN/RESOLVED |

Codes `INC-XXXX` existants conservés ; doublons ignorés (`skipped`).

## Frontend

| Route | Page |
|-------|------|
| `/incidents` | Incidents persistés (TanStack Query) |
| `/activity` | Timeline activité + polling 30s optionnel |

- Hook `useIncidentsList` / `useIncidentsOperations`
- Badge sidebar : incidents `OPEN` + `IN_PROGRESS`
- Plus de `useOperationalIncidents` localStorage (sauf import)

## Exclusions V1

- Pas de remboursement Stripe
- Pas de WebSocket / realtime
- Pas d’export feed
- DELETE incident = CLOSED (pas de suppression physique)

## Futur (F3-T11 Dispatch Timeline)

- Feed dispatch dédié sur ces APIs
- Groupement Today / Earlier / Resolved
- Operator ownership (`assignedTo`)

## Test manuel

```powershell
# Après migration + backend up
curl.exe -b admin-cookies.txt http://localhost:3000/api/admin/incidents
curl.exe -b admin-cookies.txt http://localhost:3000/api/admin/activity-feed
curl.exe -b admin-cookies.txt -X POST http://localhost:3000/api/admin/reservations/RES_ID/cancel -H "Content-Type: application/json" -d "{\"reason\":\"ops test\"}"
```

Frontend : `npm run lint` + `npm run build` — pages `/incidents` et `/activity`.
