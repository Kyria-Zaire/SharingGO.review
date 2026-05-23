# S2-T6 — Offline Validation Preparation

Ticket : préparation architecture du futur scan chauffeur offline — **sans** implémenter le mode offline.

## Objectif

Documenter les limites HS256, exposer un manifest public des capacités, et guider le mobile vers **ONLINE_FIRST** jusqu’à une migration asymétrique (RS256/EdDSA).

## Endpoint créé

```http
GET /api/boarding/offline-capabilities
```

| Propriété | Valeur V1 |
|-----------|-----------|
| Auth | **Aucune** (public) |
| Données sensibles | Aucune |
| `offlineValidation.supported` | `false` |
| `reason` | `ASYMMETRIC_SIGNATURE_NOT_ENABLED` |
| `currentAlgorithm` | `HS256` |
| `canVerifySignatureOffline` | `false` |
| `serverValidation.recommendedMode` | `ONLINE_FIRST` |

## Limites HS256

Le mobile peut **décoder** le payload JWT (base64url) mais **ne peut pas** vérifier la signature sans le secret serveur. Exposer le secret est interdit.

## Choix online-first

Tant que `supported: false`, le flux chauffeur doit utiliser :

- `POST /api/boarding/consume` (scan + embarquement + anti double-scan),
- éventuellement `POST /api/boarding/validate` pour pré-contrôle admin.

## Stratégie future asymétrique

Ticket ultérieur (hors S2-T6) :

- Signer avec clé privée backend,
- Publier JWKS / clé publique,
- Mobile vérifie offline,
- Sync scans + résolution conflits serveur.

Voir `docs/architecture/boarding-offline-validation-strategy.md`.

## Risques offline (rappel)

- Double scan entre appareils non évitable offline.
- Révocation et paiement non vérifiables sans serveur.
- Décodage JWT ≠ billet valide.

## Exclusions (respectées)

- Pas de migration RS256/EdDSA
- Pas de JWKS réel
- Pas de changement `verifyBoardingToken` / consume / validate
- Pas de Prisma / sync / mobile / stockage offline

## Tests

```bash
node backend/scripts/s2-t6-offline-capabilities-test.mjs
```

## Références

- Runbook : `docs/runbooks/boarding-offline-mode.md`
- OpenAPI : `BoardingOfflineCapabilitiesResponse`
