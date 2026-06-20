# WEB-AUDIT-01 — Audit portail passager avant refonte

**Ticket :** WEB-AUDIT-01  
**Feature :** Passenger Web Experience  
**Phase BMAD :** VERIFY (audit only)  
**Date :** 2026-06-19  
**Environnement :** `http://localhost:5174` · captures `docs/qa/WEB-AUDIT-01-screenshots/`  
**Compte test :** `passenger15@sharinggo.demo`  
**Verdict :** **Fonctionnel V1** — **expérience web immature** (shell mobile-first non adapté desktop)  
**Code modifié :** aucun  
**Commit :** aucun

---

## 1. Résumé exécutif

Le portail passager SharingGO sur `:5174` **remplit le parcours métier V1** : découverte ligne, liste créneaux, détail trajet, réservation/paiement, liste billets, détail, QR embarquement. Le design system noir + `#22c55e` est globalement respecté.

En revanche, l’expérience actuelle est une **application mobile portée sur le web** plutôt qu’une **plateforme web convoyeur** :

| Dimension | État actuel | Vision cible |
|-----------|-------------|--------------|
| Navigation | **Bottom tab bar** fixe sur tous les breakpoints | Header web + nav horizontale ; bottom nav **mobile uniquement** |
| Desktop | Colonne étroite centrée (`max-w-lg` → `max-w-6xl`) sans changement de patron | Layout multi-colonnes, landing pleine largeur, listes en tableau/grille |
| Produit | Messages « prochainement », abonnements affichés mais non activables | Parcours ticket + abonnement alignés CDC V1 |
| Auth | Incohérence Google-only (profil) vs email+password (login) | Parcours unifié, OAuth Google obligatoire convoyeur + fallback admin/dev documenté |
| Langue | Mélange FR / EN (`Succeeded`, `Confirmée`) | UI 100 % français côté passager |

**Recommandation CTO :** valider une refonte **shell + navigation web** (P0) avant polish visuel. Ne pas toucher au backend ni au flux pending/Stripe dans un premier ticket.

---

## 2. Inventaire des pages auditées

| Route | Capture | État session | Analysée |
|-------|---------|--------------|----------|
| `/` | `web-audit-01-home.png` | Public | ✅ |
| `/trips` | `web-audit-02-trips.png`, `02b-trips-slots.png` | Public / connecté | ✅ |
| `/trips/:id` (passé) | `web-audit-03-trip-detail.png` | Public | ✅ |
| `/trips/:id` (futur) | `web-audit-03b-trip-detail-future.png` | Connecté | ✅ |
| `/login` | `web-audit-04-login.png` | Public | ✅ |
| `/register` | `web-audit-05-register.png` | Public | ✅ |
| `/profile` (déco) | `web-audit-06-profile-logged-out.png` | Public | ✅ |
| `/profile` (connecté) | `web-audit-10-profile-logged-in.png` | Connecté | ✅ |
| `/bookings` (À venir) | `web-audit-07-bookings.png` | Connecté | ✅ |
| `/bookings` (Passées) | `web-audit-07b-bookings-past-empty.png` | Connecté | ✅ |
| `/bookings/:id` | `web-audit-08-booking-detail.png` | Connecté | ✅ |
| `/bookings/:id/boarding-pass` | `web-audit-09-boarding-pass.png`, `09b-boarding-pass-qr.png` | Connecté | ✅ |
| `/bookings/payment/success` | `web-audit-11-payment-success.png` | Connecté | ✅ |
| `/bookings/payment/cancel` | `web-audit-12-payment-cancel.png` | Connecté | ✅ |
| `*` (404) | `web-audit-13-not-found.png` | Public | ✅ |
| `/bookings/pending/:id` | — | — | ⚠️ **Code existant, capture absente** (audit code `PendingReservationPage.tsx`) |

**Couverture captures :** 16/17 écrans (94 %). Pending documenté par lecture code uniquement.

---

## 3. Problèmes UX/UI par page

### 3.1 `/` — Landing (`web-audit-01-home.png`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Hero mobile-only | P1 | Above-the-fold = titre + 2 CTA ; sections marketing (ligne, tarifs, FAQ) sous scroll — OK mobile, **faible impact desktop** sans layout large |
| Bottom nav sur landing marketing | P0 | Tab bar applicative sur une page **acquisition** — atypique pour un site web |
| CTA secondaire « Comment ça fonctionne » | P2 | Ancre scroll OK ; pas de preuve sociale / horaires du jour |
| Footer absent | P2 | Pas de liens légaux, contact, mention ligne unique |

