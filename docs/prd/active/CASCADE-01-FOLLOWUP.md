# PRD — CASCADE-01-FOLLOWUP · Findings déférés (a11y + polish front refund)

**Status :** DISCOVER (stub — findings traçables)
**Owner :** CTO / Engineering
**Last updated :** 2026-07-12
**Version :** v0.1
**Phase BMAD :** DISCOVER
**Prérequis :** CASCADE-01 mergé (PR #6)

> Origine : revue CodeRabbit sur [PR #6](https://github.com/Kyria-Zaire/SharingGO.review/pull/6) (CASCADE-01).
> Ticket source : `docs/superpowers/specs/2026-07-09-cascade-01-design.md`.
> Décision CTO (2026-07-12) : findings non bloquants déférés hors du merge CASCADE-01. **#3 et #5 (a11y du modal de confirmation) prioritaires** — de vrais boutons de remboursement d'argent réel sont derrière.

---

## 1. Contexte

CASCADE-01 (cascade d'annulation + remboursement/avoir) a été livrée et mergée. La revue automatique CodeRabbit a remonté un finding Major de concurrence (corrigé avant merge, commit `f5873a4`) et **6 findings non bloquants**, regroupés ici pour ne pas les perdre. Aucun n'affecte la sécurité argent réel (garanties testées : idempotency key, commits conditionnels, sérialisation des deux TOCTOU refund + cancel). Ce sont de l'accessibilité et du polish.

## 2. Findings — Priorité 1 (a11y, avant le reste)

Le modal de confirmation et les boutons de la file portent des actions monétaires (Rembourser / Créditer). Leur accessibilité clavier/lecteur d'écran est prioritaire.

### P1-a — Modal de confirmation : Escape + focus trap
**Fichier :** `frontend/src/features/reservations/components/RefundActionModal.tsx:148`
Le modal a `role="dialog"` + `aria-modal="true"` mais **pas** de fermeture par Escape, pas de piège de focus, pas de focus initial. Un utilisateur clavier ne peut pas fermer le modal ; Tab s'échappe vers les éléments d'arrière-plan derrière l'overlay.
**Fix attendu :** handler Escape → `onClose` ; focus trap dans le modal ; focus initial sur le bouton d'action (ou Annuler) ; restaurer le focus à la fermeture.

### P1-b — Boutons d'action répétés : noms accessibles distincts
**Fichier :** `frontend/src/features/reservations/components/RefundQueueTable.tsx:80`
Chaque ligne rend une paire « Rembourser »/« Créditer » avec des noms accessibles **identiques**. Un lecteur d'écran naviguant par type de contrôle ne peut pas distinguer sur quelle réservation chaque bouton agit.
**Fix attendu :** `aria-label` distinctif par ligne (ex. « Rembourser la réservation de {passager} — {trajet} »).

## 3. Findings — Priorité 2 (polish, non bloquant)

### P2-a — Timer de toast non annulé entre actions
**Fichier :** `frontend/src/features/reservations/hooks/useRefundQueueActions.ts:31`
`showToast` planifie un `setTimeout` sans annuler le précédent. Deux actions confirmées à moins de `TOAST_DURATION_MS` d'intervalle → le 1ᵉʳ timeout efface prématurément le 2ᵉ toast (encore frais).
**Fix attendu :** conserver le handle du timeout et le `clearTimeout` avant d'en planifier un nouveau.

### P2-b — File de remboursement plafonnée à 100 sans pagination ni signal
**Fichier :** `frontend/src/pages/RefundQueuePage.tsx:25`
Si les remboursements `PENDING` dépassent `limit: 100`, le reste est silencieusement exclu — aucun contrôle page suivante, aucune indication à l'admin qu'il en existe davantage.
**Fix attendu :** pagination ou, a minima, un signal d'overflow (« 100+ en attente »). *Note : à l'échelle pilote (8 places/trajet), la file `PENDING` n'atteindra pas 100 — d'où la priorité basse.*

### P2-c — Format de référence paiement divergent (liste vs modal)
**Fichiers :** `frontend/src/pages/RefundQueuePage.tsx:98` vs `RefundQueueTable.tsx` (`paidLabel`)
Le modal rend `#{id} · payé le {date}` ; la table rend `{date} · #{id}`. Même donnée, deux présentations entre la ligne de liste et le modal de confirmation.
**Fix attendu :** un helper de formatage partagé, une seule présentation.

### P2-d — Finding sur le stub doc NOTIFY-01
**Fichier :** `docs/prd/active/NOTIFY-01-email-notifications.md:46`
CodeRabbit a analysé une affirmation du stub NOTIFY-01 (point d'accroche du hook d'annulation / best-effort). **Aucun code** — c'est un doc de cadrage pour un ticket futur. À revoir lors du DISCOVER de NOTIFY-01, pas ici.

## 4. Definition of Done

- [ ] P1-a : modal Escape + focus trap + focus initial + restauration
- [ ] P1-b : `aria-label` distinctifs sur les boutons de la file
- [ ] P2-a : timer de toast annulé entre actions
- [ ] P2-b : pagination ou signal d'overflow sur la file
- [ ] P2-c : format de référence paiement unifié (helper partagé)
- [ ] P2-d : affirmation NOTIFY-01 revue (ou versée dans le DISCOVER de NOTIFY-01)

---

> **Note :** aucune infra de test front n'existe encore (cf. CASCADE-01 §10 — le socle de test est backend uniquement). Un test des comportements front (focus trap, toast, pagination) supposerait de poser Vitest + Testing Library côté front — à arbitrer si ce ticket est priorisé.
