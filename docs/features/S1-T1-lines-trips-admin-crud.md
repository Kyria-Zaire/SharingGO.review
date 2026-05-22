# S1-T1 — Admin CRUD Lignes & Trajets

Ticket : premier socle métier transport (backend admin uniquement). Aucune réservation, disponibilité, ni frontend.

## Objectif

Permettre à **ADMIN** et **SUPER_ADMIN** de gérer les lignes et les trajets planifiés via API REST protégée.

## Sécurité

Toutes les routes sous `/api/admin/*` exigent :

1. `requireAuth` (cookie session S0-T4)
2. `requireRole(ADMIN, SUPER_ADMIN)`

Un **CONVOYEUR** reçoit **403**. Sans cookie : **401**.

## Routes Lines (`/api/admin/lines`)

| Méthode | Route | Action |
|---------|-------|--------|
| POST | `/` | Créer une ligne |
| GET | `/` | Lister (tri `createdAt` desc) |
| GET | `/:id` | Détail |
| PATCH | `/:id` | Mise à jour partielle |

Champs : `name`, `startCity`, `endCity` (trim, min 1, max 200).

## Routes Trips (`/api/admin/trips`)

| Méthode | Route | Action |
|---------|-------|--------|
| POST | `/` | Créer un trajet |
| GET | `/` | Lister avec filtres |
| GET | `/:id` | Détail (+ `line`, `driver` minimal) |
| PATCH | `/:id` | Mise à jour partielle |
| POST | `/:id/disable` | Soft delete (`deletedAt = now()`) |
| POST | `/:id/enable` | Réactiver (`deletedAt = null`) |

### Query GET list trips

| Param | Description |
|-------|-------------|
| `lineId` | Filtrer par ligne |
| `from` | ISO datetime — `departureTime >= from` |
| `to` | ISO datetime — `departureTime <= to` |
| `includeDisabled` | `true` pour inclure trajets désactivés |

Par défaut : `deletedAt IS NULL`, tri `departureTime` asc.

## Règles métier V1

- `totalSeats` : entier **1–8** (défaut 8)
- `arrivalTime` optionnel ; si présent **strictement après** `departureTime`
- `lineId` et `driverId` (si fourni) doivent exister
- Désactivation via `deletedAt` (pas de suppression physique)
- Aucune réservation ni calcul de places restantes

## Validation Zod

Erreurs → **400** `VALIDATION_ERROR` (format JSON standard backend).

Codes métier : `LINE_NOT_FOUND`, `TRIP_NOT_FOUND`, `DRIVER_NOT_FOUND`, `INVALID_TRIP_TIME`, `INVALID_TOTAL_SEATS`.

## Audit logs (`AuditLog`)

Actions : `LINE_CREATED`, `LINE_UPDATED`, `TRIP_CREATED`, `TRIP_UPDATED`, `TRIP_DISABLED`, `TRIP_ENABLED`.

**Décision CTO** : si l’écriture audit échoue → `logger.warn`, la requête métier **réussit quand même**.

## Hors scope

Frontend, réservation, paiement, Stripe, QR, OAuth, génération auto 8 trajets/jour, routes publiques.

## Exemples curl

```bash
# Login admin (après promotion userType ADMIN en DB ou register + promote)
curl.exe -c cookies.txt -H "Content-Type: application/json" \
  --data-binary "@login.json" http://localhost:3000/api/auth/login

# Créer une ligne
curl.exe -b cookies.txt -H "Content-Type: application/json" \
  -d "{\"name\":\"Chalons-Paris-Vatry\",\"startCity\":\"Chalons-en-Champagne\",\"endCity\":\"Paris-Vatry\"}" \
  http://localhost:3000/api/admin/lines

# Créer un trajet
curl.exe -b cookies.txt -H "Content-Type: application/json" \
  -d "{\"lineId\":\"LINE_ID\",\"departureTime\":\"2026-06-01T08:00:00.000Z\",\"totalSeats\":8}" \
  http://localhost:3000/api/admin/trips

# Désactiver
curl.exe -b cookies.txt -X POST http://localhost:3000/api/admin/trips/TRIP_ID/disable
```

## Module

`backend/src/modules/transport/` + `backend/src/lib/audit-log.ts`, `backend/src/lib/zod-parse.ts`
