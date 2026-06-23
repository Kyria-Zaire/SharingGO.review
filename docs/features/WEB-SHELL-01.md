# WEB-SHELL-01 — Shell passager (navigation + layout global)

**Ticket :** WEB-SHELL-01  
**Feature parente :** WEB-REFONTE-01 — Passenger Experience  
**Statut :** Implémenté (shell uniquement — contenu landing WEB-LANDING-01 à suivre)

## Objectif

Fournir la fondation UI réutilisable pour toutes les pages passager : header desktop/mobile, bottom navigation mobile, footer marketing, conteneurs responsive.

**Hors scope :** contenu métier des pages, cartes trajets, réservations, QR, abonnements, API/backend.

## Architecture

```
PassengerShell
├── PassengerHeader          (sticky, desktop + mobile)
├── <main>                   (Outlet — pages enfants)
├── PassengerFooter?         (landing `/` uniquement)
└── PassengerBottomNav?      (mobile, sauf landing anonyme)
```

### Orchestration

- `PassengerShell` — assemble header, main, footer, bottom nav.
- `usePassengerShell` — règles d'affichage selon route + auth.

| Contexte | Bottom nav | Footer marketing |
|----------|------------|------------------|
| `/` + anonyme | Non | Oui |
| `/` + connecté | Oui (mobile) | Oui |
| Autres routes | Oui (mobile) | Non |

### Fichiers clés

| Fichier | Rôle |
|---------|------|
| `components/layout/PassengerShell.tsx` | Layout racine router |
| `components/layout/PassengerHeader.tsx` | Header sticky + drawer mobile |
| `components/layout/PassengerBottomNav.tsx` | Onglets mobile (md:hidden) |
| `components/layout/PassengerFooter.tsx` | Footer 4 colonnes |
| `components/layout/PassengerLogo.tsx` | Logo SharingGO |
| `components/layout/PassengerUserMenu.tsx` | Avatar + menu déroulant |
| `components/layout/PassengerNotificationsButton.tsx` | Cloche (placeholder) |
| `constants/shell-navigation.ts` | Liens nav desktop + footer |
| `hooks/usePassengerShell.ts` | État shell (padding, visibilité) |
| `lib/passenger-layout.ts` | Classes conteneur (1280 / 1440 / 1536) |

## Navigation

### Desktop (header)

- Accueil → `/`
- Trajets → `/trips`
- Réservations → `/bookings` (auth requise côté route)
- Abonnements → `/#pricing` (ancre landing)

État actif : bordure basse verte + texte primary.

### Mobile

**Header :** hamburger (drawer), logo centré, notifications, avatar.

**Bottom nav** (`md:hidden`) :

- Accueil, Trajets, Réservations, Profil

Safe area iOS : `env(safe-area-inset-bottom)` sur la bottom nav et padding main.

### Auth

- Non connecté : lien « Se connecter » à la place du menu utilisateur.
- Connecté : avatar, nom raccourci (`Prénom N.`), menu profil / déconnexion.

## Responsive strategy

### Conteneurs

```ts
passengerHeaderContainerClass / passengerShellWidthClass
// max-w 1280 → xl 1440 → 2xl 1536, px 16/24/32
```

### Breakpoints testés (objectif)

| Viewport | Usage |
|----------|--------|
| 1280px | Laptop standard |
| 1440px | Laptop large |
| 1920px | Desktop large (contenu centré, max 1536) |
| 375px (iPhone SE) | Mobile compact |
| 390px (iPhone 15) | Mobile standard |
| 360px | Android standard |

### Règles

- `overflow-x-hidden` sur le shell racine.
- Bottom nav fixe : `main` reçoit `padding-bottom: calc(4.5rem + safe-area)`.
- Landing pleine largeur : pas de `passengerShellWidthClass` sur `main` (`isHome`).

## Footer marketing

Colonnes : SharingGO, Liens utiles, Informations, Besoin d'aide ?

- Contact : `support@sharinggo.fr`, `07 80 90 10 20`
- Réseaux sociaux : **masqués** tant que `FOOTER_SOCIAL_LINKS` est vide (pas d'URL placeholder).

## Conventions

- Nouvelles pages passager : enfants de `PassengerLayout` / `PassengerShell` dans le router.
- Pages auth (`/login`, `/register`) : `AuthLayout` (hors shell).
- Ne pas réintroduire de bottom nav desktop.
- Liens ancres landing : utiliser `LANDING_SECTION_IDS` + `shell-navigation.ts`.

## Prochain ticket

**WEB-LANDING-01** — Refonte pixel-perfect du contenu de la page d'accueil (hero, départs, abonnements, sections marketing) sur ce shell.
