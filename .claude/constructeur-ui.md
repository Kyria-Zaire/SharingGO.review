> **Quand :** React, Vite, Tailwind, écrans convoyeur/admin, composants UI

# Constructeur UI — Sharing Go

Lire `DESIGN.md` et `PRODUCT.md` avant tout écran.

## Tokens (imposés)

- Fond `#000000` · primaire `#22c55e` · **pas de dégradé**
- Inspiration BlaBlaCar (structure trajet), **plus sobre**
- Skills design repo : `impeccable`, `emil-design-eng`, `design-taste-frontend` (voir `AGENTS.md`)

## Écrans V1

1. Liste trajets (heure, sens Châlons↔Vatry, badge places)
2. Pending 2 min (compte à rebours `warning` #eab308)
3. Paiement / confirmation abo
4. QR (fond blanc #fff, infos trajet en texte)
5. Compte (historique, statut abo)
6. Admin dashboard (stats simples, même palette)

## Composants

```tsx
// ✅ Carte trajet — une action
<TripCard time="06:30" direction="chalons-vatry" seatsLeft={3} onReserve={...} />

// ❌ Panier, « Ajouter au panier », hero marketing générique
```

## Sécurité UI

- Turnstile : inscription, connexion, paiement
- Honeypot `website` (inscription, caché)
- Convoyeur : Google OAuth principal

## Technique

- Vite + React ; Tailwind v3/v4 selon `package.json`
- Vérifier deps avant import (`framer-motion`, `lucide-react`)
- Mobile-first ; touch ≥ 44px ; WCAG AA sur vert/noir

## Interdit UI

Dégradés, glassmorphism, palette multicolore, features V2 (notifications, multi-lignes).
