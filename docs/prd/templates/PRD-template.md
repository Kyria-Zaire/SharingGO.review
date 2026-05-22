# PRD-XXX — [FEATURE NAME]

Status: DISCOVER / DESIGN / BUILD / VERIFY / DONE / BLOCKED  
Owner: [NAME]  
Last updated: [DATE]  
Version: v1.0

> Source de vérité **par feature**. Méthodologie d'exécution : [`docs/methodology/BMAD.md`](../../methodology/BMAD.md).  
> Contexte produit global : [`docs/CAHIER_DES_CHARGES.md`](../../CAHIER_DES_CHARGES.md).

---

# 1. Executive Summary

Short description of the feature.

Explain:

- what problem it solves
- who uses it
- why it matters
- expected business impact

---

# 2. Product Goals

## Primary goals

- Goal 1
- Goal 2
- Goal 3

## Non-goals

Explicitly define what is OUT OF SCOPE.

Example:

- No mobile app push notifications in V1
- No offline sync
- No multi-company support

---

# 3. User Stories

## Story 1

As a [user],  
I want [action],  
So that [benefit].

### Acceptance Criteria

- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

---

# 4. Functional Requirements

## FR-1 [Requirement name]

Description.

### Rules

- Rule 1
- Rule 2
- Rule 3

### Edge cases

- Edge case 1
- Edge case 2

---

# 5. UX Requirements

## Screens involved

- Screen A
- Screen B
- Screen C

## UX principles

- mobile first
- minimal friction
- explicit loading states
- explicit error states
- avoid hidden actions

## Design references

- BlaBlaCar (structure trajet)
- Stripe Checkout
- `DESIGN.md` à la racine (noir + vert, sobre — **imposé**)

---

# 6. Technical Design

## Architecture impact

Services/modules affected:

- auth
- reservations
- payments
- (autres modules : voir `architecte-api`)

## API endpoints

### POST /api/reservations/pending

**Purpose:** Create pending reservation.

**Auth:** Required.

**Request body:**

```json
{
  "tripId": "uuid"
}
```

**Response:**

```json
{
  "data": {
    "reservationId": "uuid",
    "expiresAt": "timestamp"
  }
}
```

**Errors:** `TRIP_FULL`, `VALIDATION_ERROR`, `UNAUTHORIZED`

---

# 7. Database Impact

## Tables affected

- reservations
- pending_reservations
- payments

## Migration required

YES / NO

## Data integrity constraints

- seat count must never exceed capacity (8)
- reservation expiration enforced server-side (2 min)
- soft delete via `deleted_at` where applicable

---

# 8. Security Review

## Risks

- race conditions
- payment fraud
- replay attacks
- privilege escalation
- IDOR

## Mitigations

- PostgreSQL transaction lock (`FOR UPDATE`)
- Stripe webhook verification (`constructEvent`) + `webhook_events`
- role middleware
- Zod validation
- Turnstile / rate limit per `docs/security/` baseline

**Reviewer:** `@reviewer-securite-code` → APPROVE / BLOCK

---

# 9. Performance Considerations

Expected scale:

- users/day
- reservations/day
- concurrent bookings

Potential bottlenecks:

- DB locking
- webhook bursts

---

# 10. Observability

Logs required:

- reservation created
- payment confirmed
- payment failed
- QR validation failed

Metrics:

- booking success rate
- payment conversion
- occupancy rate

---

# 11. Testing Strategy

## Unit tests

- business logic
- validators

## Integration tests

- Stripe webhook
- reservation locking

## E2E tests

- full reservation flow

---

# 12. Deployment Impact

Environment affected:

- DEV
- REC
- PREPROD
- PROD

Rollback strategy:  
Describe rollback plan (commit hash in `deployments` table).

---

# 13. Definition of Done (DoD)

Feature is DONE only if:

- [ ] Functional requirements implemented
- [ ] Edge cases handled
- [ ] TypeScript strict passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Security review approved (APPROVE)
- [ ] Mobile responsive
- [ ] Logs added
- [ ] Documentation updated
- [ ] PR reviewed
- [ ] PRD status → DONE

---

# 14. Open Questions

- Question 1
- Question 2

---

# 15. Changelog

## v1.0

Initial PRD.
