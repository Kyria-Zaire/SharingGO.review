# OPS-02B — Technical Design Review · Incident Management

**Ticket :** OPS-02B — Technical Design Review  
**Feature :** OPS-02 — Incident Management  
**Phase BMAD :** BUILD (backend livré — gate VERIFY en attente CTO)
**Ticket :** OPS-02B — Backend API + Migration + Tests  
**Dernière mise à jour :** 2026-06-20  
**Statut :** **BUILD livré localement — VERIFY backend en attente validation CTO (pas de commit)**
  
**Date :** 2026-06-19  
**Rôles :** Senior Backend Architect · Senior Frontend Architect · Tech Lead  
**Prérequis :** OPS-02 audit ✅ · OPS-02A PRD validé CTO ✅  
**Statut :** **Design proposé — BUILD backend livré 2026-06-20 (VERIFY en attente CTO)**  
**Code modifié :** aucun  
**Migration exécutée :** aucune  
**Commit :** aucun

> Sources : [`docs/prd/active/OPS-02-incident-management.md`](../prd/active/OPS-02-incident-management.md) · [`docs/qa/OPS-02-incidents-functional-audit.md`](../qa/OPS-02-incidents-functional-audit.md)  
> Socle code : F3-T9-CORRECTION · S2-T5 · S2-T7 · F3-T7

---

## 1. Architecture actuelle

### 1.1 Vue d'ensemble

