# Sharing Go — Navette (PRODUCT)

> Produit global : [`docs/CAHIER_DES_CHARGES.md`](docs/CAHIER_DES_CHARGES.md).  
> Exécution : [`docs/methodology/BMAD.md`](docs/methodology/BMAD.md).  
> Par feature : [`docs/prd/templates/PRD-template.md`](docs/prd/templates/PRD-template.md).

## Produit

**Navette Sharing Go** — ligne unique **Châlons-en-Champagne ↔ Aéroport Paris-Vatry**.

- 8 trajets/jour, 20 jours/mois (160 trajets/mois)
- 8 places par trajet
- Cible : convoyeurs (automobiles) + partenaire Mosolf + admins opérationnels

## Utilisateurs

### Convoyeur ticket

- Paie **8 €** par trajet réservé (Stripe, paiement unitaire)
- Pas d’abonnement ; peut **passer en abonné** plus tard (historique conservé)
- 3 trajets = 3 paiements séparés (pas de panier)

### Convoyeur abonné (30 €/mois)

- `user_type = convoyeur`, abonnement Stripe mensuel
- Réservation sans repayer chaque trajet (tant que l’abonnement est actif)

### Abonné Mosolf (40 €/mois)

- `user_type = convoyeur` avec **code promo Mosolf** (usage unique, lié email/domaine)
- Checkout Stripe avec coupon/metadata
- **Désactive** tout autre abonnement actif à l’activation

### Admin

- `user_type = admin`
- CRUD trajets (8/jour), stats, gestion ligne

## Jobs to be done (V1)

1. **Réserver une place** sur un créneau précis, vite, sans friction
2. **Payer** (ticket ou abonnement) en moins de 2 minutes après le clic
3. **Montrer un QR** à l’embarquement (chauffeur valide hors ligne)
4. **Admin** : voir remplissage, revenus, activer/désactiver des trajets

## Parcours principal (convoyeur)

1. Ouvrir l’app → liste des trajets du jour / à venir
2. Choisir horaire → voir **places restantes**
3. Clic réserver → **pending** 2 min → paiement Stripe **ou** abonnement OK
4. Confirmation → **QR JWT** pour ce trajet
5. Embarquement : scan chauffeur (JWT valide jusqu’à **départ + 10 min**)

## Règles métier critiques (ne pas violer)

| Règle | Détail |
|-------|--------|
| Pas de panier | Une réservation = un trajet = un flux paiement (ticket) |
| Timeout réservation | **2 minutes** (`pending_reservations`) |
| Places | PostgreSQL `FOR UPDATE` ; refus si complet |
| Mosolf | Code **unique** ; annule les autres abos |
| QR | JWT signé : trip + user + expiry (départ + 10 min) |

## Ton & voix

- **Direct, rassurant, sobre** — comme une navette pro, pas une startup flashy
- Phrases courtes, horaires et places en évidence
- Pas de jargon technique côté convoyeur
- Admin : vocabulaire opérationnel (remplissage, trajets, revenus)

## Anti-références (à éviter)

- UI type marketplace générique / « startup IA »
- Dégradés, glassmorphism, palettes multicolores
- Panier e-commerce, « ajouter au panier »
- Supabase / Neon / BaaS managé (stack **Docker + Postgres self-hosted**)
- Sur-promesses V2/V3 dans l’UI V1 (notifications, multi-lignes, etc.)

## Périmètre V1 (strict)

Inclus : réservation, abonnements, planning admin, Stripe, QR, dashboard stats simples, compte (historique + statut abo).

Hors V1 : analytics avancés, notifications push, multi-chauffeurs, nouvelles lignes, optimisation auto.

## Auth & sécurité (V1)

- Convoyeur : **connexion Google OAuth obligatoire**
- Admin : magic link autorisé
- Turnstile : inscription, connexion, paiement
- Honeypot `website` sur inscription

## Stack (rappel agents dev)

Node/Express/TS, Prisma, PostgreSQL, React/Vite/Tailwind, Nginx, Stripe, Lucia ou Auth.js, Docker Compose sur VPS.

Sécurité détaillée : CDC §5.2 · `security-baseline.md` (Cursor) / `.claude/security-baseline.md`.
