# WEB-ASSETS-01 — Photos officielles SharingGO (dette visuelle)

**Statut :** Ouvert — bloquant avant pilote terrain  
**Parent :** WEB-REFONTE-01 · Landing passager  
**Origine :** Validation CTO post WEB-LANDING-01

## Problème

La landing utilise des visuels temporaires (générés / placeholders) à la place des photos PO :

| Zone | Maquette PO | Livraison actuelle | Impact |
|------|-------------|-------------------|--------|
| Hero droite | Van premium photo réaliste | Asset temporaire `hero-van-temp.png` | Impact émotionnel ~-70 % |
| Abonnements | Image intérieur immersive | Asset temporaire `subscription-interior-temp.png` | Marketing moyen |

## Assets requis (production)

Déposer dans `frontend/apps/passenger/public/images/landing/` :

| Fichier cible | Usage | Specs recommandées |
|---------------|-------|-------------------|
| `hero-van.jpg` (ou `.webp`) | Hero desktop/mobile | ≥ 1600×1200, van SharingGO de nuit, terminal Vatry |
| `subscription-interior.jpg` | Bannière abonnements | ≥ 1200×900, intérieur navette, LED verte |

Une fois les fichiers officiels en place, mettre à jour `landing-assets.ts` :

```ts
export const LANDING_ASSETS = {
  heroVan: "/images/landing/hero-van.webp",
  subscriptionInterior: "/images/landing/subscription-interior.webp",
} as const;
```

Et supprimer les fichiers `*-temp.png`.

## Implémentation technique

- `landing-assets.ts` — chemins centralisés
- `LandingHeroVisual` — `<img>` photo + overlay léger + fallback SVG si 404
- `LandingSubscriptionVisual` — idem

## Critères d'acceptation WEB-ASSETS-01

- [ ] Photos prises / validées par PO (droits d'usage OK)
- [ ] Optimisées WebP, poids < 300 Ko chacune
- [ ] Remplacement des `*-temp.png`
- [ ] Validation visuelle desktop + mobile vs maquette PO
- [ ] Alt text descriptifs FR

## Non-objectifs

- Pas de CDN externe non maîtrisé
- Pas de stock photos génériques sans branding SharingGO