OPS-02 **n'est pas une feature verte**. Elle étend un socle exploitation déjà en production locale :

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         COCKPIT ADMIN (React)                            │
│  Dashboard ─ Departures ─ Boarding ─ Incidents ─ Activity ─ Monitoring  │
└───────────────┬───────────────────────────────┬─────────────────────────┘
                │ /api/admin/*                  │ /api/boarding/*
                │ ADMIN | SUPER_ADMIN only      │ DRIVER | ADMIN | SUPER_ADMIN
                ▼                               ▼
┌───────────────────────────┐     ┌───────────────────────────────────────┐
│ admin-incidents.service   │     │ boarding.consumption / validation     │
│ admin-activity-feed       │     │ (pas de lien Incident aujourd'hui)    │
│ admin-occupancy           │     └───────────────────────────────────────┘
└───────────────┬───────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PostgreSQL · Incident · AuditLog · Reservation · Trip · Payment         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Table `Incident` (état actuel)

```prisma
model Incident {
  id                   String           @id @default(cuid())
  code                 String           @unique
  title                String
  description          String?
  type                 IncidentType     // DELAY | TECHNICAL | BEHAVIOR | OTHER
  status               IncidentStatus   @default(OPEN)
  severity             IncidentSeverity
  relatedReservationId String?
  relatedTripId        String?
  createdBy            String
  creator              User             @relation("IncidentCreator", ...)
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  resolvedAt           DateTime?
  resolution           String?
}
```

**Relations existantes :**
- `User.incidentsCreated` → `Incident.creator` (FK `created_by` ON DELETE RESTRICT)
- **Pas de FK** vers `Trip` ni `Reservation` (IDs libres, validation applicative absente aujourd'hui)

**Index existants :** `code` (unique), `status`, `related_reservation_id`, `related_trip_id`, `createdAt`

### 1.3 API incidents admin (état actuel)

| Route | Handler | Service |
|-------|---------|---------|
| `GET /api/admin/incidents` | `listAdminIncidentsHandler` | Filtres status/type/severity/dates |
| `POST /api/admin/incidents` | `createAdminIncidentHandler` | `generateNextIncidentCode()` → `INC-XXXX` |
| `GET /api/admin/incidents/:id` | `getAdminIncidentHandler` | — |
| `PATCH /api/admin/incidents/:id` | `patchAdminIncidentHandler` | Resolve → `resolvedAt` + audit |
| `DELETE /api/admin/incidents/:id` | `deleteAdminIncidentHandler` | Soft close → `CLOSED` |
| `POST /api/admin/incidents/import-local` | `importLocalIncidentsHandler` | Legacy localStorage |

Middleware : `adminMiddleware` = `requireAuth` + `requireRole(ADMIN, SUPER_ADMIN)` uniquement.

### 1.4 Boarding (état actuel)

| Route | Rôles | Lien Incident |
|-------|-------|---------------|
| `POST /api/boarding/consume` | DRIVER, ADMIN, SUPER_ADMIN | Audit `BOARDING_CONSUMED` / `BOARDING_CONSUMPTION_ERROR` |
| `POST /api/boarding/validate` | idem | Audit validation |
| `GET /api/boarding/offline-capabilities` | public | — |

**Gap critique design :** les réponses **échec** consume/validate ne retournent **pas** `reservationId` / `tripId` :

```typescript
// boarding.consumption.types.ts — échec
{ valid: false, consumed: false, reason: "...", ui: {...} }
```

Le frontend (`BoardingPage`) ne dispose donc que de `reason` pour alimenter un signalement — sauf extension API ou re-soumission JWT.

### 1.5 Departures (état actuel)

- Calcul **frontend only** : `computeDepartureIncidents()` dans `departure-board.ts`
- 6 kinds heuristiques (`near_departure`, `full_not_boarded`, etc.) — **non persistés**
- Action UI : lien `Signaler incident` → `/incidents?tripId=…&create=1` (préremplit formulaire admin)

### 1.6 Activity Feed (état actuel)

`listAdminActivityFeed()` fusionne :
- `AuditLog` (cap 250) → événements dynamiques par `action`
- `Incident` (cap 250) → synthèse :
  - `INCIDENT_CREATED` à la création
  - `INCIDENT_RESOLVED` si `resolvedAt` + status RESOLVED/CLOSED

**Gaps :**
- Pas d'événement `INCIDENT_CLOSED` distinct
- `INCIDENT_RESOLVED` utilise `createdBy` comme acteur (pas le résolveur PATCH)
- Pas de suggestions depuis `BOARDING_CONSUMPTION_ERROR` / `PAYMENT_REJECTED_*`

### 1.7 Dashboard / Monitoring (état actuel)

| Composant | Source incidents |
|-----------|------------------|
| `computeDashboardKpis` | `openIncidents` = count OPEN + IN_PROGRESS |
| `buildAttentionItems` | `isCriticalOpen` → lien `/incidents` |
| `useDispatchStickySummary` | incidents + departures board |
| Sidebar `useOpenIncidentCount` | poll incidents list |
| Monitoring | lien manuel « Créer incident système » |

Aucun filtre par `source` · pas de KPI « signalements chauffeur / jour ».

---

## 2. Architecture cible

### 2.1 Flux cible OPS-02

```text
TERRAIN (DRIVER)                         EXPLOITATION (ADMIN)
────────────────                         ────────────────────
Scan échoue                              Departures heuristique
     │                                         │
     ▼                                         ▼
POST /api/boarding/field-incidents       POST /api/admin/incidents/promote-heuristic
     │ source=BOARDING_FIELD                    │ source=DEPARTURE_HEURISTIC
     │                                         │
     └──────────────┬──────────────────────────┘
                    ▼
            Table Incident (étendue)
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Activity     Dashboard    AuditLog
   Feed         KPIs         INCIDENT_*
```

### 2.2 Principes d'architecture (validés CTO)

| Principe | Implémentation |
|----------|----------------|
| Séparation PASSENGER / DRIVER / ADMIN | `field-incidents` sous `/api/boarding/*` — **jamais** `/api/admin/*` pour DRIVER |
| Extension, pas remplacement | Conserver CRUD admin F3-T9 · migration additive |
| Pas de FK dure Trip/Reservation V1 | Validation existence serveur · intégrité soft |
| Pas de JWT/PII dans `sourceRef` | Zod denylist · audit review |
| Incident ≠ action métier | Cancel/remboursement restent APIs dédiées |

### 2.3 Modules backend impactés (BUILD)

| Module | Fichiers cibles (à créer/modifier en OPS-02B) |
|--------|-----------------------------------------------|
| `boarding` | `field-incidents.controller.ts`, `field-incidents.service.ts`, `field-incidents.schemas.ts`, `boarding.routes.ts` |
| `admin` | `admin-incidents.*` (schemas, service, serializers), `admin-activity-feed.service.ts`, `admin.routes.ts` |
| `lib` | Réutiliser `generateNextIncidentCode`, `writeAuditLog` |
| `prisma` | `schema.prisma` + migration `add_ops02_incident_fields` |

### 2.4 Extension optionnelle consume/validate (recommandée OPS-02B)

Pour alimenter `field-incidents` sans saisie manuelle d'IDs :

**Ajout non-breaking** aux réponses échec boarding (quand dérivable du JWT vérifié) :

```typescript
context?: {
  reservationId?: string;
  tripId?: string;
}
```

Uniquement après `verifyBoardingToken()` réussi même si eligibility échoue. **Jamais** sur `INVALID_TOKEN` / `INVALID_PAYLOAD`.

---

## 3. Data model

### 3.1 Enums cibles

#### `IncidentType` (extension PostgreSQL)

```sql
ALTER TYPE "IncidentType" ADD VALUE 'BOARDING';
ALTER TYPE "IncidentType" ADD VALUE 'CAPACITY';
ALTER TYPE "IncidentType" ADD VALUE 'PAYMENT';
ALTER TYPE "IncidentType" ADD VALUE 'NO_SHOW';
ALTER TYPE "IncidentType" ADD VALUE 'SAFETY';
-- DELAY, TECHNICAL, BEHAVIOR, OTHER conservés
```

**Ordre migration :** une valeur par statement (limitation PostgreSQL) · transaction par migration Prisma.

#### `IncidentSource` (nouveau)

```prisma
enum IncidentSource {
  MANUAL
  BOARDING_FIELD
  DEPARTURE_HEURISTIC
  MONITORING
  ACTIVITY_SUGGESTION
}
```

#### `IncidentClosedReason` (nouveau)

```prisma
enum IncidentClosedReason {
  FIXED
  FALSE_ALARM
  DUPLICATE
  WONT_FIX
}
```

### 3.2 Champs cibles — modèle `Incident`

```prisma
model Incident {
  // ── existants (inchangés) ──
  id                   String               @id @default(cuid())
  code                 String               @unique
  title                String
  description          String?
  type                 IncidentType
  status               IncidentStatus       @default(OPEN)
  severity             IncidentSeverity
  relatedReservationId String?              @map("related_reservation_id")
  relatedTripId        String?              @map("related_trip_id")
  createdBy            String               @map("created_by")
  creator              User                 @relation("IncidentCreator", fields: [createdBy], references: [id])
  createdAt            DateTime             @default(now())
  updatedAt            DateTime             @updatedAt
  resolvedAt           DateTime?
  resolution           String?

  // ── OPS-02B additions ──
  source               IncidentSource       @default(MANUAL)
  sourceRef            Json?                // schéma Zod strict côté app
  occurredAt           DateTime             @default(now())
  closedReason         IncidentClosedReason?
  assignedToUserId     String?              @map("assigned_to_user_id")
  assignee             User?                @relation("IncidentAssignee", fields: [assignedToUserId], references: [id])
  resolvedByUserId     String?              @map("resolved_by_user_id")
  resolver             User?                @relation("IncidentResolver", fields: [resolvedByUserId], references: [id])

  @@index([status])
  @@index([severity])
  @@index([source])
  @@index([relatedTripId])
  @@index([relatedReservationId])
  @@index([createdAt])
  @@index([status, severity])
  @@index([relatedTripId, status])
  @@index([assignedToUserId])
}
```

**Relations `User` à ajouter :**

```prisma
incidentsAssigned  Incident[] @relation("IncidentAssignee")
incidentsResolved  Incident[] @relation("IncidentResolver")
```

### 3.3 Schéma `sourceRef` (validation Zod — pas Prisma)

```typescript
const sourceRefSchema = z
  .object({
    kind: z.string().max(64).optional(),
    heuristicId: z.string().max(64).optional(),
    boardingReason: z.string().max(64).optional(),
    requestId: z.string().max(64).optional(),
    auditLogId: z.string().max(64).optional(),
    suggestedFrom: z.enum(["activity_feed"]).optional(),
  })
  .strict()
  .refine((obj) => !JSON.stringify(obj).match(/jwt|email|stripePaymentIntent/i), {
    message: "Forbidden keys in sourceRef",
  });
```

**Taille max JSON :** 1 KB sérialisé.

### 3.4 Index recommandés — justification

| Index | Usage |
|-------|-------|
| `(status, severity)` | Liste critiques ouverts · dashboard attention |
| `(relatedTripId, status)` | Incidents par départ · dedup promote |
| `(source)` | KPI signalements chauffeur / filtre feed |
| `(severity)` seul | Filtre incidents page |
| `(assignedToUserId)` | Préparation V2 assignation |

**Pas d'index unique JSON** sur `(relatedTripId, sourceRef->heuristicId)` — dédup en application layer (requête `findFirst`).

### 3.5 Contraintes recommandées

| Contrainte | Niveau | Règle |
|------------|--------|-------|
| `code` unique | DB | Conservé |
| `created_by` FK | DB | Conservé RESTRICT |
| `assigned_to` / `resolved_by` FK | DB | Optionnel · ON DELETE SET NULL |
| `relatedTripId` requis | App | Si `source` ∈ `BOARDING_FIELD`, `DEPARTURE_HEURISTIC` · sauf `type=TECHNICAL` global |
| `resolution` requis | App | Si `status → RESOLVED` |
| `relatedReservationId` ∈ trip | App | Si les deux fournis : `reservation.tripId === relatedTripId` |
| Trip exists | App | `prisma.trip.findUnique` — 404 si absent (sauf signalement TRIP_DISABLED avec trip supprimé : accepter tripId historique) |
| Pas de DELETE physique | App | `CLOSED` uniquement |

### 3.6 Compatibilité données existantes

| Champ nouveau | Default migration | Rétrocompat API |
|---------------|-------------------|-----------------|
| `source` | `MANUAL` | Serializer expose champ |
| `sourceRef` | `NULL` | Optionnel en lecture |
| `occurredAt` | `createdAt` copie SQL | ISO string |
| `closedReason` | `NULL` | Optionnel |
| `assignedToUserId` | `NULL` | Optionnel |
| `resolvedByUserId` | `NULL` | Backfill impossible — reste null incidents historiques |

**Incidents importés localStorage :** conservent `source=MANUAL` · mapping type legacy inchangé.

---

## 4. RBAC

### 4.1 Modèle rôles SharingGO

| Rôle Prisma | Alias PRD | Périmètre OPS-02 |
|-------------|-----------|------------------|
| `CONVOYEUR` | PASSENGER | Aucun accès incidents |
| `DRIVER` | DRIVER | Création terrain uniquement |
| `ADMIN` | ADMIN | CRUD exploitation complet |
| `SUPER_ADMIN` | SUPER_ADMIN | Idem ADMIN |

> Note : le CDC utilise « passager » ; le code utilise `UserType.CONVOYEUR`.

### 4.2 Matrice permissions détaillée

| Action | CONVOYEUR | DRIVER | ADMIN | SUPER_ADMIN |
|--------|-----------|--------|-------|-------------|
| **Lecture** | | | | |
| `GET /api/admin/incidents` | 403 | 403 | ✅ | ✅ |
| `GET /api/admin/incidents/:id` | 403 | 403 | ✅ | ✅ |
| `GET /api/admin/activity-feed` | 403 | 403 | ✅ | ✅ |
| Liste incidents UI `/incidents` | 403 | 403 | ✅ | ✅ |
| **Création** | | | | |
| `POST /api/boarding/field-incidents` | 403 | ✅ | ✅ | ✅ |
| `POST /api/admin/incidents` | 403 | 403 | ✅ | ✅ |
| `POST /api/admin/incidents/promote-heuristic` | 403 | 403 | ✅ | ✅ |
| `POST /api/admin/incidents/import-local` | 403 | 403 | ✅ | ✅ |
| **Mise à jour** | | | | |
| `PATCH /api/admin/incidents/:id` (IN_PROGRESS) | 403 | 403 | ✅ | ✅ |
| `PATCH /api/admin/incidents/:id` (RESOLVED) | 403 | 403 | ✅ | ✅ |
| **Clôture** | | | | |
| `DELETE /api/admin/incidents/:id` → CLOSED | 403 | 403 | ✅ | ✅ |
| Batch clear resolved (UI) | 403 | 403 | ✅ | ✅ |
| **Actions métier liées** | | | | |
| `POST /api/admin/reservations/:id/cancel` | 403 | 403 | ✅ | ✅ |

### 4.3 Règles middleware

```text
field-incidents:
  requireAuth
  requireRole(DRIVER, ADMIN, SUPER_ADMIN)
  adminLimiter (100 req/min — routes auth)

admin incidents:
  adminMiddleware (ADMIN, SUPER_ADMIN)
```

**Interdit explicitement :** étendre `adminMiddleware` au rôle `DRIVER`.

### 4.4 Contrôles IDOR

| Vérification | Endpoint |
|--------------|----------|
| `relatedTripId` existe | field-incidents, admin create, promote |
| `relatedReservationId` existe + cohérent trip | field-incidents, admin create |
| `assignedToUserId` existe + rôle ops | PATCH (optionnel MVP) |
| Chauffeur ne PATCH pas incident d'un autre sans être admin | N/A — DRIVER n'a pas PATCH |

### 4.5 UI guards (frontend — OPS-02C)

| Route | Guard actuel | Évolution |
|-------|--------------|-----------|
| `/boarding` | `RequireRole(DRIVER, ADMIN, SUPER_ADMIN)` | Inchangé + bouton signalement |
| `/incidents` | `RequireRole(ADMIN, SUPER_ADMIN)` | Inchangé |
| `/departures` | Admin | Bouton promote |
| `/` Dashboard | Admin | KPIs enrichis |

---

## 5. API design

### 5.1 Nouvelle API P0 — `POST /api/boarding/field-incidents`

**Router :** `boardingRouter` · même stack que `/consume`

#### Request body (Zod)

```typescript
const fieldIncidentBodySchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  type: z.nativeEnum(IncidentType).optional(),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  relatedTripId: z.string().trim().min(1),
  relatedReservationId: z.string().trim().min(1).optional(),
  boardingContext: z
    .object({
      consumeReason: z.string().trim().max(64).optional(),
      validateReason: z.string().trim().max(64).optional(),
      requestId: z.string().trim().max(64).optional(),
      boardingToken: z.string().trim().min(1).optional(), // JWT — serveur verify pour enrichir IDs
    })
    .optional(),
});
```

#### Algorithme serveur (`createFieldIncident`)

```text
1. Valider body Zod
2. Si boardingContext.boardingToken :
     verifyBoardingToken() → extraire reservationId, tripId
     Vérifier cohérence avec relatedTripId fourni
3. Sinon si relatedReservationId :
     Charger reservation → vérifier tripId match
4. Sinon :
     Vérifier trip existe (deletedAt autorisé si reason TRIP_DISABLED)
5. Dériver title/type/severity si boardingContext.consumeReason présent
     (table mapping §5.1.1)
6. Appliquer severity floor (INTERNAL_* → min HIGH)
7. source = BOARDING_FIELD
8. sourceRef = { boardingReason, requestId } — pas de JWT stocké
9. generateNextIncidentCode() + prisma.incident.create
10. writeAuditLog(INCIDENT_CREATED)
11. Retourner serializeAdminIncident (même DTO que admin)
```

#### 5.1.1 Mapping `boardingReason` → type / titre / severity floor

| `consumeReason` / `validateReason` | `type` auto | `severity` min | Titre auto (FR) |
|-----------------------------------|-------------|----------------|-----------------|
| `PAYMENT_NOT_SUCCEEDED` | PAYMENT | HIGH | Paiement non validé — signalement terrain |
| `INTERNAL_CONSUMPTION_ERROR` | TECHNICAL | HIGH | Erreur enregistrement embarquement |
| `INTERNAL_VALIDATION_ERROR` | TECHNICAL | HIGH | Erreur vérification billet |
| `TRIP_DISABLED` | TECHNICAL | HIGH | Trajet indisponible |
| `BOARDING_WINDOW_EXPIRED` | BOARDING | MEDIUM | Billet expiré |
| `EXPIRED_TOKEN` | BOARDING | MEDIUM | QR expiré |
| `TOKEN_REVOKED` | BOARDING | MEDIUM | Billet révoqué |
| `RESERVATION_NOT_FOUND` | BOARDING | MEDIUM | Billet introuvable |
| `INVALID_TOKEN` / `INVALID_*` | BOARDING | MEDIUM | QR invalide |
| *(aucune reason)* | OTHER ou body.type | MEDIUM | Titre body ou « Signalement terrain » |

**Exclu du signalement :** `BOARDING_ALREADY_USED` — pas de bouton UI (comportement normal).

#### Response 201

Même shape que `serializeAdminIncident` étendu :

```json
{
  "id": "cuid",
  "code": "INC-0042",
  "title": "Paiement non validé — signalement terrain",
  "description": "File bloquée porte B",
  "type": "PAYMENT",
  "status": "OPEN",
  "severity": "HIGH",
  "source": "BOARDING_FIELD",
  "sourceRef": { "boardingReason": "PAYMENT_NOT_SUCCEEDED", "requestId": "..." },
  "relatedTripId": "...",
  "relatedReservationId": "...",
  "occurredAt": "2026-06-19T07:55:00.000Z",
  "closedReason": null,
  "assignedToUserId": null,
  "resolvedByUserId": null,
  "createdBy": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "resolvedAt": null,
  "resolution": null,
  "creator": { "id": "...", "email": "...", "firstName": "...", "lastName": "..." }
}
```

#### Erreurs

| HTTP | `code` | Cas |
|------|--------|-----|
| 400 | `VALIDATION_ERROR` | Zod · tripId manquant · resolution N/A ici |
| 403 | `FORBIDDEN` | CONVOYEUR |
| 404 | `TRIP_NOT_FOUND` | tripId invalide |
| 404 | `RESERVATION_NOT_FOUND` | reservationId invalide |
| 409 | `RESERVATION_TRIP_MISMATCH` | reservation pas sur trip |
| 409 | `INCIDENT_DUPLICATE` | Optionnel MVP : même requestId + trip OPEN |
| 429 | `RATE_LIMITED` | adminLimiter |
| 500 | `INTERNAL_ERROR` | — |

---

### 5.2 Nouvelle API P1 — `POST /api/admin/incidents/promote-heuristic`

**Auth :** `adminMiddleware`

#### Request body

```typescript
const promoteHeuristicBodySchema = z.object({
  relatedTripId: z.string().trim().min(1),
  heuristicKind: z.enum([
    "near_departure",
    "no_passengers",
    "unknown_readiness",
    "no_boarding_activity",
    "full_not_boarded",
    "boarding_late",
  ]),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  description: z.string().trim().max(500).optional(),
});
```

#### Mapping `heuristicKind`

| Kind | `type` | `severity` default | `title` auto |
|------|--------|-------------------|--------------|
| `full_not_boarded` | CAPACITY | HIGH | Trajet plein — passagers non embarqués |
| `no_boarding_activity` | CAPACITY | HIGH | Aucune activité boarding |
| `boarding_late` | DELAY | MEDIUM | Embarquement en retard |
| `unknown_readiness` | TECHNICAL | MEDIUM | Occupancy indisponible |
| `near_departure` | DELAY | LOW | Départ imminent |
| `no_passengers` | OTHER | LOW | Aucun passager |

#### Dedup (décision design — 409)

```typescript
const existing = await prisma.incident.findFirst({
  where: {
    relatedTripId,
    status: { in: ["OPEN", "IN_PROGRESS"] },
    source: "DEPARTURE_HEURISTIC",
    sourceRef: { path: ["heuristicId"], equals: heuristicKind },
  },
});
if (existing) throw AppError(409, "INCIDENT_DUPLICATE", { existingIncidentId: existing.id });
```

#### Response

- **201** : incident créé · `source=DEPARTURE_HEURISTIC`
- **409** : `{ code: "INCIDENT_DUPLICATE", existingIncidentId, code: "INC-00xx" }`

---

### 5.3 APIs admin existantes — évolutions

#### `GET /api/admin/incidents`

**Query params ajoutés :**

| Param | Type | Description |
|-------|------|-------------|
| `source` | `IncidentSource` | Filtre source |
| `relatedTripId` | string | Filtre par trajet |

#### `POST /api/admin/incidents`

**Body étendu (backward compatible) :**

```typescript
// Champs ajoutés — tous optionnels sauf règles métier
source?: IncidentSource          // default MANUAL
sourceRef?: SourceRef
occurredAt?: ISO8601
assignedToUserId?: string
```

**Règle :** `relatedTripId` requis si `type !== TECHNICAL` OU `source !== MONITORING` (affiner en implémentation).

#### `PATCH /api/admin/incidents/:id`

**Changements :**

```typescript
// Si body.status === "RESOLVED" :
//   - body.resolution requis (min 10 chars)
//   - resolvedByUserId = req.user.id
//   - closedReason optionnel

// Si body.status === "CLOSED" via PATCH (alternative DELETE) :
//   - closedReason recommandé
```

**Erreur nouvelle :** `400 RESOLUTION_REQUIRED`

#### `DELETE /api/admin/incidents/:id`

Inchangé fonctionnellement · option : set `closedReason=FIXED` par défaut.

#### Serializer `serializeAdminIncident`

Ajouter champs : `source`, `sourceRef`, `occurredAt`, `closedReason`, `assignedToUserId`, `resolvedByUserId`.

---

### 5.4 Extension boarding consume/validate (recommandée)

**Ajout aux réponses échec** (quand JWT vérifié + reservation chargée) :

```json
{
  "valid": false,
  "reason": "PAYMENT_NOT_SUCCEEDED",
  "ui": { ... },
  "context": {
    "reservationId": "cuid",
    "tripId": "cuid"
  }
}
```

**Frontend OPS-02C** utilise `context` pour préremplir `field-incidents` sans re-envoyer JWT.

---

### 5.5 Activity feed — évolutions

#### Événements incidents (cible)

| Event `type` | Déclencheur | Severity |
|--------------|-------------|----------|
| `INCIDENT_CREATED` | `incident.createdAt` | mapDbSeverityToFeed |
| `INCIDENT_RESOLVED` | `incident.resolvedAt` | critical si CRITICAL else info |
| `INCIDENT_CLOSED` | **Nouveau** — `status→CLOSED` · `updatedAt` | info |
| `INCIDENT_SUGGESTED` | **Optionnel** — audit actions liste §5.5.1 | warning/critical |

#### 5.5.1 Actions audit → suggestion (P2)

```typescript
const SUGGEST_INCIDENT_ACTIONS = [
  "BOARDING_CONSUMPTION_ERROR",
  "PAYMENT_REJECTED_PENDING_EXPIRED",
  "PAYMENT_REJECTED", // si metadata capacité
] as const;
```

Événement feed :

```json
{
  "type": "INCIDENT_SUGGESTED",
  "title": "Créer incident paiement",
  "entityType": "AuditLog",
  "entityId": "..."
}
```

Pas de création silencieuse.

#### Correction acteur `INCIDENT_RESOLVED`

Utiliser `resolvedByUserId` + relation `resolver` au lieu de `createdBy`.

---

## 6. Frontend impacts

### 6.1 Boarding (`/boarding`)

| Fichier | Impact |
|---------|--------|
| `pages/BoardingPage.tsx` | État `lastFailureContext` · handler signalement · mutation field-incidents |
| `features/boarding/components/BoardingScanFeedback.tsx` ou overlay rejected | Bouton « Signaler un problème » |
| `api/admin-boarding.api.ts` ou **nouveau** `api/field-incidents.api.ts` | `createFieldIncident()` |
| `types/boarding.types.ts` | `context?` sur failure responses |
| `types/incidents.types.ts` | Types étendus |
| `features/boarding/utils/boarding-error-messages.ts` | Inchangé |

**UX :**

```text
Phase rejected (scan échoué)
  ├── Message S2-T5 existant
  ├── [Réessayer] [Signaler un problème]
  └── Modal : description optionnelle + confirm si CRITICAL
      → POST field-incidents
      → Toast "Incident INC-XXXX créé"
```

**Signalement libre (hors scan) :** bouton secondaire page boarding · sélection `relatedTripId` (dropdown trajets du jour — fetch admin trips ou saisie ID MVP).

**Exclusions UI :** pas de bouton si `BOARDING_ALREADY_USED` · pas de signalement si phase `network-error-*` (API injoignable).

### 6.2 Departures (`/departures`)

| Fichier | Impact |
|---------|--------|
| `features/departures/components/DepartureProgressCard.tsx` | Bouton « Promouvoir » sur badges `warning` (pas `info`) |
| `features/departures/utils/departure-board.ts` | Exposer `heuristicKind` dans `DepartureIncident` type |
| `api/admin-incidents.api.ts` | `promoteHeuristicIncident()` |
| `types/departures.types.ts` | `kind: string` sur `DepartureIncident` |

**Comportement promote :** mutation → toast succès ou message doublon 409 avec lien incident existant.

**Lien « Signaler incident »** existant : conservé pour création manuelle admin.

### 6.3 Incidents (`/incidents`)

| Fichier | Impact |
|---------|--------|
| `features/incidents/components/IncidentCreateForm.tsx` | Champ `relatedReservationId` · `occurredAt` optionnel |
| `features/incidents/components/IncidentsList.tsx` | Badge `source` · affichage `sourceRef.boardingReason` |
| `features/incidents/constants/incident-labels.ts` | Labels types/sources/closedReason |
| `features/incidents/components/IncidentFilters.tsx` | Filtre `source` · types étendus |
| `features/incidents/hooks/useIncidents.ts` | Resolve avec `resolution` obligatoire · modal résolution |
| `types/incidents.types.ts` | Enums étendus · `PatchAdminIncidentBody.resolution` required on resolve |

### 6.4 Dashboard (`/`)

| Fichier | Impact |
|---------|--------|
| `features/dashboard/utils/dashboard-kpis.ts` | Optionnel : `fieldIncidentsToday`, `criticalOpen` |
| `features/dashboard/utils/dashboard-attention.ts` | Inchangé logique · bénéficie nouveaux incidents |
| `features/dashboard/components/DashboardDispatchSummary.tsx` | Afficher source si critique chauffeur |
| `features/incidents/hooks/useOpenIncidentCount.ts` | Inchangé (déjà OPEN+IN_PROGRESS) |

**KPIs cibles post-OPS-02 :**

| KPI | Calcul |
|-----|--------|
| `openIncidents` | Existant |
| `criticalOpen` | Existant `isCriticalOpen` |
| `fieldReportsToday` | `source=BOARDING_FIELD` + `createdAt` today |
| `heuristicPromotedToday` | `source=DEPARTURE_HEURISTIC` + today |

### 6.5 Activity (`/dispatch`, `/activity`)

| Fichier | Impact |
|---------|--------|
| `features/activity/components/ActivityFeedCard.tsx` | Rendu `INCIDENT_SUGGESTED` · CTA créer |
| `features/activity/utils/format-activity-event.ts` | Labels nouveaux types |
| `api/admin-activity.api.ts` | Inchangé endpoint |

### 6.6 Monitoring (`/monitoring`)

| Fichier | Impact |
|---------|--------|
| `pages/MonitoringPage.tsx` | Inchangé lien incident système |
| `features/monitoring/constants/ops-runbooks.ts` | Ajouter entrée `ops-incident-management.md` (doc OPS-02C) |

### 6.7 Query invalidation (TanStack)

Après `field-incidents` (côté admin sur boarding) :

```typescript
invalidate: queryKeys.incidents.all, queryKeys.activity.feed, dispatch feed
event: sharinggo:incidents-updated  // sidebar badge
```

---

## 7. Migration strategy

### 7.1 Nom & ordre

```text
prisma/migrations/YYYYMMDDHHMMSS_ops02_incident_fields/
```

**Pré-requis CDC :** backup DB REC avant application · pas de migration destructive.

### 7.2 SQL proposé (ordre d'exécution)

```sql
-- 1. Nouveaux enums
CREATE TYPE "IncidentSource" AS ENUM (
  'MANUAL', 'BOARDING_FIELD', 'DEPARTURE_HEURISTIC',
  'MONITORING', 'ACTIVITY_SUGGESTION'
);

CREATE TYPE "IncidentClosedReason" AS ENUM (
  'FIXED', 'FALSE_ALARM', 'DUPLICATE', 'WONT_FIX'
);

-- 2. Étendre IncidentType (une commande par valeur)
ALTER TYPE "IncidentType" ADD VALUE IF NOT EXISTS 'BOARDING';
ALTER TYPE "IncidentType" ADD VALUE IF NOT EXISTS 'CAPACITY';
ALTER TYPE "IncidentType" ADD VALUE IF NOT EXISTS 'PAYMENT';
ALTER TYPE "IncidentType" ADD VALUE IF NOT EXISTS 'NO_SHOW';
ALTER TYPE "IncidentType" ADD VALUE IF NOT EXISTS 'SAFETY';

-- 3. Colonnes Incident
ALTER TABLE "Incident" ADD COLUMN "source" "IncidentSource" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "Incident" ADD COLUMN "sourceRef" JSONB;
ALTER TABLE "Incident" ADD COLUMN "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Incident" ADD COLUMN "closedReason" "IncidentClosedReason";
ALTER TABLE "Incident" ADD COLUMN "assigned_to_user_id" TEXT;
ALTER TABLE "Incident" ADD COLUMN "resolved_by_user_id" TEXT;

-- 4. Backfill occurredAt
UPDATE "Incident" SET "occurredAt" = "createdAt" WHERE "occurredAt" IS NULL;

-- 5. FKs optionnelles
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assigned_to_user_id_fkey"
  FOREIGN KEY ("assigned_to_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_resolved_by_user_id_fkey"
  FOREIGN KEY ("resolved_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Index
CREATE INDEX "Incident_source_idx" ON "Incident"("source");
CREATE INDEX "Incident_severity_idx" ON "Incident"("severity");
CREATE INDEX "Incident_status_severity_idx" ON "Incident"("status", "severity");
CREATE INDEX "Incident_related_trip_id_status_idx" ON "Incident"("related_trip_id", "status");
CREATE INDEX "Incident_assigned_to_user_id_idx" ON "Incident"("assigned_to_user_id");
```

### 7.3 Stratégie déploiement

| Env | Ordre |
|-----|-------|
| DEV | Migration → backend OPS-02B → tests scripts → frontend OPS-02C |
| REC | Backup → migration → deploy backend → deploy frontend |
| PREPROD | Idem · validation QA OPS-02 |
| PROD | Fenêtre hors pointe · rollback = commit précédent + migration inverse si nécessaire |

### 7.4 Rollback

| Niveau | Action |
|--------|--------|
| App seule | Redéployer build N-1 — nouvelles colonnes ignorées par ancien code si nullable/default |
| Migration | Script inverse : DROP colonnes · **ne pas** retirer valeurs enum PostgreSQL (irréversible sans recréation type) |

**Risque enum :** les valeurs `IncidentType` ajoutées **ne peuvent pas** être retirées facilement — valider liste avant PROD.

### 7.5 `generateNextIncidentCode`

Inchangé — tri `code desc` · format `INC-XXXX` · pas de collision avec import legacy.

---

## 8. Risks

### 8.1 Risques migration

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| `ALTER TYPE` échoue en transaction multi-valeurs | Moyenne | Bloquant deploy | Une valeur par migration / `IF NOT EXISTS` PG13+ |
| Enum Prisma/client désync | Faible | Build fail | `prisma generate` CI obligatoire |
| JSON `sourceRef` volumineux | Faible | DB bloat | Limite 1 KB Zod |
| Backfill `occurredAt` incorrect | Faible | KPI faux | Copie `createdAt` one-shot |

### 8.2 Risques RBAC

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| DRIVER accède admin via route oubliée | Faible | Critique | Tests S2-T7 pattern · review sécurité |
| IDOR tripId/reservationId | Moyenne | Fuite info | Validation existence serveur |
| JWT stocké dans `sourceRef` | Faible | Critique | Zod denylist + review |
| Chauffeur spam incidents | Faible | Bruit ops | Rate limit · dedup requestId optionnel |

### 8.3 Risques exploitation

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Bruit heuristiques promote | Moyenne | Fatigue ops | Dedup 409 · severity LOW pour info kinds |
| Incidents sans tripId terrain | Moyenne | Triage lent | relatedTripId requis field-incidents |
| Doublon téléphone + app | Élevée | Données redondantes | Process ops · dedup manuel CLOSED DUPLICATE |
| `resolution` vide historique | N/A | N/A | Règle forward-only sur nouveaux RESOLVED |

### 8.4 Risques pilote

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Perte réseau — signalement impossible | Élevée | Gap terrain | Runbook radio · pas de fausse promesse offline |
| Consume failure sans context IDs | Moyenne | UX signalement | Extension `context` §5.4 |
| Ops ne consulte pas `/incidents` | Moyenne | Feature inutile | Dashboard attention + badge sidebar |
| Pilote sans DRIVER compte seed | Faible | Tests bloqués | Seed DRIVER · script QA OPS-02 |

### 8.5 Risques frontend

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Types TS désync backend enums | Moyenne | Build fail | OpenAPI regen · types partagés |
| Invalidation cache incomplète | Moyenne | Stale badge | invalidate incidents + custom event |
| Modal signalement ralentit boarding | Faible | UX terrain | Modal léger · optional description |

---

## 9. Build plan OPS-02C

> OPS-02B livre backend + migration + tests API.  
> OPS-02C livre UI/workflows · dépendance stricte REC backend déployé.

### 9.1 Séquence recommandée

```text
OPS-02B-1  Migration Prisma + prisma generate
OPS-02B-2  Schemas Zod + serializers étendus
OPS-02B-3  field-incidents service + route + tests DRIVER
OPS-02B-4  promote-heuristic service + route + dedup
OPS-02B-5  PATCH resolution required + resolvedByUserId
OPS-02B-6  Activity feed INCIDENT_CLOSED + resolver fix
OPS-02B-7  Extension boarding failure context (optionnel même sprint)
OPS-02B-8  OpenAPI + script QA ops02b-field-incidents-test.mjs
     ↓ gate VERIFY backend
OPS-02C-1  types/incidents.types.ts + incident-labels
OPS-02C-2  api/field-incidents.api.ts + promote API
OPS-02C-3  BoardingPage signalement + modal
OPS-02C-4  IncidentCreateForm + resolve modal resolution
OPS-02C-5  DepartureProgressCard promote
OPS-02C-6  Dashboard KPIs optionnels
OPS-02C-7  Activity feed CTA suggestion (si O8 livré)
OPS-02C-8  docs/features/OPS-02-incident-management.md + runbook
     ↓ QA OPS-02 (pilote 1 journée)
```

### 9.2 Estimation

| Ticket | Effort | Dépendances |
|--------|--------|-------------|
| OPS-02B | 3–5 j dev backend | PRD + ce design approuvés |
| OPS-02C | 3–4 j dev frontend | OPS-02B sur REC |
| QA OPS-02 | 1 j ops + scripts | OPS-02C |

### 9.3 Tests obligatoires OPS-02B (avant OPS-02C)

| Test | Description |
|------|-------------|
| `field-incidents` DRIVER 201 | Création avec boardingContext |
| `field-incidents` CONVOYEUR 403 | — |
| `field-incidents` trip invalide 404 | — |
| `promote-heuristic` dedup 409 | Double promote même kind |
| `PATCH RESOLVED` sans resolution 400 | — |
| Migration up/down DEV | Smoke |
| Security review | `@reviewer-securite-code` APPROVE |

### 9.4 Tests obligatoires OPS-02C

| Test | Description |
|------|-------------|
| Boarding rejected → signalement → incident visible /incidents | E2E manuel |
| Promote full_not_boarded | E2E manuel |
| Resolve avec resolution | UI + API |
| Sidebar badge refresh | UI |
| `npm run lint` + `npm run build` | CI |

### 9.5 Definition of Done (feature OPS-02 complète)

- [ ] Critères PRD §12 B1–C10 PASS
- [ ] Security review APPROVE
- [ ] Runbook ops publié
- [ ] PRD status → VERIFY puis DONE
- [ ] Pas de régression F3-T9 incidents admin
- [ ] Gate CTO : pilote ops autonome chauffeur **GO**

---

## 10. Acceptance criteria — design review

| Critère ticket OPS-02B design | Statut |
|-------------------------------|--------|
| Modèle Incident cible défini | ✅ §3 |
| RBAC défini | ✅ §4 |
| API `field-incidents` définie (payload, validation, réponses, erreurs) | ✅ §5.1 |
| API `promote-heuristic` définie | ✅ §5.2 |
| Compatibilité API admin documentée | ✅ §5.3 |
| Activity feed impacts définis | ✅ §5.5 |
| Dashboard KPIs identifiés | ✅ §6.4 |
| Impacts frontend identifiés (5 écrans) | ✅ §6 |
| Stratégie migration proposée | ✅ §7 |
| Risques documentés | ✅ §8 |
| Plan build OPS-02C validable | ✅ §9 |

---

## 11. Décisions finales (gate BUILD — CTO 2026-06-20)

| # | Question | Décision finale | Implémentation OPS-02B |
|---|----------|-----------------|------------------------|
| D1 | Extension `context` sur échec boarding — OPS-02B ou OPS-02C ? | **OPS-02B** (CTO) | `boarding.consumption` / `boarding.validation` — champ `context?` non-breaking |
| D2 | Dedup promote : 409 vs PATCH merge | **409** `INCIDENT_DUPLICATE` | `promoteHeuristicIncident` — `findFirst` OPEN/IN_PROGRESS + même `heuristicId` |
| D3 | `relatedTripId` requis sur `TECHNICAL` monitoring global | **Non requis** si `source=MONITORING` | Pas de règle stricte ajoutée (comportement design conservé) |
| D4 | Chauffeur voit liste ses incidents | **Non MVP** | Aucune route DRIVER de lecture incidents |
| D5 | `assignedToUserId` UI en OPS-02C | **Non** — colonne + PATCH admin seulement | Colonne Prisma + filtre PATCH ; pas d'UI |

### 11.1 Livrables BUILD (backend)

| Livrable | Chemin / route |
|----------|----------------|
| Migration | `backend/prisma/migrations/20260620112340_ops02_incident_fields/` |
| Field incidents | `POST /api/boarding/field-incidents` — DRIVER, ADMIN, SUPER_ADMIN |
| Promote heuristic | `POST /api/admin/incidents/promote-heuristic` |
| Admin étendu | `GET` filtres `source`, `relatedTripId` · `PATCH` `resolution` obligatoire · `DELETE` → CLOSED+FIXED |
| Activity feed | `INCIDENT_CREATED`, `INCIDENT_RESOLVED`, `INCIDENT_CLOSED`, `INCIDENT_SUGGESTED` (P2) |
| Tests intégration | `backend/scripts/ops02b-field-incidents-test.mjs` |

### 11.3 Risques sécurité — post-review (2026-06-20)

| ID | Risque | Décision |
|----|--------|----------|
| **P1-1** | IDOR opérationnel : DRIVER peut créer un incident sur tout `relatedTripId` valide (sans lien chauffeur↔trajet) | **Risque accepté MVP** — ligne unique Châlons↔Vatry, un chauffeur terrain ; pas de binding trip en OPS-02B ; hardening reporté V1.x multi-chauffeurs |
| **P1-2** | `boardingReason` libre dans `sourceRef` | **Corrigé** — `consumeReason` / `validateReason` validés contre `FIELD_INCIDENT_BOARDING_REASONS` (enum fermé S2-T2/T3, hors `BOARDING_ALREADY_USED`) ; reason inconnue → **400 `VALIDATION_ERROR`** (refus Zod, pas de fallback silencieux) |

### 11.2 Vérification locale (2026-06-20)

- `npm run lint` (backend) — OK  
- `npm run build` (backend) — OK  
- `node backend/scripts/ops02b-field-incidents-test.mjs` — OK (BASE_URL dev, `RATE_LIMIT_AUTH_MAX` élevé si runs répétés)  
- Migration appliquée localement — OK  
- **Aucun fichier frontend modifié**  
- **Aucun commit** (gate CTO)


---

## 12. Références fichiers actuels

| Zone | Chemins |
|------|---------|
| Prisma | `backend/prisma/schema.prisma` |
| Migration initiale | `backend/prisma/migrations/20260525071148_add_incidents_model/` |
| Admin incidents | `backend/src/modules/admin/admin-incidents.*` |
| Admin routes | `backend/src/modules/admin/admin.routes.ts` |
| Activity feed | `backend/src/modules/admin/admin-activity-feed.service.ts` |
| Boarding routes | `backend/src/modules/boarding/boarding.routes.ts` |
| Boarding types | `backend/src/modules/boarding/boarding.consumption.types.ts` |
| Frontend incidents | `frontend/src/features/incidents/**` |
| Frontend boarding | `frontend/src/pages/BoardingPage.tsx` |
| Departures | `frontend/src/features/departures/utils/departure-board.ts` |
| Dashboard | `frontend/src/features/dashboard/**` |

---

## 13. Prochaine gate BMAD

```text
OPS-02B Design Review (ce document)
        ↓ validation Tech Lead + Architectes
OPS-02B BUILD (migration + API)
        ↓ VERIFY backend
OPS-02C BUILD (UI)
        ↓ QA OPS-02
OPS-02 DONE
        ↓
OPS-03 Lifecycle départs (après stabilisation)
```

---

*Document design + trace BUILD backend OPS-02B (2026-06-20). UI = OPS-02C.*