**Points positifs :** ton sobre, ligne unique claire, badge « Navette professionnelle », CTA vert lisible.

---

### 3.2 `/trips` (`02-trips`, `02b-trips-slots`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Liste créneaux en cartes empilées | P1 | BlaBlaCar-like mais **une colonne** même sur grand écran ; pas de vue tableau horaire |
| Filtres date (Aujourd’hui / Demain / Date) | P2 | Boutons compacts ; état actif peu contrasté sur capture initiale |
| Bloc « Abonnements bientôt disponibles » | P1 | **Contradiction produit** : tarifs landing affichent 30 € / 40 € |
| Trust block répétitif | P2 | « Bon à savoir » + carte ligne + prix = redondance avec landing |
| Créneaux passés désactivés | P2 | Bouton « Passé » grisé — correct métier, peu d’explication |

**Points positifs :** places réservées visibles, prix 8 € répété, lien « Voir le trajet » clair.

---

### 3.3 `/trips/:id` — Détail (`03-trip-detail`, `03b-trip-detail-future`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Barre flottante prix + CTA | P1 | Pattern mobile (sticky bottom) **recouvre le contenu** ; sur desktop devrait être colonne latérale ou header d’action |
| Trajet passé : CTA mort | P2 | « Trajet passé » disabled — OK mais aucune alternative (autres créneaux) |
| Trajet futur : « Réserver ma place » | ✅ | CTA principal visible, badge « Disponible » vert |
| Infos places / horaires | P2 | Contenu riche mais **sous la barre flottante** sur petit viewport |
| Pas de sens aller-retour explicite | P2 | CDC : deux sens ; UI mélange libellés `↔` et `→` |

**Points positifs :** structure carte horaire / places / tarif / « Ce qu’il faut savoir » conforme DESIGN.md.

---

### 3.4 `/login` (`04-login`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Layout auth séparé (sans bottom nav) | ✅ | `AuthLayout` — cohérent |
| Hint demo visible | P2 | Bloc `passenger15@…` — **à masquer en prod** (composant DEV) |
| Google + email/password | P1 | **Écart CDC** : convoyeur = Google OAuth obligatoire ; email utile QA mais brouille le message produit |
| Pas de lien mot de passe oublié | P2 | — |

**Points positifs :** formulaire lisible, séparateur OU, lien register.

---

### 3.5 `/register` (`05-register`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Formulaire long (5 champs) | P2 | Scroll nécessaire ; pas de progress |
| Pas de Google OAuth sur register | P1 | Incohérent avec règle « convoyeur Google » |
| Pas de honeypot / Turnstile visible | P1 | **Écart security-baseline** (inscription) — hors scope UI mais bloquant prod |

---

### 3.6 `/profile` (`06`, `10`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Déconnecté : bouton « Se connecter avec Google » uniquement | P0 | Libellé **mensonger** : lien vers `/login` qui propose aussi email/password |
| Connecté : fiche minimale | P1 | Nom + email + logout — **pas d’abonnement actif**, historique, Mosolf, préférences |
| Pas d’accès login depuis header | P2 | Utilisateur perdu si onglet Profil sans session |

---

### 3.7 `/bookings` (`07`, `07b`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Statut paiement en anglais | P1 | `Succeeded` au lieu de « Réussi » / « Payé » |
| Cartes très denses | P2 | Beaucoup de lignes (ligne, montant, paiement) — lisible mobile, lourde desktop |
| Onglets À venir / Passées / Toutes | ✅ | Bon pattern ; passées montrent badge « Utilisée » |
| Pas de CTA boarding direct | P2 | « Voir le billet » → détail → boarding ; **2 clics** pour QR |

---

### 3.8 `/bookings/:id` (`08-booking-detail`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Grille statut / référence | ✅ | Badge « Confirmée », ref courte `CMQJ9LU6` |
| CTA « Voir mon billet » | ✅ | Chemin vers QR |
| Sections Trajet / Paiement / Réservation | P2 | Bonne structure ; **sous le fold** sur mobile |
| Pas d’actions annulation | P2 | Mention FAQ landing seulement |

---

### 3.9 `/bookings/:id/boarding-pass` (`09`, `09b`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| QR conforme DESIGN.md | ✅ | Fond blanc, contraste scan, consigne chauffeur |
| Countdown lisible | ✅ | « Valide encore 2 j 17 h 41 min » |
| QR hors premier écran | P1 | Scroll requis — **acceptable mobile**, à centrer viewport sur desktop |
| Bouton « Actualiser le QR » | ✅ | Utile TTL / erreur réseau |
| Bottom nav pendant scan embarquement | P2 | Distraction ; plein écran recommandé au moment scan |

