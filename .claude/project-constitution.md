> **Priorité :** toujours active

# Constitution — Navette Sharing Go

## Sources de vérité (ordre)

1. `docs/CAHIER_DES_CHARGES.md`
2. `docs/methodology/BMAD.md` — exécution obligatoire
3. `docs/prd/active/*.md` — par feature (`docs/prd/templates/PRD-template.md`)
4. `PRODUCT.md` · `DESIGN.md`
5. `AGENTS.md` · `.claude/*.md`

Pas de feature significative sans PRD. Pas de code sans phase BMAD appropriée.

## Produit verrouillé

Châlons ↔ Vatry · 8 places · pending 2 min · pas de panier · Mosolf usage unique.

## Stack

Docker · Postgres · Prisma · Express/TS · React/Vite/Tailwind · Nginx · Stripe · VPS.

## Décisions

Diff minimal · commits sur demande · jamais `.env` en Git.
