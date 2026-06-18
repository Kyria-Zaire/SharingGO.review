# F4A-T9 — Passenger Boarding Pass QR

Ticket : billet numérique passager avec QR généré localement à partir du JWT boarding.

## Flow utilisateur

```text
/bookings/:id (CONFIRMED)
  → CTA « Voir mon billet »
  → /bookings/:id/boarding-pass (RequireAuth)
  → GET /api/boarding/:id/qr
  → affichage QR (qr.payload) + countdown expiresAt
```

## Endpoint

| Fonction | Méthode | Route |
|----------|---------|-------|
| `getBoardingQr(id)` | GET | `/api/boarding/:reservationId/qr` |

Auth cookie · owner-only · credentials `include`.

### Response 200

```typescript
{
  reservationId: string;
  tripId: string;
  expiresAt: string; // departureTime + 10 min — source countdown UI
  qr: {
    format: "jwt";
    payload: string; // JWT HS256 complet — encodé tel quel dans le QR
    recommendedEncoding: "QR_TEXT";
  };
}
```

## Règles sécurité frontend

- **Encoder `qr.payload` tel quel** dans le QR (`react-qr-code`, `value={qr.payload}`).
- **Countdown** basé sur `expiresAt` API — **pas** sur le claim JWT `exp`.
- **Aucun décodage JWT** pour logique métier ou validation.
- **Aucune vérification de signature** côté passager.
- La validation réelle reste côté backend / scanner chauffeur (`POST /api/boarding/validate` · `consume`).

## Erreurs gérées

| HTTP | Code | UI |
|------|------|-----|
| 401 | `UNAUTHORIZED` | Redirect `/login` avec `state.from` |
| 404 | `RESERVATION_NOT_FOUND` | Billet introuvable → `/bookings` |
| 409 | `RESERVATION_NOT_CONFIRMED` | Message + retour détail |
| 409 | `BOARDING_NOT_AVAILABLE` | Message + retour détail |
| 410 | `BOARDING_EXPIRED` | Billet expiré, QR masqué |
| Local countdown = 0 | — | QR masqué, état expiré, bouton Actualiser |

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `api/boarding.api.ts` | `getBoardingQr` |
| `types/boarding.ts` | Types contrat QR |
| `hooks/useBoardingQr.ts` | TanStack Query |
| `hooks/useBoardingCountdown.ts` | Countdown `expiresAt` (1 s) |
| `pages/BoardingPassPage.tsx` | Page QR + états |
| `pages/BookingDetailPage.tsx` | CTA actif si `CONFIRMED` |
| `app/router.tsx` | Route nested boarding-pass |

## Dépendance

```bash
cd frontend/apps/passenger && npm install react-qr-code
```

Package manager : **npm** (`package-lock.json`).

## Limites hors scope

- Scan chauffeur / admin validate·consume
- Image QR serveur
- Décodage ou validation JWT côté frontend
- Modifications backend

## Dépendances

- F4A-T8B — page détail + CTA
- S2-T4 — contrat API QR backend

## Prochain ticket

Améliorations UX post-MVP (plein écran QR, luminosité, offline) — hors V1 si non PRD.