---

### 3.10 `/bookings/payment/success` (`11`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Double titre « Paiement reçu » | P2 | Répétition header + carte |
| Mention « reçu Stripe » | P1 | **Jargon** côté convoyeur (anti-référence startup) |
| Polling / attente 30 s | ✅ | Attente webhook documentée — bon pour QA |
| Bottom nav sur état transitoire | P2 | L’utilisateur peut naviguer ailleurs pendant confirmation |

---

### 3.11 `/bookings/payment/cancel` (`12`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Message 2 min pending | ✅ | Aligné règle métier |
| CTA retour trajets | ✅ | — |
| Pas de lien direct vers pending actif | P1 | Devrait deep-link `/bookings/pending/:id` si session connue |

---

### 3.12 404 (`13-not-found`)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Hors `PassengerLayout` | ✅ | Pas de bottom nav — **plus web-like** |
| Wording « application convoyeur » | P2 | Ton app mobile vs « site » |
| Pas de liens secondaires (trajets, support) | P2 | — |

---

### 3.13 `/bookings/pending/:id` (audit code, pas de capture)

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Page critique non documentée visuellement | P1 | Countdown 2 min + checkout Stripe — **cœur du parcours** |
| Logique riche (`usePendingCountdown`, cancel, checkout) | ✅ | Implémentation présente |
| **Recommandation QA** | — | Ajouter capture `web-audit-14-pending.png` avant refonte |

---

## 4. Problèmes produit (transverses)

| # | Problème | Impact | Référence |
|---|----------|--------|-----------|
| P-01 | **Shell unique mobile** : même bottom nav sur landing, trajets, QR | Empêche positionnement « plateforme web » | `PassengerLayout.tsx`, `BottomNavigation.tsx` |
| P-02 | **Messages « prochainement »** alors que réservation/paiement fonctionnent | Confiance ↓, taux conversion ↓ | `PricingSection.tsx` L45-48, `TripsPage` abonnements |
| P-03 | **Abonnements affichés (30 € / 40 €) sans parcours** | Attente CDC V1 non satisfaite | `landing-content.ts`, PRODUCT.md |
| P-04 | **Auth incohérente** profil vs login | Friction, non-conformité OAuth convoyeur | `ProfilePage.tsx` L38-40 vs `LoginPage.tsx` |
| P-05 | **Rôle « convoyeur »** partout (header, 404, profil) | Correct CDC ; à nuancer si vision « client web » plus large | `PassengerHeader.tsx` |
| P-06 | **Pas de différenciation** passager / chauffeur / admin dans l’UI | Architecture « même compte, interface différente » **non visible** côté passager | Vision produit ticket |
| P-07 | **Anglicismes techniques** (`Succeeded`) | Non professionnel pour convoyeurs FR | `BookingCard` / serializers |
| P-08 | **Parcours QR à 2+ clics** depuis liste réservations | Friction embarquement terrain | `BookingsPage` → détail → boarding |
| P-09 | **Google OAuth** bouton profil mais register email-first | Parcours d’onboarding fragmenté | router + pages auth |

---

## 5. Problèmes responsive

### 5.1 Mobile (≤ 640px) — **bon**

- Touch targets ≥ 44px (`min-h-touch`)
- Safe areas (`env(safe-area-inset-*)`)
- Cartes pleine largeur lisibles
- Bottom nav accessible au pouce

### 5.2 Tablette / desktop (≥ 768px) — **insuffisant**

| Observation | Détail |
|-------------|--------|
| **Largeur seule évolue** | `passengerShellWidthClass` : `max-w-lg` → `max-w-6xl` — contenu **s’élargit** mais patron reste **1 colonne + bottom nav** |
| **Pas de navigation header** | Aucun lien Trajets / Réservations / Connexion dans `PassengerHeader` |
| **Bottom nav desktop** | 4 onglets centrés en bas — **anti-pattern web** (GitHub, BlaBlaCar web, SNCF utilisent top nav) |
| **Landing non marketing desktop** | Sections empilées ; pas de hero split image/texte, pas de grilles 3 colonnes visibles sur capture mobile |
| **Listes trajets** | 8 créneaux/jour en cartes verticales → scroll long sur desktop |
| **Two-column préparé mais sous-utilisé** | `passengerTwoColumnClass` existe ; boarding/détail restent colonne unique visuellement |

