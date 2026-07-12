# PRD — NOTIFY-01 · Notifications email (best-effort)

**Status :** DISCOVER (stub — à prioriser)
**Owner :** CTO / Engineering
**Last updated :** 2026-07-09
**Version :** v0.1 (stub ouvert depuis CASCADE-01)
**Phase BMAD :** DISCOVER
**Prérequis :** aucun bloquant — issu de CASCADE-01 (email hors scope)

> Méthodologie : [`docs/methodology/BMAD.md`](../../methodology/BMAD.md)
> Origine : [`docs/superpowers/specs/2026-07-09-cascade-01-design.md`](../../superpowers/specs/2026-07-09-cascade-01-design.md) §6, §9

---

## 1. Contexte / Origine

CASCADE-01 (cascade d'annulation + remboursement) exige une **notification passager
in-app obligatoire** — livrée. Le CDC prévoyait aussi une **notification email
best-effort** au moment de l'annulation d'un trajet (§6.2 du spec CASCADE-01).

**Constat technique (audit CASCADE-01, 2026-07-09) :** aucun provider email n'existe
dans le stack. Vérifié : zéro dépendance email dans `backend/package.json`
(nodemailer / sendgrid / resend / mailgun / postmark / SES — toutes absentes) ;
tous les usages du mot `EMAIL` dans le code sont des **codes d'erreur métier**
(validation d'email utilisateur), aucun envoi.

**Décision CTO :** ne pas improviser d'intégration email ad hoc dans CASCADE-01.
Le sujet est isolé dans ce ticket NOTIFY-01 pour un traitement propre.

## 2. Objectif

Doter SharingGO d'une capacité d'envoi email **transactionnel** (best-effort,
non bloquant), et l'utiliser en premier lieu pour la notification d'annulation
de trajet.

## 3. Scope (à cadrer en DISCOVER → DESIGN)

**Inclus (proposé, à valider) :**
- Choix d'un provider email (critères : coût pilote, délivrabilité FR, simplicité
  d'intégration, pas de lock-in fort).
- Un service d'envoi backend abstrait (interface `EmailService`), config via env
  (clé API jamais en clair — règle sécurité projet).
- Premier cas d'usage : email d'annulation de trajet au passager, déclenché à
  l'étape cascade de `cancelTrip()`, **best-effort** — un échec d'envoi ne doit
  jamais faire échouer l'annulation (pattern analogue à `writeAuditLog` qui
  n'interrompt pas l'action métier).
- Template email annulation (sobre, charte SharingGO).

**Hors scope (à confirmer) :**
- Emails marketing / cycle de vie.
- SMS (déjà hors scope CASCADE-01).
- Notification email pour refund/credit effectués (à décider : le passager voit
  déjà le statut in-app — l'email de résolution est un nice-to-have).

## 4. Points d'accroche connus (issus de CASCADE-01)

- **Déclenchement annulation :** `backend/src/modules/trips/trip-lifecycle.service.ts`
  → `cancelTrip()` boucle sur les réservations impactées. C'est le point naturel
  pour émettre l'email (hors transaction DB, best-effort, après commit).
- **Statut refund exposé :** `refundStatus` (`NONE | PENDING | REFUNDED | CREDITED`)
  est déjà en base et sérialisé côté passager — exploitable pour le contenu email.
- **Follow-up optionnel lié :** enrichir le corps du 409 `REFUND_NOT_PENDING`
  (admin) avec `currentStatus` — noté en revue CASCADE-01, indépendant mais dans
  la même zone.

## 5. Definition of Done (à compléter en DESIGN)

- [ ] Provider email choisi + justifié (trade-offs documentés)
- [ ] `EmailService` backend + config env sécurisée (clé jamais en clair)
- [ ] Email annulation trajet, best-effort non bloquant, testé (envoi mocké)
- [ ] Template annulation conforme charte
- [ ] Décision prise sur emails refund/credit résolus (in/out scope)

---

> **Note :** ce fichier est un **stub** ouvert automatiquement à la clôture de
> CASCADE-01 pour ne pas perdre le besoin. Il doit passer par DISCOVER → DESIGN
> (brainstorming) avant tout BUILD, conformément à la méthodologie projet.
