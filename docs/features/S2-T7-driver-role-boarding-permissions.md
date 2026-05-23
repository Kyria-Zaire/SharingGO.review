# S2-T7 — Driver Role & Boarding Permissions

Ticket : rôle terrain **DRIVER** pour validate/consume boarding, sans accès admin.

## Objectif terrain

Sur le terrain, le scan QR n’est pas forcément effectué par un admin global. Un chauffeur doit pouvoir :

- valider un billet (`POST /api/boarding/validate`),
- embarquer un passager (`POST /api/boarding/consume`),
- recevoir les réponses UI (S2-T5),

sans accéder aux opérations admin (réservations, paiements, CRUD lignes/trajets).

## UserType `DRIVER`

Ajout à l’enum Prisma / PostgreSQL :

```prisma
enum UserType {
  CONVOYEUR
  DRIVER
  ADMIN
  SUPER_ADMIN
}
```

Migration : `20260523100000_add_driver_user_type`.

## Permissions DRIVER

| Action | Autorisé |
|--------|----------|
| `POST /api/boarding/validate` | Oui |
| `POST /api/boarding/consume` | Oui |
| `GET /api/boarding/offline-capabilities` | Oui (public) |
| `GET /api/boarding/:id/token` | Non (owner passager) |
| `GET /api/boarding/:id/qr` | Non (owner passager) |
| `/api/admin/*` | Non (**403**) |
| CRUD transport admin | Non (**403**) |

Constante code : `BOARDING_FIELD_SCAN_ROLES` = `ADMIN` | `SUPER_ADMIN` | `DRIVER`.

## Pourquoi DRIVER ≠ ADMIN

- **Séparation des responsabilités** : scan terrain vs back-office.
- **Surface d’attaque réduite** : pas de liste réservations, paiements, occupation globale.
- **Conformité opérationnelle** : un compte chauffeur ne doit pas « devenir admin » par erreur de config.

## Compte démo

| Champ | Valeur |
|-------|--------|
| Email | `driver@sharinggo.demo` |
| Mot de passe | `DemoPassword123!` |
| `userType` | `DRIVER` |

Créé par le seed demo (`ALLOW_DEMO_SEED=true`). Idempotent via cleanup `@sharinggo.demo`.

## Rôles inchangés

| Rôle | validate/consume | admin |
|------|------------------|-------|
| ADMIN / SUPER_ADMIN | Oui | Oui |
| DRIVER | Oui | Non |
| CONVOYEUR | Non | Non |
| Passager (owner) | token/qr own only | Non |

## Futur app chauffeur

- Login `driver@…` → scan → `consume` + UI S2-T5.
- Pas de promotion DRIVER en prod dans ce ticket (endpoint admin futur).

## Limites V1

- Pas d’UI mobile chauffeur.
- Pas de liaison automatique DRIVER ↔ `Trip.driverId`.
- Pas de scope « trajets du chauffeur connecté » sur consume (tout billet valide scannable).

## Tests

```bash
node backend/scripts/s2-t7-driver-permissions-test.mjs
```

## Références

- S2-T2 validate, S2-T3 consume, S2-T5 UI contract, S2-T6 offline manifest