### 5.3 Capture context

Toutes les captures sont en **viewport mobile (~390px)**. Le comportement desktop réel n’a pas été screenshoté ; l’audit code confirme que **les breakpoints n’introduisent pas un shell web alternatif**.

---

## 6. Audit explicite — Navbar mobile-like

### État actuel

```
PassengerLayout
├── PassengerHeader (sticky top) — logo + sous-titre + route
├── <main> — contenu
└── BottomNavigation (fixed bottom) — 4 tabs TOUS breakpoints
```

**Fichiers :** `BottomNavigation.tsx`, `BOTTOM_NAV_ITEMS` dans `types/routes.ts`.

| Critère | Verdict |
|---------|---------|
| Mobile | ✅ Adapté |
| Tablette | ⚠️ Acceptable mais redondant avec header vide |
| Desktop | ❌ **Non conforme vision « vraie plateforme web »** |
| Landing `/` | ❌ Tab bar sur page marketing |
| Auth `/login` | ✅ Exclue (`AuthLayout`) |
| 404 | ✅ Exclue |

### Vision cible (recommandée)

| Viewport | Navigation |
|----------|------------|
| `< md` | Conserver bottom nav **ou** drawer + header compact |
| `≥ md` | **Top nav** : Logo · Trajets · Mes réservations · Aide · Profil/Connexion |
| `≥ lg` | Landing **sans** tab bar ; footer site |

**Éléments header web cibles :**

- État auth (connecté / invité)
- Lien direct « Réserver » → `/trips`
- Pas de duplication « Châlons ↔ Vatry » seule à droite sans action

---

## 7. Analyse par thème demandé

| Thème | Constat | Note /10 |
|-------|---------|----------|
| **1. Cohérence SharingGO** | Palette OK ; ton pro ; incohérences copy (prochainement, Stripe, EN) | 6/10 |
| **2. Qualité web desktop** | Colonne élargie sans refonte patron | 3/10 |
| **3. Qualité mobile** | Solide, flux réservation utilisable | 8/10 |
| **4. Navigation** | Bottom nav omniprésente | 4/10 |
| **5. Landing** | Contenu complet (code) ; hero faible au premier écran | 6/10 |
| **6. Parcours réservation** | Trajets → détail → pending → Stripe → success → bookings | 7/10 |
| **7. Paiement** | Success/cancel clairs ; jargon Stripe | 7/10 |
| **8. Billet / QR** | Conforme ; QR sous scroll | 8/10 |
| **9. Profil** | Minimal ; auth incohérente | 4/10 |
| **10. Lisibilité prix** | 8 € visible partout | 8/10 |
| **11. Abonnements** | Affichés, non activables | 2/10 |
| **12. Navbar mobile-like** | Bloquant refonte web | — |
| **13. Écart vision cible** | App étirée ≠ plateforme web | Écart majeur |

---

## 8. Recommandations

### 8.1 Principes refonte

1. **Séparer marketing shell et app shell** — landing/footer web ; espace connecté avec nav applicative.
2. **Navigation responsive** — bottom nav `md:hidden` ; top nav `hidden md:flex`.
3. **Unifier l’auth** — Google primaire convoyeur ; email réservé dev/QA derrière flag.
4. **Aligner les copies** sur l’état réel V1 (réservation ouverte, abonnements « bientôt » ou CTA réel).
5. **Français intégral** — mapping statuts API → libellés FR.
6. **QR en 1 clic** depuis liste « À venir » (bouton « Afficher QR » si CONFIRMED).
7. **Capturer + tester desktop** 1280px et 1440px avant validation refonte.

### 8.2 Ne pas faire dans la refonte UI

- Changer le backend booking / Stripe / JWT
- Multi-lignes, panier, notifications V2
- Portail B2B entreprise

---

## 9. Découpage futur — tickets WEB-REFONTE

