# Stratégie — validation offline embarquement (boarding)

Document d’architecture (S2-T6). **Aucun mode offline n’est activé en production V1.**

## Contexte

Le pipeline actuel (S2-T1 → S2-T5) repose sur :

- JWT boarding signé **HS256** avec `BOARDING_JWT_SECRET` (serveur uniquement),
- token opaque `Reservation.boardingToken` en base,
- validation et consommation **côté serveur**,
- anti double-scan transactionnel (`FOR UPDATE`).

Le mobile chauffeur futur doit savoir ce qu’il peut faire **sans réseau** sans créer de **fausse sécurité**.

## Pourquoi HS256 ne doit jamais être exposé au mobile

HS256 = HMAC avec secret partagé. Vérifier la signature offline implique que le mobile possède le même secret que le backend.

Conséquences si le secret fuit :

- forge de billets valides,
- contournement révocation / paiement / statut DB,
- fraude massive non détectable offline.

**Décision V1 :** le secret reste serveur ; `canVerifySignatureOffline: false`.

## Ce que le mobile peut faire offline aujourd’hui (sans secret)

| Action | Possible | Fiabilité |
|--------|----------|-----------|
| Lire structure JWT (3 segments base64url) | Oui | Cosmétique |
| Décoder le payload JSON (claims) | Oui | **Non fiable** sans vérif signature |
| Lire `exp` / `iat` dans le payload | Oui | Un attaquant peut forger un payload |
| Afficher un QR déjà encodé | Oui | Hors scope validation |

**Ne jamais embarquer un passager** sur la seule base d’un payload décodé non vérifié.

## Ce que le mobile ne peut pas garantir offline (V1)

| Contrôle | Pourquoi |
|----------|----------|
| Signature JWT | Nécessite secret HS256 ou clé publique asymétrique |
| Révocation (`boardingToken` DB) | État serveur |
| Double scan global | Nécessite `consume` + verrou DB |
| Paiement `SUCCEEDED` | Stripe + DB |
| Statut `CONFIRMED` / `USED` | DB |
| Trajet actif / fenêtre embarquement | DB + règles métier |

## Stratégie cible (ticket futur dédié)

1. **Migrer la signature** vers **RS256** ou **EdDSA**.
2. Backend signe avec **clé privée** (HSM / env sécurisé, jamais mobile).
3. Mobile vérifie avec **clé publique** via `GET /.well-known/jwks.json` ou endpoint dédié.
4. Conserver `bt` + checks serveur à la **synchronisation** des scans offline.
5. File d’attente locale : scans stockés → `POST` batch ou replay `consume` avec idempotence.

Payload JWT actuel (`sub`, `uid`, `tid`, `bt`, `iat`, `exp`, `typ`) peut rester stable ; seul l’algorithme et la distribution de clés changent.

## Limites inhérentes du mode offline

Même avec signature asymétrique vérifiée localement :

- **Double scan entre deux appareils** : impossible à empêcher entièrement offline ; seul le serveur tranche via `BOARDING_ALREADY_USED`.
- **Révocation** : nécessite resync périodique (liste de révocation / version de clé / TTL court).
- **Fraude réseau** : scans offline en attente peuvent être rejoués ; le serveur reste source de vérité à la sync.

## Mode recommandé V1 : ONLINE_FIRST

1. Appeler `GET /api/boarding/offline-capabilities` au démarrage.
2. Si `offlineValidation.supported === false` → scan via `POST /api/boarding/consume` (réseau requis).
3. Sans réseau → message utilisateur « validation hors ligne non disponible » (runbook).

## Manifest API

`GET /api/boarding/offline-capabilities` — public, sans données sensibles.

## Références

- `docs/features/S2-T6-offline-validation-preparation.md`
- `docs/runbooks/boarding-offline-mode.md`
- S2-T1 (JWT), S2-T3 (consume), S2-T5 (UI contract)
