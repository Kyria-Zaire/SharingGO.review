# PILOT Readiness — SharingGO

Date: 2026-06-20
Owner: Ops / CTO

## Checklist pre-pilote (bloquants)

- [ ] **Politique annulation trajet tranchee avant PILOT-01 (BLOQUANT).**
  En l'etat, `cancelTrip()` bloque le scan (OK) mais laisse les reservations `CONFIRMED` payees intactes.
  Aucun remboursement automatique, aucune notification passager.
  Decision obligatoire avant pilotes avec convoyeurs payants :
  - Option (a): annulation interdite en pratique pendant le pilote (on assume le trajet meme a perte), ou
  - Option (b): remboursement minimal + notification passager implementes avant le pilote.
  **Ne pas lancer PILOT-01 avec de vrais convoyeurs payants tant que ce point n'est pas tranche.**

- [ ] Migration lifecycle appliquee sur la bonne base (host -> `localhost:5432`, pas `postgres:5432`).
- [ ] Verification SQL des colonnes `Trip.lifecycleStatus`, `boardingStartedAt`, `departedAt`, `completedAt`, `cancelledAt`.
- [ ] Verification des transitions admin OPS-03B en environnement local.
- [ ] Verification du guard boarding lifecycle (WAITING/BOARDING/DEPARTED/COMPLETED/CANCELLED).

