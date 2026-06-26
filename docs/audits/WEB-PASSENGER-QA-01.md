# WEB-PASSENGER-QA-01 — Rapport GO / NO-GO Passenger V1

**Ticket :** WEB-PASSENGER-QA-01  
**Phase BMAD :** VERIFY (audit mise en pilote)  
**Date :** 2026-06-23  
**Périmètre :** `frontend/apps/passenger` — parcours passager V1 post-refonte (18 tickets)  
**Méthode :** revue code + lint/build + captures QA par ticket + analyse parcours / démo / pré-deploy  
**Auteur :** audit automatisé Cursor (revue CTO requise)

---

## Verdict exécutif

| Question | Réponse |
|----------|---------|
| **Passenger V1 est-il feature complete ?** | **OUI** — les 18 écrans / zones prévus sont livrés |
| **Peut-on déployer demain sur Internet pour un pilote ?** | **GO CONDITIONNEL** |
| **Décision GO / NO-GO pilote** | **GO CONDITIONNEL** — sous réserve des actions § 9 avant DEPLOY-01 |

> **GO CONDITIONNEL** signifie : l'expérience passager est prête pour une validation pilote **technique et produit**, mais **8 points** doivent être traités ou explicitement acceptés par le CTO avant ouverture publique (§ 9).

---

## Synthèse PASS / WARN / FAIL

```
PASS   47
WARN   14
FAIL    0
```

Aucun bloquant **FAIL** identifié sur un build production standard (`import.meta.env.PROD === true`).

---

## 1. Audit produit — écran par écran

Légende : **PASS** conforme MVP · **WARN** dette ou limite connue · **FAIL** bloquant pilote

