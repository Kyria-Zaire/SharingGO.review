# DEPLOY-READY-01 — Hardening pré-déploiement passager

**Statut :** BUILD · **P0 COMPLETE** · **P1 en cours** · Phase **Release Engineering**  
**PRD :** [`docs/prd/active/DEPLOY-READY-01-passenger-deploy-readiness.md`](../prd/active/DEPLOY-READY-01-passenger-deploy-readiness.md)  
**Runbook :** [`docs/ops/DEPLOY-01-RUNBOOK.md`](../ops/DEPLOY-01-RUNBOOK.md)  
**Gate sortie :** [Definition of Production Ready](../ops/DEPLOY-01-RUNBOOK.md#17-definition-of-production-ready)

---

## Jalon officiel

```text
PASSENGER V1     ✅ FEATURE COMPLETE
QA               ✅ VALIDÉ
HARDENING        🟢 P0 COMPLETE · P1 BUILD
Phase            Release Engineering — Sprint P1
```

---

## 🔒 Feature Freeze (actif)

Aucune nouvelle fonctionnalité Passenger jusqu'à clôture DEPLOY-READY-01.

---

## KPI obligatoire (fin de chaque PR / sprint)

| KPI | Avant (baseline QA) | Après |
|-----|--------------------:|------:|
| WARN | 14 | *X* |
| WARN P0 | *à mesurer* | **0** |
| FAIL | 0 | **0** |
| Bundle JS | 844 kB | *XXX kB* |
| Routes mortes | 0 | **0** |
| Composants orphelins | 1 | **0** |
| Dépendances démo | ~30 fichiers | **0** |

---

## Ordre BUILD (validé CTO)

### Sprint P0 — ✅ COMPLETE (CTO 2026-06-23)

1. `/help` public ✅
2. Nettoyage mode démo ✅
3. Vérification liens ✅
4. **Branding Web** ✅
5. Meta description ✅
6. `robots.txt` ✅
7. Legal Review ✅ — [`DEPLOY-READY-P0-07-legal-review.md`](../audits/DEPLOY-READY-P0-07-legal-review.md)

### Sprint P1 — ▶ en cours

1. Suppression orphelins
2. Suppression imports / exports morts
3. Nettoyage hooks
4. TypeScript strict
5. Optimisation bundle
6. Lazy loading — **si encore nécessaire**

### P2 → BACKLOG POST-PILOT

---

## Definition of Production Ready (gate DEPLOY-01)

```text
✔ FAIL = 0          ✔ WARN P0 = 0       ✔ Aucun orphelin
✔ Aucun fichier démo ✔ Aucun secret repo ✔ Lint / Build OK
✔ QA PASS           ✔ Runbook complété  ✔ Smoke tests OK
```

---

## Documentation parallèle

Runbook DEPLOY-01 v0.2 — constitution pendant DEPLOY-READY-01 (Monitoring § 8 · Sécurité § 9).

---

## Roadmap

```text
▶ DEPLOY-READY-01 (P1 BUILD) → DEPLOY-01 → PILOT-01
→ DRIVER-WORKSPACE-01 → DRIVER-UX-01 → PILOT-02 → COMPANY → B2B
```

---

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
pnpm audit:links
pnpm generate:robots
```

Rapport clôture : `docs/audits/DEPLOY-READY-01-report.md`
