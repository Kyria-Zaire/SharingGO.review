# S2-T5 — Driver Scan UI Contract

Ticket : contrat de réponses **UI-friendly** pour le futur écran chauffeur, sans caméra ni app mobile native.

## Objectif

Le scan réel reste `POST /api/boarding/consume` (S2-T3). Ce ticket enrichit uniquement la **forme des réponses** pour que le client mobile/web affiche :

- un état visuel (`ui.status`),
- un titre et un message (`ui.title`, `ui.message`),
- les métadonnées passager / trajet quand disponibles,
- sans dupliquer la logique métier ni les textes côté frontend.

## Pourquoi le backend fournit les messages

- **Cohérence** : admin web, futur React Native chauffeur, outils internes partagent les mêmes libellés.
- **i18n futur** : un seul mapping (`boarding-ui-messages.ts`) à traduire.
- **Simplicité mobile** : le client mappe `ui.status` → couleur / icône ; pas de `switch(reason)` dispersé.

## Endpoint concerné

`POST /api/boarding/consume` — inchangé côté auth (cookie, `ADMIN` | `SUPER_ADMIN`), HTTP 200 pour tous les cas métier.

## Structure de réponse

### Succès (embarquement)

```json
{
  "valid": true,
  "consumed": true,
  "ui": {
    "status": "success",
    "title": "Billet valide",
    "message": "Passager embarqué"
  },
  "reservation": { "id": "...", "status": "USED", "usedAt": "..." },
  "passenger": { "id": "...", "firstName": "...", "lastName": "..." },
  "trip": { "id": "...", "departureTime": "..." }
}
```

### Déjà utilisé (anti double-scan)

```json
{
  "valid": true,
  "consumed": false,
  "reason": "BOARDING_ALREADY_USED",
  "ui": {
    "status": "warning",
    "title": "Billet déjà utilisé",
    "message": "Ce billet a déjà été scanné"
  },
  "reservation": { ... },
  "passenger": { ... },
  "trip": { ... }
}
```

`valid: true` + `consumed: false` conserve la sémantique S2-T3 : le billet est reconnu mais non re-consommé.

### Échec métier

```json
{
  "valid": false,
  "consumed": false,
  "reason": "INVALID_TOKEN",
  "ui": {
    "status": "error",
    "title": "QR invalide",
    "message": "Le billet est invalide"
  }
}
```

## Mapping `reason` → `ui.status`

| Reason | ui.status |
|--------|-----------|
| Succès consume | `success` |
| `BOARDING_ALREADY_USED` | `warning` |
| `EXPIRED_TOKEN` | `warning` |
| `BOARDING_WINDOW_EXPIRED` | `warning` |
| `INVALID_TOKEN` | `error` |
| `TOKEN_REVOKED` | `error` |
| `PAYMENT_NOT_SUCCEEDED` | `error` |
| `TRIP_DISABLED` | `error` |
| Autres rejets métier | `error` |

Source unique : `backend/src/modules/boarding/boarding-ui-messages.ts`.

## Logique métier inchangée

- Transaction Prisma + `SELECT FOR UPDATE` sur la réservation.
- Anti double-scan (`BOARDING_ALREADY_USED` si JWT encore valide sur réservation `USED`).
- Vérification JWT + claim `bt` vs DB.
- **Aucun** changement sur `validate`, `qr`, `token`, Stripe, schéma Prisma.

## Futur (hors scope S2-T5)

| Évolution | Note |
|-----------|------|
| Écran React Native chauffeur | Lit `ui` + `passenger` / `trip` |
| Caméra / scan natif | Envoie le JWT à `consume` |
| Offline / sync | File d’attente locale + replay |
| Rôle `DRIVER` | RBAC dédié (aujourd’hui : admin) |
| WebSocket live | Notifications temps réel |

## Sécurité / logs

Autorisé : `reason`, `reservationId`, `tripId`, `adminUserId`, `requestId`.

Jamais dans les logs : JWT complet, `qr.payload`, `bt`, token opaque DB.

## OpenAPI

Schéma `BoardingUiMessage` + champs `ui` requis sur `BoardingConsumptionSuccess`, `BoardingConsumptionAlreadyUsed`, `BoardingConsumptionFailure`.

Fichiers : `backend/src/docs/openapi.json`, `docs/api/openapi.json`.

## Tests

```bash
node backend/scripts/s2-t5-driver-ui-contract-test.mjs
```

Couvre : `ui.success` / `ui.warning` / `ui.error`, auth 401, RBAC 403 convoyeur, absence de fuites sensibles.

## Références

- S2-T1 — JWT foundation
- S2-T2 — validation admin
- S2-T3 — consumption + USED
- S2-T4 — QR contract passager
