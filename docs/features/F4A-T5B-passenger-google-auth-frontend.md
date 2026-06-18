# F4A-T5B — Passenger Google Auth Frontend

Ticket : connexion convoyeur via Google sur l'app passenger, session cookie HttpOnly, sans JWT ni stockage client.

## Flow session

```text
Montage app
  → AuthProvider GET /api/auth/me (credentials: include)
  → 200 : user hydraté
  → 401 : user null (anonyme, pas d'erreur bloquante)

LoginPage — Google Identity Services (@react-oauth/google)
  → credential (ID Token JWT Google, usage unique)
  → POST /api/auth/google { idToken }
  → cookie HttpOnly posé par le backend
  → redirect state.from ou /trips

Logout (Profil)
  → POST /api/auth/logout
  → user null

CTA « Réserver ma place » (TripDetailPage)
  → si anonyme : navigate /login { state: { from: pathname } }
  → si authentifié : placeholder « Réservation bientôt disponible » (F4A-T4)
```

**Aucun JWT auth utilisateur** stocké côté frontend. **Aucun** `localStorage` / `sessionStorage` pour l'auth.

## Variables d'environnement

| Variable | Fichier | Usage |
|----------|---------|--------|
| `VITE_GOOGLE_CLIENT_ID` | `frontend/apps/passenger/.env` | `GoogleOAuthProvider` + doit matcher `GOOGLE_CLIENT_ID` backend |
| `VITE_API_URL` | idem | Base API (défaut `http://localhost:3000`) |

Exemple : `frontend/apps/passenger/.env.example`

Si `VITE_GOOGLE_CLIENT_ID` absent → écran d'erreur explicite au démarrage.

## API client

| Fonction | Endpoint | Notes |
|----------|----------|-------|
| `getCurrentPassenger()` | `GET /api/auth/me` | `null` si 401 |
| `googleLoginPassenger(idToken)` | `POST /api/auth/google` | retourne `PassengerUser` |
| `logoutPassenger()` | `POST /api/auth/logout` | 204 |

Toutes les requêtes : `credentials: "include"`.

## Composants clés

| Fichier | Rôle |
|---------|------|
| `context/AuthProvider.tsx` | Provider React |
| `context/auth-context.ts` | Contexte + types |
| `hooks/useAuth.ts` | Hook consommateur |
| `api/auth.api.ts` | Appels auth |
| `types/auth.ts` | `PassengerUser` (= `UserSafe` backend) |
| `pages/LoginPage.tsx` | Bouton Google |
| `components/auth/RequireAuth.tsx` | Guard route (ex. `/bookings`) |
| `pages/ProfilePage.tsx` | Infos user + déconnexion |
| `pages/TripDetailPage.tsx` | CTA réserver → login si anonyme |
| `app/App.tsx` | `GoogleOAuthProvider` + `AuthProvider` |

## Limites hors scope (F4A-T5B)

- Aucune modification backend
- Pas d'email / mot de passe
- Pas de création réservation, Stripe, seat lock
- Pas Turnstile, CSRF, honeypot
- `RegisterPage` reste placeholder (Google only produit)

## Prochain ticket recommandé

**F4A-T6** (ou équivalent) — flux réservation réel après auth (pending, Stripe Checkout).

## Dépendance

- `@react-oauth/google`