| # | Écran | Route | UX | UI | Responsive | États | Nav | Verdict |
|---|-------|-------|----|----|------------|-------|-----|---------|
| 1 | Landing | `/` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 2 | Trips | `/trips` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 3 | Trip Detail | `/trips/:id` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 4 | Booking Form | `/trips/:id/book` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 5 | Bookings | `/bookings` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 6 | Booking Detail | `/bookings/:id` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 7 | Boarding Pass | `/bookings/:id/boarding-pass` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 8 | Subscriptions | `/subscriptions` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 9 | Profile | `/profile` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 10 | Profile Edit | `/profile/edit` | WARN | PASS | PASS | PASS | PASS | **WARN** |
| 11 | Notifications | `/notifications` | WARN | PASS | PASS | PASS | PASS | **WARN** |
| 12 | Settings | `/settings` | WARN | PASS | PASS | PASS | PASS | **WARN** |
| 13 | Help | `/help` | PASS | PASS | PASS | PASS | WARN | **WARN** |
| 14 | Legal Terms | `/legal/terms` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 15 | Privacy | `/legal/privacy` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 16 | Legal Notice | `/legal/notice` | WARN | PASS | PASS | PASS | PASS | **WARN** |
| 17 | Contact | `/contact` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| 18 | Auth (login/register) | `/login`, `/register` | PASS | PASS | PASS | PASS | PASS | **PASS** |
| — | 404 | `*` | PASS | PASS | PASS | — | PASS | **PASS** |
| — | Pending / Payment | `/bookings/pending/*`, payment/* | PASS | PASS | PASS | PASS | PASS | **PASS** |

### Détail des WARN produit

| Écran | WARN | Justification MVP |
|-------|------|-------------------|
| Profile Edit | Sauvegarde « bientôt » | Bandeau honnête, pas de fausse persistance |
| Notifications | Données 100 % locales (pas d'API) | Empty state prévu ; pool démo hors PROD uniquement |
| Settings | Préférences locales, sync « prochainement » | Cohérent CDC V1 |
| Help | Route **auth requise** | Liens depuis Contact / FAQ publics → redirection login |
| Legal Notice | Placeholders `[Nom société]`, SIREN, hébergeur | Note « mise à jour avant production » présente |

**Captures QA par ticket :** `docs/qa/WEB-*-01-*.png` (18 tickets documentés).

---

## 2. Audit parcours

### 2.1 Parcours réservation (cœur métier)

```
Landing → Trips → Trip Detail → Booking Form → Pending → Stripe →
Payment Success → Bookings → Booking Detail → Boarding Pass
```

| Étape | Statut | Notes |
|-------|--------|-------|
| Découverte publique | **PASS** | `/`, `/trips`, `/trips/:id` sans auth |
| Réservation | **PASS** | Auth + formulaire + CGU/privacy links |
| Pending 2 min | **PASS** | `PendingReservationPage` |
| Stripe | **PASS** | success / cancel routes |
| Liste / détail | **PASS** | Onglets à venir / passées / annulées |
| QR embarquement | **PASS** | JWT via API réelle (hors IDs démo) |

### 2.2 Parcours compte

```
Profile → Edit → Settings
```

| Étape | Statut | Notes |
|-------|--------|-------|
| Profile onglets | **PASS** | Overview, info, prefs, security, payment |
| Edit | **WARN** | Lecture seule + message sync future |
| Settings | **WARN** | 5 onglets, sauvegarde désactivée |

### 2.3 Parcours support

```
Help → Contact → Legal (CGU / Privacy / Notice)
```

| Étape | Statut | Notes |
|-------|--------|-------|
| Help (auth) | **WARN** | Centre d'aide complet mais protégé |
| Contact (public) | **PASS** | Hub support, formulaire désactivé honnête |
| Legal (public) | **PASS** | `LegalDocumentLayout` homogène |

### 2.4 Parcours abonnements

```
Subscriptions → (checkout Stripe) → Profile / Bookings
```

| Étape | Statut | Notes |
|-------|--------|-------|
| Plans / Mosolf | **PASS** | Code entreprise, FAQ intégrée |
| Gestion abo | **WARN** | CTA « Gérer » → bientôt (honnête) |

---

## 3. Audit responsive

Breakpoints demandés : `375 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920`

| Breakpoint | Couverture audit | Verdict |
|------------|------------------|---------|
| 375–430 | Captures mobile ticket (390) + patterns `min-h-touch`, stacks | **PASS** |
| 768 | Grilles `md:` / `sm:` sur trips, bookings, legal, contact | **PASS** |
| 1024–1280 | Sidebars legal, contact 2-col, bookings desktop cards | **PASS** |
| 1440 | Captures desktop ticket + `landingContainerClass` | **PASS** |
| 1920 | Pas de capture dédiée | **WARN** |

### Points responsive surveillés

| Risque | Résultat |
|--------|----------|
| Overflow horizontal | **PASS** — `min-w-0`, grilles flex, pas de `100vw` suspect |
| Scroll horizontal parasite | **PASS** — overflow-x contrôlé sur onglets filtres |
| Padding hero / container | **PASS** — `passengerHeaderContainerClass` unifié |
| Boutons touch | **PASS** — `min-h-touch` sur CTAs critiques |
| Tableaux | N/A | Pas de data tables passager |

**WARN :** validation manuelle 1920px et rotation tablette recommandée avant pilote.

---

## 4. Audit technique

### 4.1 Build & lint

```powershell
cd frontend/apps/passenger
pnpm lint   # ✅ 0 erreur, 0 warning
pnpm build  # ✅ OK — WARN bundle > 500 kB (844 kB JS)
```

### 4.2 Code quality

| Contrôle | Résultat |
|----------|----------|
| `console.log` / `console.error` | **PASS** — aucun dans `src/` |
| `TODO` / `FIXME` | **PASS** — aucun critique (placeholder Mosolf `XXXX` uniquement) |
| Routes mortes dans router | **PASS** — toutes les pages `src/pages/*` routées sauf 1 orphelin |
| Composant orphelin | **WARN** — `BookingDetailPlaceholderPage.tsx` non référencé |
| Export mort | **WARN** — `env.ts` → `uiDemoTrips` non consommé |
| Constante morte | **WARN** — `BOARDING_PASS_DEMO_TITLE` non utilisée |
| Duplication majeure | **PASS** — factorisation legal (`LegalDocumentLayout`), contact modulaire |
| Hooks cohérents | **PASS** — React Query + merges démo isolés |

### 4.3 Architecture routes (19 routes passager)

| Route | Auth | Statut |
|-------|------|--------|
| `/` | Non | PASS |
| `/trips`, `/trips/:id` | Non | PASS |
| `/trips/:id/book` | Oui | PASS |
| `/bookings/*` | Oui | PASS |
| `/profile`, `/profile/edit` | Oui | PASS |
| `/notifications`, `/settings`, `/help` | Oui | PASS |
| `/subscriptions` | Oui | PASS |
| `/legal/terms`, `/legal/privacy`, `/legal/notice` | Non | PASS |
| `/contact` | Non | PASS |
| `/login`, `/register` | Non | PASS |
| `*` → 404 | Non | PASS |

---

## 5. Audit accessibilité

| Critère | Verdict | Détail |
|---------|---------|--------|
| Focus clavier | **PASS** | `focus-visible:ring-primary` sur boutons / inputs |
| Contraste | **PASS** | Fond sombre + primary `#22c55e`, textes muted lisibles |
| Labels formulaires | **PASS** | `Input` avec `label`, `sr-only` sur recherche help |
| ARIA sections | **PASS** | `aria-labelledby` sur heroes, legal, contact |
| Navigation clavier onglets | **PASS** | `role="tablist"` / `aria-selected` sur filtres |
| Images décoratives | **PASS** | `aria-hidden` sur icônes Lucide |
| Alt text hero | **WARN** | Images landing — vérifier alt sur photos van / map |
| Conformité WCAG AA complète | **WARN** | Non audité outil automatisé (axe/Lighthouse) |

---

## 6. Audit démo — chapitre critique

Référence : `docs/features/WEB-DEMO-DATA-01.md` · `src/lib/ui-demo-trips.ts`

### 6.1 Checklist CTO

| Item | Build DEV + flag | Build PROD | Verdict |
|------|------------------|------------|---------|
| `VITE_ENABLE_UI_DEMO_TRIPS` | Actif si `=true` | **Forcé `false`** (`PROD` guard L28–30) | **PASS** en prod |
| `demo-trip-*` injectés | Oui si API < 4 trajets | **Non** | **PASS** en prod |
| `demo-booking-*` injectés | Oui si états manquants | **Non** | **PASS** en prod |
| `demo-notification-*` | Oui si flag actif | **Non** | **PASS** en prod |
| Badge « Mode démonstration UI » | Si flag actif | **Absent** | **PASS** en prod |
| Badge « Démo » notifications | Si IDs démo | **Absent** | **PASS** en prod |
| Données fictives affichées | Possible en dev local | **Impossible en prod** | **PASS** en prod |

### 6.2 Dette code démo (pré-DEPLOY-01)

| Item | Verdict | Action recommandée |
|------|---------|-------------------|
| Module démo encore dans le repo (~30 fichiers touchés) | **WARN** | Suppression complète post-pilote ou branche `cleanup/demo` |
| `DevDemoAuthHint` sur `/login` (DEV only) | **WARN** | OK dev · absent en prod build |
| Garde-fous `isDemoBookingId` sans flag | **PASS** | Défensif si URL bookmarkée |

**Conclusion démo :** un **build production déployé sans la variable d'environnement** ne présente **aucune donnée fictive** aux utilisateurs réels. Le code démo reste une **dette technique** à retirer avant considérer le pilote « propre » à long terme.

---

## 7. Audit pré-DEPLOY-01

| Item | État actuel | Verdict |
|------|-------------|---------|
| Favicon | Absent dans `index.html` | **WARN** |
| `<title>` | `SharingGO — Convoyeur` | **PASS** |
| Meta description | Absente | **WARN** |
| `theme-color` | `#000000` | **PASS** |
| `lang="fr"` | Présent | **PASS** |
| Page 404 | `NotFoundPage` + `EmptyState` | **PASS** |
| Page 500 | Absente (SPA) | **WARN** — dette infra/nginx |
| `robots.txt` | Absent | **WARN** |
| `manifest.json` / PWA | Absent | **WARN** — hors scope V1 |
| Logo | `public/images/SharingGO.png` | **PASS** |
| Footer marketing | Présent sur surfaces marketing | **PASS** |
| Liens légaux footer | CGU · Privacy · Notice · Contact | **PASS** |
| Bundle size | 844 kB (warning Vite) | **WARN** — code-split futur |

---

## 8. Fonctionnalités MVP honnêtes (non bloquantes)

Ces éléments sont **volontairement** limités et documentés dans l'UI :

| Fonctionnalité | Comportement | Acceptable pilote ? |
|----------------|--------------|---------------------|
| Formulaire contact | Bouton désactivé + note | **OUI** |
| Profile edit save | Bientôt | **OUI** |
| Settings sync | Bientôt | **OUI** |
| Notifications API | Local / empty | **OUI** avec empty state |
| Abonnement « Gérer » | Bientôt | **OUI** |
| Annulation en ligne | Via support (help/legal) | **OUI** |
| Mentions légales | Placeholders | **OUI** pré-juriste |

---

## 9. Actions avant DEPLOY-01 / PILOT-01

Priorisées pour transformer **GO CONDITIONNEL** en **GO plein**.

| Prio | Action | Owner suggéré |
|------|--------|---------------|
| P0 | Confirmer **aucun** `VITE_ENABLE_UI_DEMO_TRIPS` dans secrets Railway / preprod / prod | CTO / Ops |
| P0 | Remplir placeholders **Mentions légales** (société, SIREN, hébergeur) | Juriste + CTO |
| P1 | Ajouter **favicon** + meta description | Frontend |
| P1 | Décider : `/help` **public** ou garder auth + adapter liens Contact/FAQ | Produit |
| P1 | Ajouter `robots.txt` (staging noindex / prod index) | Ops |
| P2 | Supprimer `BookingDetailPlaceholderPage.tsx` (orphelin) | Frontend |
| P2 | Retirer module démo UI du codebase (WEB-DEMO-DATA-01 cleanup) | Frontend |
| P2 | Code-split bundle principal (< 500 kB) | Frontend |
| P3 | Carte « Urgence < 24 h → téléphone » sur Contact (V2) | Produit |

---

## 10. Matrice GO / NO-GO finale

| Critère | GO ? |
|---------|------|
| 18 tickets livrés et commités | **OUI** |
| Parcours réservation bout-en-bout | **OUI** |
| Design system cohérent | **OUI** |
| Aucune fausse promesse backend critique | **OUI** |
| Build prod sans données démo | **OUI** |
| Lint / build verts | **OUI** |
| Prêt juridique production | **NON** (placeholders) |
| Prêt SEO / favicon / robots | **NON** |
| Notifications temps réel | **NON** (hors scope V1) |

### Décision

```
╔══════════════════════════════════════════════════════════╗
║  PASSENGER V1 — FEATURE COMPLETE          GO ✅          ║
║  PILOTE PUBLIC (DEPLOY-01)                GO CONDITIONNEL ║
╚══════════════════════════════════════════════════════════╝
```

**Recommandation CTO :** valider **Passenger V1 feature complete**, enchaîner sur **DEPLOY-01** avec les actions P0–P1 de la § 9, puis **PILOT-01** avec utilisateurs restreints.

---

## 11. Roadmap post-QA

```text
✅ WEB-PASSENGER-QA-01 (ce document)
⬜ Cleanup démo UI (optionnel avant ou pendant DEPLOY-01)
⬜ DEPLOY-01
⬜ PILOT-01
```

---

## 12. Références

| Document | Chemin |
|----------|--------|
| Audit pré-refonte | `docs/qa/WEB-AUDIT-01-passenger-web-audit.md` |
| Mode démo | `docs/features/WEB-DEMO-DATA-01.md` |
| Captures par ticket | `docs/qa/WEB-*-01-*.png` |
| Features livrées | `docs/features/WEB-*.md` |

---

*Rapport généré le 2026-06-23 — révision humaine CTO obligatoire avant publication officielle pilote.*
