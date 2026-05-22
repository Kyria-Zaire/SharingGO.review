# Sharing Go — Design system (V1)

> Spécification visuelle imposée — cahier des charges v1.0. Produit : [`PRODUCT.md`](PRODUCT.md).

## Direction

- **Inspiration :** BlaBlaCar (clarté trajet, horaires, places) — **plus sobre**
- **Positionnement :** Navette pro, lisible mobile-first, confiance par la simplicité
- **Interdit :** dégradés, effets « premium » décoratifs, cards empilées sans raison

## Couleurs

| Token | Valeur | Usage |
|-------|--------|--------|
| `background` | `#000000` | Fond dominant, chrome app |
| `foreground` | `#ffffff` | Texte principal sur fond noir |
| `primary` | `#22c55e` | CTA, succès, places disponibles, liens actifs |
| `primary-foreground` | `#000000` | Texte sur bouton vert |
| `muted` | `#171717` | Surfaces secondaires |
| `muted-foreground` | `#a3a3a3` | Labels, métadonnées |
| `border` | `#262626` | Séparateurs, cartes trajet |
| `destructive` | `#ef4444` | Erreur, trajet complet, expiration |
| `warning` | `#eab308` | Pending / expire bientôt (2 min) |

**Règle :** couleurs **plates** uniquement. Pas de `linear-gradient`, pas de mesh, pas de glow.

## Typographie

- **Sans-serif système ou Inter** — une famille, 2–3 graisses max
- Hiérarchie : horaire trajet > ville/destination > places restantes > meta
- Tailles mobile-first ; line-height généreux sur listes de trajets

## Espacement & layout

- Grille simple 4px ; padding généreux sur cartes trajet
- Une action principale par écran (réserver / payer / afficher QR)
- Liste trajets : une carte = un créneau (heure, sens, places, prix si ticket)

## Composants clés

### Carte trajet

- Heure départ/arrivée en tête
- Sens : Châlons ↔ Vatry (icône direction discrète)
- Badge places : vert si > 0, rouge si complet
- CTA « Réserver » pleine largeur, `primary`

### État pending (2 min)

- Bandeau ou compte à rebours visible
- Couleur `warning` ; pas de modal bloquante inutile

### QR embarquement

- QR centré, fond blanc **#ffffff** (contraste scan)
- Sous-titre : trajet + heure ; pas d’animations distrayantes

### Admin dashboard

- Même palette ; tableaux denses OK
- Graphiques simples (barres/lignes), pas de chart library lourde en V1 si évitable

## Motion

- Skill `emil-design-eng` : transitions **courtes** (150–250ms), `ease-out`
- Pas d’animations décoratives sur la liste trajets
- Feedback `:active` sur boutons (scale léger)

## Accessibilité

- Contraste WCAG AA minimum (vert `#22c55e` sur noir : vérifier texte petit)
- Touch targets ≥ 44px
- QR : alternative texte trajet + id réservation pour support

## Tailwind (suggestion config)

```js
// tailwind.config — extrait indicatif
colors: {
  background: '#000000',
  foreground: '#ffffff',
  primary: { DEFAULT: '#22c55e', foreground: '#000000' },
  muted: { DEFAULT: '#171717', foreground: '#a3a3a3' },
  border: '#262626',
  destructive: '#ef4444',
}
```

## Références visuelles

- BlaBlaCar : structure information trajet, pas la palette
- Éviter : Uber flashy, SaaS dashboard violet, templates « AI landing »
