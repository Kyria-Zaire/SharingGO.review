# CONFIG-01 — Pricing consistency (ops)

**Date :** 2026-06-26  
**Ticket CONFIG-01b :** Price IDs Stripe + `.env.example`  
**Tarif ticket officiel V1 :** **8,99 € TTC** · `STRIPE_TICKET_PRICE_CENTS=899`  
**Statut :** corrections appliquées — **aucun commit** sans GO CTO

Audit détaillé code + docs : [`docs/audits/CONFIG-01-pricing-consistency.md`](../audits/CONFIG-01-pricing-consistency.md).

---

## Grille tarifaire V1

| Offre | Montant affiché | Variable / mécanisme |
|-------|-----------------|----------------------|
| Ticket unitaire (convoyeur occasionnel) | 8,99 € TTC / trajet | `STRIPE_TICKET_PRICE_CENTS=899` |
| Abonnement Convoyeur | 30 € / mois | `STRIPE_PRICE_CONVOYEUR_MONTHLY` |
| Abonnement Mosolf | 40 € / mois | `STRIPE_PRICE_MOSOLF_MONTHLY` |

Les abonnements **30 €** et **40 €** ne sont pas modifiés par CONFIG-01.

---

## Stripe Price IDs

| Offre | Price ID test (`sk_test_*`) | Price ID live (`sk_live_*`) | Mécanisme checkout |
|-------|------------------------------|-----------------------------|-------------------|
| Ticket unitaire 8,99 € | `price_1TmgAsJoKcqsGQTGIJzDuvZd` *(catalogue Dashboard)* | À créer en mode live — **non versionné** | **`price_data`** + `unit_amount` depuis `STRIPE_TICKET_PRICE_CENTS` — **pas** de `price_…` en session |
| Abonnement Convoyeur 30 €/mois | `price_1Tmg4PJoKcqsGQTGcUUEwFPr` | `price_live_CHANGEME` *(`.env.prod.example`)* | Checkout **subscription** · `line_items: [{ price: STRIPE_PRICE_CONVOYEUR_MONTHLY }]` |
| Abonnement Mosolf 40 €/mois | `price_1TaCvQJoKcqsGQTGAaFTm1ZM` | `price_live_CHANGEME` *(`.env.prod.example`)* | Checkout **subscription** · `line_items: [{ price: STRIPE_PRICE_MOSOLF_MONTHLY }]` |

### Ticket : `price_data` vs Price ID

Le billet **n’utilise pas** un Price ID Stripe au runtime, même si `price_1TmgAsJoKcqsGQTGIJzDuvZd` existe dans le Dashboard test.

```typescript
// backend/src/modules/payments/payments.service.ts
line_items: [{
  quantity: 1,
  price_data: {
    currency: env.stripeCurrency,
    unit_amount: env.stripeTicketPriceCents, // 899 = 8,99 €
    // ...
  },
}],
```

**Source de vérité ticket :** `STRIPE_TICKET_PRICE_CENTS` (et `ticketAmountEur()` côté DB).  
**Price ID ticket :** référence catalogue / reporting uniquement — ne pas le brancher sans décision produit + migration checkout.

Les abonnements, eux, passent par des Price IDs récurrents (`subscriptions-checkout.service.ts`).

---

## Fichiers `.env` de référence

| Fichier | Ticket | Convoyeur | Mosolf |
|---------|--------|-----------|--------|
| `.env.example` (dev/test) | `899` | `price_1Tmg4PJoKcqsGQTGcUUEwFPr` | `price_1TaCvQJoKcqsGQTGAaFTm1ZM` |
| `.env.prod.example` | `899` | `price_live_CHANGEME` | `price_live_CHANGEME` |
| `.env` local (gitignored) | **vérifier manuellement** | idem | idem |

**Action ops :** sur chaque poste et VPS, confirmer `STRIPE_TICKET_PRICE_CENTS=899` (pas `800`) avant tout paiement réel.

---

## Hors scope CONFIG-01b

- Pas de message landing « ~3,99 € / trajet » (abo Convoyeur).
- Pas de changement du flux checkout (ticket reste en `price_data`).
- Pas de commit sans validation CTO.

---

## Checks (CONFIG-01b)

```text
backend npm run build     → exit 0
passenger pnpm lint       → exit 0
passenger pnpm build      → exit 0
```

---

*Dernière mise à jour : CONFIG-01b — Price IDs test documentés, `.env.example` aligné.*
