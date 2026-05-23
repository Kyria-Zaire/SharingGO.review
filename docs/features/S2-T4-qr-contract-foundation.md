# S2-T4 — QR Contract Foundation

Ticket : contrat API pour afficher un QR côté web/mobile **sans** rendu image backend.

## Objectif

Après réservation `CONFIRMED` et paiement réussi, le passager récupère un **contrat QR** : JWT à encoder + expiration + instructions. Le client génère l’image QR localement.

## Endpoint

`GET /api/boarding/:reservationId/qr`

| Exigence | Détail |
|----------|--------|
| Auth | Cookie session (`requireAuth`) |
| RBAC | **Owner only** (pas admin) |
| Génération | Réutilise `generateBoardingToken()` (S2-T1) |

## Réponse

```json
{
  "reservationId": "...",
  "tripId": "...",
  "expiresAt": "...",
  "qr": {
    "format": "jwt",
    "payload": "JWT_SIGNED",
    "recommendedEncoding": "QR_TEXT"
  }
}
```

- `qr.payload` = chaîne **exacte** à encoder dans le QR (JWT HS256).
- Aucun PNG, SVG, data URL, base64 image.

## Pourquoi pas d’image backend

- Charge serveur réduite.
- Lib QR adaptée par plateforme (web `qrcode`, mobile native).
- Backend centré sécurité (JWT, révocation `bt`, validation, consommation).

## Sécurité / logs

Log autorisé : `Boarding QR contract generated` avec `reservationId`, `tripId`, `userId`.

Jamais : JWT complet, `qr.payload`, `bt`, token opaque DB.

## Non exposé

Email, payment, Stripe, claim `bt` séparé, user complet.

## Erreurs (réutilisées S2-T1)

| Code | HTTP |
|------|------|
| `RESERVATION_NOT_FOUND` | 404 |
| `RESERVATION_NOT_CONFIRMED` | 409 |
| `BOARDING_NOT_AVAILABLE` | 409 |
| `BOARDING_EXPIRED` | 410 |

## Validation admin

`qr.payload` peut être soumis à `POST /api/boarding/validate` (ADMIN) pour test intégration.

## Limites V1

Pas de scan UI, offline, deep link, données passager dans le QR.

## Futur

Scan chauffeur mobile, rendu QR frontend, librairie plateforme.

## Tests

```bash
node backend/scripts/s2-t4-qr-contract-test.mjs
```