| Ticket | Scope | Dépendances |
|--------|-------|-------------|
| **WEB-REFONTE-01** | Shell responsive : `WebHeader`, bottom nav `md:hidden`, layouts marketing vs app | — |
| **WEB-REFONTE-02** | Landing desktop : hero split, grilles tarifs 3 col, footer | WEB-REFONTE-01 |
| **WEB-REFONTE-03** | Page `/trips` : grille horaire desktop + filtres date améliorés | WEB-REFONTE-01 |
| **WEB-REFONTE-04** | `/trips/:id` : layout 2 colonnes (infos + CTA sticky latéral desktop) | WEB-REFONTE-01 |
| **WEB-REFONTE-05** | Auth unifiée : profil/login/register, OAuth Google, copy CDC | — |
| **WEB-REFONTE-06** | `/bookings` + détail : statuts FR, CTA QR direct, table desktop | WEB-REFONTE-01 |
| **WEB-REFONTE-07** | Boarding pass plein écran / focus QR, countdown hero | WEB-REFONTE-04 |
| **WEB-REFONTE-08** | Paiement success/cancel : copy FR, lien pending, moins jargon Stripe | — |
| **WEB-REFONTE-09** | `/bookings/pending/:id` : UX countdown 2 min, capture QA, stress mobile | — |
| **WEB-REFONTE-10** | Abonnements : CTA ou retrait landing jusqu’à Stripe Billing prêt | produit |
| **WEB-REFONTE-11** | Profil enrichi : abonnement actif, type Mosolf, support | backend abos |
| **WEB-REFONTE-12** | 404 + pages système : shell cohérent, liens utiles | WEB-REFONTE-01 |
| **WEB-REFONTE-13** | Accessibilité : contrastes AA, focus, aria onglets | transversal |
| **WEB-REFONTE-14** | Polish motion (`emil-design-eng`) : transitions 150–250ms | finition |

---

## 10. Priorités

### P0 — Bloquant perception « plateforme web »

| ID | Item |
|----|------|
| P0-1 | Remplacer bottom nav par top nav ≥ `md` |
| P0-2 | Exclure bottom nav de la landing `/` |
| P0-3 | Corriger incohérence auth profil (libellé + parcours) |
| P0-4 | Supprimer / corriger messages « prochainement » si flux live |
| P0-5 | Capturer et auditer `/bookings/pending/:id` |

### P1 — Important conversion / confiance

| ID | Item |
|----|------|
| P1-1 | Layout desktop trajets (grille horaire) |
| P1-2 | CTA QR direct depuis liste réservations |
| P1-3 | Statuts et paiements 100 % FR |
| P1-4 | Détail trajet : barre flottante → layout desktop |
| P1-5 | Retirer hint demo prod ; flag `import.meta.env.DEV` |
| P1-6 | Payment cancel → lien pending |

### P2 — Polish / dette

| ID | Item |
|----|------|
| P2-1 | Footer landing (légal, contact) |
| P2-2 | Réduire redondance route (3× même libellé) |
| P2-3 | Register : alignement OAuth ou message unique |
| P2-4 | 404 wording « site » vs « application » |
| P2-5 | Profil : abonnement, préférences (quand backend prêt) |

---

## 11. Conclusion CTO

### Verdict

| Question | Réponse |
|----------|---------|
| Le portail est-il **utilisable** en l’état ? | **Oui** — parcours QA validé (réservation, paiement, QR, boarding admin) |
| Peut-il être présenté comme **plateforme web SharingGO** ? | **Non** — expérience **mobile app étirée** |
| Refonte nécessaire avant pilote convoyeurs desktop ? | **Oui** — au minimum **WEB-REFONTE-01** (shell + nav) |
| Backend à changer pour la refonte UI ? | **Non** pour P0/P1 |

### Décision recommandée

1. **Approuver** WEB-AUDIT-01 comme baseline documentée.  
2. **Prioriser** WEB-REFONTE-01 + 02 + 03 en premier sprint refonte.  
3. **Geler** les copies contradictoires (« prochainement ») dans un hotfix copy **sans refonte** si marketing externe imminent.  
4. **Ne pas** lancer refonte visuelle globale avant décision navigation web (atelier 1 h suffit).

### Risques si pas de refonte

- Convoyeurs pro sur laptop : perception « prototype mobile »  
- SEO / crédibilité entreprise Mosolf  
- Dette navigation empêche portail B2B futur sur même design system

---

## 12. Références

| Ressource | Chemin |
|-----------|--------|
| Captures | `docs/qa/WEB-AUDIT-01-screenshots/` (17 PNG) |
| Router | `frontend/apps/passenger/src/app/router.tsx` |
| Layout shell | `frontend/apps/passenger/src/components/layout/` |
| Tokens layout | `frontend/apps/passenger/src/lib/passenger-layout.ts` |
| Produit | `PRODUCT.md`, `DESIGN.md` |
| CDC | `docs/CAHIER_DES_CHARGES.md` |

---

*Audit réalisé sans modification de code ni commit — prêt pour cadrage WEB-REFONTE.*
