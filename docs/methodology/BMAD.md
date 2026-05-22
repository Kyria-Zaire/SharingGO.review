# BMAD Methodology — Sharing Go

**Version:** v1.0  
**Statut :** Framework d'exécution **obligatoire** (humains + IA).

BMAD = **BUILD → MEASURE → ANALYZE → DECIDE**

Complété par le cycle feature : **DISCOVER → DESIGN → BUILD → VERIFY → RELEASE**

---

## Documents liés

| Document | Rôle |
|----------|------|
| [`docs/CAHIER_DES_CHARGES.md`](../CAHIER_DES_CHARGES.md) | Produit global V1 |
| [`docs/prd/templates/PRD-template.md`](../prd/templates/PRD-template.md) | Source de vérité **par feature** |
| [`docs/prd/active/`](../prd/active/) | PRD en cours |
| `PRODUCT.md` · `DESIGN.md` | Contexte agents / UI |
| `.cursor/rules/` · `.claude/*.md` | Règles engineering |

---

# 1. Philosophy

The goal is **NOT**:

- writing the most code
- shipping fastest blindly
- using trendy stacks

The goal **IS**:

- building stable systems
- avoiding technical debt
- reducing regressions
- ensuring scalability
- maintaining delivery speed over time

---

# 2. Global Workflow

Every feature follows:

```
DISCOVER → DESIGN → BUILD → VERIFY → RELEASE → MEASURE → ANALYZE → DECIDE
```

**No direct coding without understanding.**

PRD status must reflect the phase: `DISCOVER` / `DESIGN` / `BUILD` / `VERIFY` / `DONE` / `BLOCKED`.

---

# 3. Phase — DISCOVER

**Goal:** Understand the problem deeply before coding.

**Mandatory actions:**

- clarify business need
- identify users
- identify edge cases
- identify risks
- define scope
- define non-goals

**Deliverables:**

- PRD draft (from template)
- acceptance criteria
- technical risks

**Forbidden:**

- coding immediately
- choosing stack emotionally

---

# 4. Phase — DESIGN

**Goal:** Define clean architecture before implementation.

**Mandatory:**

- API design
- DB schema review
- security review
- UX flow
- state transitions
- rollback strategy

**Questions:**

- Can this scale?
- Can this fail safely?
- Is rollback possible?
- Is this observable?

**Deliverables:**

- architecture notes (`docs/architecture/`)
- migration plan
- endpoint plan
- sequence diagrams if needed

---

# 5. Phase — BUILD

**Goal:** Implement minimal clean solution.

**Rules:**

- small commits
- feature branches
- strict TypeScript
- no dead code
- no duplication
- no hidden side effects

**Mandatory:**

- validation (Zod)
- loading states
- error handling
- structured logs

**Forbidden:**

- massive rewrites
- bypassing type system
- skipping security checks

---

# 6. Phase — VERIFY

**Goal:** Validate correctness before merge.

**Mandatory checks:**

- lint
- typecheck
- tests
- security review (`reviewer-securite-code` → APPROVE)
- UX review (`DESIGN.md`)
- responsive review
- payment flow review
- migration review

**Critical rule:** A feature that "works on localhost" is **NOT** considered complete.

---

# 7. Phase — RELEASE

**Requirements:**

- changelog
- migration safety (backup before destructive)
- backup verification
- rollback plan
- environment validation (DEV / REC / PREPROD / PROD)

**Never deploy:**

- unreviewed migrations
- unverified payment flows
- untested auth changes

---

# 8. Phase — MEASURE

After release, measure reality.

**Track:**

- errors
- drop-offs
- payment failures
- booking conversion
- API latency
- occupancy rate

**No assumptions.**

---

# 9. Phase — ANALYZE

Analyze:

- what failed
- what slowed dev
- UX friction
- technical bottlenecks
- support issues

**Ask:**

- Should we simplify?
- Should we refactor?
- Should we remove this feature?

---

# 10. Phase — DECIDE

Possible decisions:

- keep
- improve
- rollback
- redesign
- remove

Every major decision → [`docs/decisions/`](../decisions/) (ADR).

---

# 11. Engineering Principles

## 11.1 Simplicity first

Prefer modular monolith over premature microservices.  
Prefer explicit code over magic abstractions.

## 11.2 Security first

Assume: frontend compromised · requests malicious · users abuse · bots exist.

Protect: auth · payments · reservations · admin routes.

## 11.3 Reliability first

Fail safely · recover safely · log critical events · avoid data corruption.

## 11.4 Product-first engineering

Engineering supports product goals. Avoid overengineering and vanity architecture.

---

# 12. AI Agent Rules

**AI must:**

- explain changes
- respect architecture
- avoid rewrites
- avoid duplication
- **follow active PRD**
- follow security baseline
- propose before refactoring

**AI must NEVER:**

- invent business logic outside PRD/CDC
- disable protections
- bypass reviews
- expose secrets
- create hidden side effects

---

# 13. Environment Strategy

| Env | Usage |
|-----|--------|
| DEV | Fast iteration |
| REC | Functional validation |
| PREPROD | Production simulation |
| PROD | Real users only |

No environment mixing. See `docs/infra/` and `.cursor/rules/environments.mdc`.

---

# 14. Incident Policy

If payments, auth, reservations, or webhooks break:

1. **STOP** deployment
2. Investigate
3. Rollback if needed
4. Write incident report (`docs/decisions/` or `docs/security/`)
5. Patch safely

Never "hotfix blindly" in production.

---

# 15. Merge Policy

A PR merges only if:

- **PRD exists** in `docs/prd/active/`
- **DoD passes** (PRD §13)
- **security review APPROVE**
- no critical bug
- architecture respected

---

# 16. Final Rule

**Clean systems scale. Spaghetti collapses.**

---

## Roadmap méthodologie (CTO)

Prochaines docs à produire **avant** bootstrap infra :

1. `docs/architecture/MONOREPO-ARCHITECTURE.md`
2. `docs/architecture/CODING-STANDARDS.md`
3. `docs/architecture/API-CONVENTIONS.md`
4. puis Docker / monorepo bootstrap
