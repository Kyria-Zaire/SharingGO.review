# CONFIG-01 — Pricing Consistency

**Date :** 2026-06-26  
**Tarif officiel V1 :** **8,99 € TTC** · `STRIPE_TICKET_PRICE_CENTS=899`  
**Statut :** **CORRECTIONS APPLIQUÉES** — en attente validation CTO (aucun commit)

**Ops (Price IDs) :** [`docs/ops/CONFIG-01-pricing-consistency.md`](../ops/CONFIG-01-pricing-consistency.md) — CONFIG-01b.

---

## Verdict

| Zone | Résultat |
|------|----------|
| Backend | ✅ |
| Passenger | ✅ |
| Admin | ✅ (aucune référence ticket unitaire dans le frontend admin) |
| Stripe | ✅ (`unit_amount` via `env.stripeTicketPriceCents`) |
| Documentation | ✅ (sources actives + règles projet) |
| Tests | ✅ (pas de tests métier ticket ; `npm test` stub OK) |

**Incohérence critique corrigée :** Stripe facturait déjà via `STRIPE_TICKET_PRICE_CENTS`, mais la DB enregistrait encore `8.00` EUR via constante hardcodée.

---

## Références vérifiées

### Backend

| Fichier | Avant | Après | Verdict |
|---------|-------|-------|---------|
| `payments.service.ts` | `TICKET_AMOUNT_EUR = 8.00` + Stripe `env.stripeTicketPriceCents` | `ticketAmountEur()` depuis env | ✅ corrigé |
| `stripe-ticket-webhook.service.ts` | idem | idem | ✅ corrigé |
| `lib/ticket-pricing.ts` | — | **nouveau** — `stripeTicketPriceCents / 100` | ✅ |
| `config/env.ts` | lit `STRIPE_TICKET_PRICE_CENTS` | inchangé | ✅ |
| `prisma/seed.ts` | paiements TICKET `8.00` | `8.99` | ✅ corrigé |
| `src/docs/openapi.json` | example `8.00` | `8.99` | ✅ corrigé |

### Passenger

| Fichier | Avant | Après |
|---------|-------|-------|
| `constants/pricing.ts` | `8 €` | `8,99 €` + `TICKET_PRICE_CENTS=899` |
| `landing-trip-utils.ts` | `8,00 €` | alias `TICKET_PRICE_LABEL` |
| `help-content.ts` | texte `8 €` | `8,99 €` |
| `legal-terms-content.ts` | `8 € TTC` | `8,99 € TTC` |
| Trips / booking / pending | via constantes | ✅ `8,99 €` |

### Configuration

| Fichier | Avant | Après |
|---------|-------|-------|
| `.env.example` | `800` | `899` |
| `.env.prod.example` | `899` | ✅ déjà OK |

### Documentation (échantillon corrigé)

- `docs/CAHIER_DES_CHARGES.md`
- `PRODUCT.md`
- `docs/features/S1-T4-stripe-checkout-integration.md`
- `docs/features/F4A-T*.md`
- `docs/ops/DEPLOY-01-INFRA-AUDIT.md`
- `.cursor/rules/*.mdc`
- `docs/qa/QA-01*.md`

---

## Corrections effectuées

### Code (fonctionnel — cohérence montant uniquement)

1. **`backend/src/lib/ticket-pricing.ts`** — helper `ticketAmountEur()` aligné sur `STRIPE_TICKET_PRICE_CENTS`.
2. **`payments.service.ts`** / **`stripe-ticket-webhook.service.ts`** — montant DB = centimes env.
3. **`frontend/.../constants/pricing.ts`** — source unique affichage `8,99 €`.
4. **`landing-trip-utils.ts`** — re-export constante pricing.
5. **`help-content.ts`**, **`legal-terms-content.ts`** — textes juridiques / FAQ.
6. **`prisma/seed.ts`** — montants TICKET seed `8.99`.
7. **`openapi.json`** (×2) — exemple API `8.99`.

### Documentation & gouvernance

8. **`.env.example`** → `899`
9. **CDC, PRODUCT, features, OPS, cursor rules, QA runbooks** — tarif ticket `8,99 €`.

**Non modifié (hors scope) :** abonnements 30 € / 40 €, Mosolf, logique Checkout Stripe, calculs TVA détaillés.

---

## Références restantes (justifiées)

| Référence | Emplacement | Justification |
|-----------|-------------|---------------|
| `STRIPE_TICKET_PRICE_CENTS=800` | `.env` local (gitignored) | **Action ops requise** — mettre à jour manuellement en `899` sur chaque poste / VPS avant prod. Non versionné. |
| `8 €` | `docs/audits/WEB-PASSENGER-AUDIT-01.md` | Archive audit 2026-06-23 — contexte historique pré-CONFIG-01. Mise à jour optionnelle. |
| `8 €` | `docs/qa/WEB-AUDIT-01-passenger-web-audit.md` | Idem archive QA. |
| `800` | `p1-04-regression-qa.mjs` `waitForTimeout(800)` | Délai ms Playwright — **sans lien tarif**. |
| `800` | skills design (motion 500-800ms) | Hors périmètre produit. |
| `npm 1.2.8000` | `package-lock.json` | Version npm — faux positif. |

---

## Checks qualité

```text
backend npm run build     → exit 0
backend npm test          → exit 0 (stub S0-T1)
passenger pnpm lint       → exit 0
passenger pnpm build      → exit 0 — index-DLnk25B3.js 827.63 kB
passenger pnpm audit:links → FAIL: 0
```

### Preuve absence ancien tarif dans `src/`

```bash
rg "8 €|8,00|8\.00|800" frontend/apps/passenger/src backend/src
# → aucune correspondance ticket
```

---

## Gate CONFIG-01

| Critère | État |
|---------|------|
| Aucune référence obsolète 8 € / 800 centimes (code actif) | ✅ |
| Frontend affiche 8,99 € | ✅ |
| Backend enregistre montant aligné env | ✅ |
| Stripe `unit_amount` = 899 via env | ✅ |
| Documentation sources de vérité cohérente | ✅ |
| Commit | ⏸️ **En attente GO CTO** |

---

*Prochaine action ops : vérifier `.env` / secrets VPS → `STRIPE_TICKET_PRICE_CENTS=899` avant premier paiement réel.*
