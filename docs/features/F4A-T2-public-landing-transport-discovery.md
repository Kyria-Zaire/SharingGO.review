# F4A-T2 — Public Landing & Transport Discovery

Ticket : première expérience visible convoyeur — landing publique sur `/`.

## Objectifs UX

Répondre en **moins de 10 secondes** aux questions :

| Question | Réponse dans la landing |
|----------|-------------------------|
| Où va la navette ? | Hero + section Ligne (Châlons ↔ Paris-Vatry) |
| Pour qui ? | Hero — convoyeurs et professionnels |
| Combien ça coûte ? | Section Tarifs (8,99 € / 30 € / 40 €) |
| Comment ça fonctionne ? | Section 3 étapes + CTA ancre |
| Comment réserver ? | FAQ + CTA « Voir les trajets » → `/trips` |

**Intention produit :** un convoyeur Mosolf doit pouvoir dire *« J'ai compris comment aller à Vatry demain »* sans aide extérieure.

Ton : factuel, transport, sans jargon startup ni marketing vide.

## Structure landing

Ordre des sections (`LandingPage`) :

1. **HeroSection** — titre, sous-titre, CTA principal `/trips`, CTA secondaire `#how-it-works`
2. **RouteSection** — visuel Châlons ↔ Vatry + badges (régulier, places limitées, réservation obligatoire)
3. **HowItWorksSection** — 3 étapes numérotées
4. **PricingSection** — 3 cartes informatives (sans achat)
5. **BenefitsSection** — 4 avantages
6. **FaqSection** — accordéon `<details>` natif
7. **FinalCtaSection** — « Prêt à voyager ? » → `/trips`

Contenu centralisé : `src/features/home/constants/landing-content.ts`.

## Messages clés

| Élément | Message |
|---------|---------|
| Hero titre | Votre navette vers Paris-Vatry |
| Hero sous-titre | Transport dédié aux convoyeurs et professionnels… |
| Ligne | Trajet régulier · Places limitées · Réservation obligatoire |
| Ticket | 8,99 € — voyage occasionnel |
| Abo convoyeur | 30 €/mois — utilisateurs réguliers |
| Abo Mosolf | 40 €/mois — collaborateurs éligibles |

## Responsive

| Viewport | Comportement |
|----------|--------------|
| **375 px** | Colonne unique, CTA pleine largeur, étapes empilées |
| **390 px** | Idem — touch targets ≥ 44px (`min-h-touch`) |
| **768 px** | Grille tarifs 3 colonnes (si espace), avantages 2 colonnes |
| **Desktop** | Shell `max-w-lg` centré (app convoyeur), contenu lisible |

Mobile-first : priorité smartphone, safe-area header/bottom nav conservés (F4A-T1).

## Architecture fichiers

```text
frontend/apps/passenger/src/features/home/
  constants/landing-content.ts
  components/
    SectionHeading.tsx
    HeroSection.tsx
    RouteSection.tsx
    HowItWorksSection.tsx
    PricingSection.tsx
    BenefitsSection.tsx
    FaqSection.tsx
    FinalCtaSection.tsx
    LandingPage.tsx
```

`HomePage` délègue à `LandingPage`.

## Limites (scope F4A-T2)

**Non inclus :**

- Authentification
- Réservation / pending 2 min
- Paiement Stripe
- QR réel
- Appels API (`GET /api/trips` — ticket suivant)
- Modification admin / backend

Les CTA « Voir les trajets » pointent vers `/trips` (placeholder F4A-T1).

## Prochains tickets suggérés

| Ticket | Contenu |
|--------|---------|
| F4A-T3 | Liste trajets publics (`GET /api/trips`) — page `/trips` réelle |
| F4A-T4 | Passenger Auth Foundation (Google OAuth, session) |
| F4A-T5 | Réservation pending 2 min |
| F4A-T6 | Paiement Stripe Checkout |
| F4A-T7 | QR boarding pass + historique |

## Commandes

```bash
cd frontend/apps/passenger
npm run dev    # http://localhost:5174
npm run lint
npm run build
```

## DoD F4A-T2

- [x] Landing publique sur `/`
- [x] Hero, ligne, fonctionnement, tarifs, avantages, FAQ, CTA final
- [x] CTA fonctionnels (`/trips`, ancre `#how-it-works`)
- [x] Mobile-first, palette noir / blanc / `#22c55e`
- [x] Aucun impact admin
- [x] Lint + build OK
- [x] Documentation
