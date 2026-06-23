# WEB-COPY-01 — Nettoyage UX copywriting FR (passager)

**Ticket :** WEB-COPY-01  
**Feature :** WEB-REFONTE-01 — Passenger Experience  
**Date :** 2026-06-23  
**Périmètre :** `frontend/apps/passenger` — textes visibles uniquement (pas de layout, navigation, API, métier)

---

## 1. Objectif

Préparer le pilote convoyeur en éliminant jargon technique, statuts API bruts, anglicismes et contradictions produit avant la refonte visuelle shell.

---

## 2. Fichiers créés

| Fichier | Rôle |
|---------|------|
| `src/constants/status-labels.ts` | Source unique des libellés statuts paiement / réservation / embarquement |
| `src/lib/user-facing-errors.ts` | Messages utilisateur et `formatUserFacingError()` |

---

## 3. Fichiers modifiés (copy)

### Infrastructure copy

- `src/lib/reservation-status.ts` — consomme `status-labels`, exporte `getPaymentStatusLabel`
- `src/lib/auth-errors.ts` — plus de fuite `error.message` non mappé
- `src/api/http.ts` — fallbacks FR (`requestFailed`, `network`)
- `src/api/auth.api.ts` — idem

### Pages

- `TripsPage.tsx`, `TripDetailPage.tsx`
- `BookingsPage.tsx`, `BookingDetailPage.tsx`
- `BoardingPassPage.tsx`, `PendingReservationPage.tsx`
- `PaymentSuccessPage.tsx`, `PaymentCancelPage.tsx`
- `ProfilePage.tsx`, `NotFoundPage.tsx`
- `App.tsx` (écran config Google)

### Composants / features

- `BookingCard.tsx` — statuts paiement mappés
- `PricingSection.tsx`, `landing-content.ts`
- `TripKnowBeforeYouGo.tsx`, `TripCard.tsx`, `ReservationEntryFooter.tsx`
- `TripsList.tsx` (loading aria)
- `Button.tsx` (loading)
- `DevDemoAuthHint.tsx`

### Hooks

- `useCreatePendingReservation.ts`, `useCreateCheckoutSession.ts`

### Constantes

- `constants/pricing.ts` — billet, abonnements

---

## 4. Mappings de statuts centralisés

### `PAYMENT_STATUS_LABELS`

| Code API | Libellé UI |
|----------|------------|
| `PENDING` | En attente |
| `SUCCEEDED` | Payé |
| `FAILED` | Échec du paiement |
| `REFUNDED` | Remboursé |
| `CANCELLED` / `CANCELED` (alias) | Annulé |

Fonction : `getPaymentStatusLabel(status)`.

### `RESERVATION_STATUS_LABELS`

| Code API | Libellé UI |
|----------|------------|
| `PENDING` | En attente |
| `CONFIRMED` | Confirmée |
| `CANCELED` | Annulée |
| `USED` | Utilisée |
| `EXPIRED` | Expirée |
| `COMPLETED` (alias) | Terminée |

Fonction : `getReservationStatusLabel(status)` + `getReservationStatusView()` (badge).

### `BOARDING_STATUS_LABELS`

| Code | Libellé UI |
|------|------------|
| `WAITING` | En attente |
| `WAITING_PASSENGERS` | En attente des passagers |
| `BOARDING` | Embarquement |
| `DEPARTED` | Parti |
| `COMPLETED` | Terminé |
| `READY` | Prêt |

Fonction : `getBoardingStatusLabel(status)` — prêt pour usage futur.

Statut inconnu : **« Statut inconnu »** (jamais d'enum brut).

---

## 5. Conventions de langage SharingGO

| Utiliser | Éviter |
|----------|--------|
| Réservation | booking, pending (en UI) |
| Trajet | trip |
| Billet | ticket (sauf nom produit interne) |
| Profil | user profile |
| Paiement | checkout, Stripe (utilisateur) |
| Abonnement | subscription |
| SharingGO | Sharing Go |
| Votre espace / en ligne | l'application (ton mobile) |
| Vouvoiement | tutoiement |

### Messages d'erreur (`USER_MESSAGES`)

- Réseau : « Connexion impossible. Vérifiez votre réseau… »
- Générique : « Une erreur est survenue. Veuillez réessayer. »
- Domaines : `tripsLoad`, `reservationsLoad`, `reservationLoad`, `boardingLoad`, `pendingLoad`, etc.

**Interdit en UI :** Request failed, Stripe Error, CORS, API Error, statuts enum bruts.

---

## 6. Corrections majeures (contradictions supprimées)

| Avant | Après |
|-------|-------|
| « Réservation et paiement prochainement » | « Réservez et payez en ligne dès maintenant… » |
| `payment.status.toLowerCase()` → `succeeded` | `getPaymentStatusLabel` → Payé |
| « Se connecter avec Google » (profil) | « Se connecter » |
| « Redirection vers Stripe… » | « Ouverture du paiement sécurisé… » |
| « reçu Stripe » | « confirmation de paiement » |
| « côté serveur » | « Nous finalisons votre réservation » |
| « Ta place est gardée » | « Votre place est réservée » |
| « Ticket » (labels UI) | « Tarif » / « Billet » selon contexte |
| « Sharing Go » | « SharingGO » |

---

## 7. Pages vérifiées

- [x] `/` — landing (sections tarifs, FAQ, how-it-works)
- [x] `/trips`, `/trips/:id`
- [x] `/bookings`, `/bookings/:id`, `/bookings/:id/boarding-pass`
- [x] `/bookings/pending/:id`
- [x] `/bookings/payment/success`, `/bookings/payment/cancel`
- [x] `/profile`, `/login`, `/register`
- [x] 404

### Reste connu (hors scope copy sans changement composant)

- Widget `@react-oauth/google` : libellé « Continue with Google » contrôlé par Google (lib tierce).
- `BookingDetailPlaceholderPage.tsx` : page non routée — non modifiée.

---

## 8. Décisions produit

1. **Paiement réussi** → libellé **Payé** (pas « Réussi ») côté passager.
2. **Auth profil** : CTA neutre « Se connecter » car parcours hybride Google + email.
3. **Stripe** : jamais nommé dans l'UI passager ; « paiement sécurisé » / « page de paiement ».
4. **Erreurs API** : message backend FR conservé si détecté ; sinon fallback `USER_MESSAGES`.
5. **Pas de package partagé admin** dans ce ticket — mapping local passager ; alignement futur possible avec `frontend/src/constants/statuses.ts`.

---

## 9. Qualité

```bash
cd frontend/apps/passenger
pnpm lint
pnpm build
```

---

*Documentation WEB-COPY-01 — voir commit associé sur demande CTO.*
