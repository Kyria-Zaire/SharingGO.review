# Runbook — mode offline embarquement (chauffeur)

**État actuel (S2-T6) : validation offline cryptographique non disponible.**

## Comportement terrain recommandé (V1)

1. Au lancement de l’app chauffeur, appeler :
   ```http
   GET /api/boarding/offline-capabilities
   ```
2. Si `offlineValidation.supported` est `false` :
   - **Avec réseau** : scanner le QR → `POST /api/boarding/consume` (admin auth).
   - **Sans réseau** : afficher un message clair du type *« Validation hors ligne non disponible — reconnectez-vous »*.
3. **Ne jamais** valider l’embarquement uniquement par décodage du JWT (payload lisible ≠ billet authentique).

## Ce qu’il ne faut pas faire

- Embarquer un passager sur `exp` décodé localement sans vérification de signature.
- Stocker `BOARDING_JWT_SECRET` ou tout secret serveur sur l’appareil.
- Présenter un écran « vert » offline comme équivalent à `consume` réussi.
- Ignorer `recommendedMode: ONLINE_FIRST` du manifest.

## Vérification rapide

```bash
curl -s http://localhost:3000/api/boarding/offline-capabilities | jq .
```

Attendu : `supported: false`, `currentAlgorithm: "HS256"`, `canVerifySignatureOffline: false`.

## Futur mode offline (hors scope V1)

Quand un ticket activera RS256/EdDSA + JWKS :

1. Télécharger / mettre en cache la **clé publique** (pas la privée).
2. Scanner → vérifier signature localement → stocker l’événement en file locale.
3. À la reconnexion : synchroniser vers le backend (`consume` ou API batch dédiée).
4. Gérer les conflits :
   - `BOARDING_ALREADY_USED` → afficher warning (UI S2-T5),
   - rejet serveur → marquer scan local comme rejeté + audit.
5. Resync révocations / rotation de clés selon politique produit.

## Incidents

| Symptôme | Action |
|----------|--------|
| App croit pouvoir valider offline | Vérifier manifest ; doit être `supported: false` |
| Fuite secret dans build mobile | Rotation `BOARDING_JWT_SECRET` + incident sécurité |
| Scans en double terrain | Normal en offline partiel ; serveur tranche à la sync |

## Contacts technique

- Architecture : `docs/architecture/boarding-offline-validation-strategy.md`
- Feature : `docs/features/S2-T6-offline-validation-preparation.md`
