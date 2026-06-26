# PRD — DEPLOY-READY-01 · Passenger Deploy Readiness (Hardening)

**Status :** BUILD · **P0 COMPLETE** · P1 en cours  
**Owner :** CTO / Engineering  
**Last updated :** 2026-06-23  
**Version :** v1.4  
**Phase BMAD :** BUILD (P1) → VERIFY → DONE  
**Prérequis :** Passenger V1 **FEATURE COMPLETE** · WEB-PASSENGER-QA-01 **GO CONDITIONNEL**

> Méthodologie : [`docs/methodology/BMAD.md`](../../methodology/BMAD.md)  
> Audit source : [`docs/audits/WEB-PASSENGER-QA-01.md`](../../audits/WEB-PASSENGER-QA-01.md)  
> Contexte produit : [`docs/CAHIER_DES_CHARGES.md`](../../CAHIER_DES_CHARGES.md)

---

# 1. Executive Summary

**DEPLOY-READY-01** est la **phase de hardening** entre la fin du développement fonctionnel passager et le déploiement infrastructure (**DEPLOY-01**).

Ce ticket **n'ajoute aucune fonctionnalité**. Il transforme un produit feature-complete et audité (PASS 47 · WARN 14 · FAIL 0) en un artefact **propre, stabilisé et prêt pour un premier pilote public**.

**Sortie explicite :** *« Produit prêt pour DEPLOY-01 »* — validée par le CTO après DoD complète.

**Posture Release Engineering (CTO — 2026-06-23) :** à partir de ce ticket, chaque livraison doit produire une **augmentation mesurable** de la qualité de mise en production — pas de nouvelle valeur fonctionnelle.

```text
Avant (Construction)          Maintenant (Release Engineering)
─────────────────────         ────────────────────────────────
+ Nouvelle page               − Dette technique
+ Nouveau parcours            + Robustesse · Sécurité
+ Nouvelle fonctionnalité     + Maintenabilité · Exploitabilité
```

**Documentation parallèle :** constitution du runbook [`docs/ops/DEPLOY-01-RUNBOOK.md`](../../ops/DEPLOY-01-RUNBOOK.md) pendant DEPLOY-READY-01 (squelette v0.1 — finalisation en DEPLOY-01).

```text
✅ Passenger V1 Feature Complete
✅ Passenger QA Complete
▶ DEPLOY-READY-01 (BUILD)     ← ce ticket (hardening, pas de déploiement)
        ↓
DEPLOY-01                     (VPS, Docker, HTTPS, domaine, monitoring)
        ↓
PILOT-01                      (premiers utilisateurs réels)
        ↓
DRIVER-WORKSPACE-01
        ↓
DRIVER-UX-01
        ↓
PILOT-02
        ↓
COMPANY
        ↓
B2B
```

---

# 2. Product Goals

## Primary goals

- Éliminer toute dette bloquante ou ambiguë avant exposition publique.
- Retirer définitivement le mode démonstration UI du codebase passager.
- Compléter les éléments de préparation production (favicon, meta, robots, juridique).
- Réduire le bruit technique (orphelins, imports morts, bundle) sans régression fonctionnelle.
- Produire une preuve documentée que le produit peut entrer en **DEPLOY-01** sereinement.

## Non-goals — STRICTEMENT INTERDIT pendant ce ticket

| Hors scope | Raison |
|------------|--------|
| Driver / chauffeur | Autre périmètre produit |
| Company / B2B | Hors CDC V1 |
| Nouvelles features Passenger | Feature complete validé CTO |
| Notifications temps réel / API | V2 |
| PWA complète | P2 — polish post-pilote si pertinent |
| Refonte UI | Aucune régression design system |
| Backend métier nouveau | Hors périmètre hardening frontend |
| DEPLOY-01 (infra) | Ticket suivant — ne pas mélanger |

> **Règle CTO :** aucune exception « petite feature » pendant DEPLOY-READY-01.

---

# 2bis. 🔒 GEL FONCTIONNEL (Feature Freeze)

**Validé CTO — 2026-06-23**

À partir de maintenant, et **jusqu'à la clôture de DEPLOY-READY-01** :

```text
FEATURE FREEZE

Aucune nouvelle fonctionnalité Passenger
```

| Interdit | Autorisé |
|----------|----------|
| Nouvelle page | Corrections de bugs |
| Nouveau bouton / CTA métier | Hardening (P0 / P1) |
| Nouveau parcours utilisateur | Préparation déploiement |
| « Petite amélioration rapide » | Nettoyage technique |

Toute demande hors périmètre → **BACKLOG** (post DEPLOY-READY-01).

---

# 3. Contexte d'entrée

## Jalon officiel validé

```text
SHARINGGO — PASSENGER V1

STATUS     ✅ FEATURE COMPLETE
QA         ✅ VALIDÉ (WEB-PASSENGER-QA-01)
VERDICT    GO CONDITIONNEL
NEXT       DEPLOY-READY-01
```

## Synthèse audit (référence)

| Métrique | Valeur |
|----------|--------|
| PASS | 47 |
| WARN | 14 |
| FAIL | 0 |

Les 14 WARN ne sont pas tous dans le scope obligatoire de ce ticket — voir matrice P0 / P1 / P2 ci-dessous.

### Baseline qualité (WEB-PASSENGER-QA-01 — référence « Avant »)

| KPI | Avant (audit QA) | Cible DEPLOY-READY-01 |
|-----|------------------|------------------------|
| WARN | 14 | ≤ 14 → réduction mesurable par sprint |
| FAIL | 0 | **0** (invariant) |
| Bundle JS | 844 kB | Réduction P1 (cible < 600 kB ou justification) |
| Routes mortes | 0 | **0** |
| Composants orphelins | 1 | **0** |
| Fichiers / deps démo | ~30 fichiers touchés | **0** (module supprimé) |

> **Règle CTO :** chaque PR / sous-livraison DEPLOY-READY-01 se termine par un tableau KPI **Avant / Après** (voir § 13bis).

---

# 4. Périmètre structuré

## Ordre d'exécution BUILD (validé CTO)

### Sprint P0 — ordre validé CTO (2026-06-23)

1. **P0-01** — `/help` route publique (changement localisé · vérifiable en premier) ✅
2. **P0-02** — Nettoyage mode démonstration (code · badges · env) ✅
3. **P0-03** — Vérification liens internes ✅
4. **P0-04** — **Branding Web** (favicon, icônes, title, theme-color, logo) ✅
5. **P0-05** — Meta description ✅
6. **P0-06** — `robots.txt` par environnement ✅
7. **P0-07** — Legal Review ✅ — [`DEPLOY-READY-P0-07-legal-review.md`](../../audits/DEPLOY-READY-P0-07-legal-review.md)

**Sprint P0 : COMPLETE (validation CTO — 2026-06-23)**

Puis seulement :

### Sprint P1 — ordre validé CTO

1. **P1-01** — Suppression composants orphelins
2. **P1-02** — Suppression exports morts · imports inutilisés
3. **P1-03** — Nettoyage hooks post-démo
4. **P1-04** — Revue TypeScript strict
5. **P1-05** — Optimisation bundle
6. **P1-06** — Lazy loading **uniquement si** P1-05 insuffisant

### P2

Intégralement **BACKLOG POST-PILOT** — ne pas démarrer pendant DEPLOY-READY-01.

---

## P0 — Obligatoire avant DEPLOY-01

Bloquant pour clôturer DEPLOY-READY-01 et ouvrir DEPLOY-01.

| ID | Item | Source audit | Livrable |
|----|------|--------------|----------|
| P0-01 | `/help` route **publique** | § 1 · § 9 · **Décision Q1** | Retirer `RequireAuth` sur `/help` · liens Contact/FAQ cohérents |
| P0-02 | Retrait définitif mode démonstration UI | § 6 | Supprimer code démo · badges · valider env `VITE_ENABLE_UI_DEMO_TRIPS` absent |
| P0-03 | Vérification liens internes | § 2 · § 7 | Footer, legal, contact, help, nav — aucun lien mort · `scripts/audit-internal-links.mjs` |
| P0-04 | **Branding Web** | § 7 | Favicon (`.ico` + PNG) · Apple Touch · Android/PWA si prêt · `<title>` · `theme-color` · logo (header, auth, favicon) |
| P0-05 | Meta description | § 7 | `<meta name="description">` dans `index.html` |
| P0-06 | `robots.txt` par environnement | § 7 · **Décision Q3** | LOCAL/STAGING/PREPROD : `Disallow: /` · PROD : `Allow: /` + `Sitemap` |
| P0-07 | Legal Review | § 1 · § 7 · **Décision Q2** | Rapport audit · CGU booking form · GO CONDITIONNEL pilote |

## P1 — Hardening technique

Requis pour DoD complète. Non bloquant pour *démarrer* DEPLOY-01 si CTO accepte report explicite d'un item P1 (documenté).

| ID | Item | Source audit | Livrable |
|----|------|--------------|----------|
| P1-01 | Suppression composants orphelins | § 4.2 | Ex. `BookingDetailPlaceholderPage.tsx` |
| P1-02 | Suppression exports morts · imports inutilisés | § 4.2 | `env.ts`, constantes démo · `pnpm lint` sans warning |
| P1-03 | Nettoyage hooks post-démo | § 4.2 | `usePublicTrip`, `useUserReservations`, etc. |
| P1-04 | Revue warnings TypeScript | § 4.1 | `pnpm build` strict |
| P1-05 | Optimisation bundle | § 4.1 · § 7 | 844 kB → cible < 600 kB ou justification CTO |
| P1-06 | Lazy loading routes | § 7 | **Dernier recours** — si P1-05 insuffisant |

## P2 — BACKLOG POST-PILOT (hors DoD)

**Décision Q4 CTO :** les P2 **ne font pas partie** de la DoD DEPLOY-READY-01. Aucun item P2 ne doit retarder le pilote.

Reportés après PILOT-01 :

| ID | Item | Source audit |
|----|------|--------------|
| P2-01 | Open Graph avancé | § 7 |
| P2-02 | Twitter Cards | § 7 |
| P2-03 | PWA / `manifest.json` + icônes | § 7 |
| P2-04 | Page 500 (SPA ou nginx) | § 7 |
| P2-05 | `sitemap.xml` avancé | § 7 |
| P2-06 | Lighthouse 100 / SEO avancé | § 5 · § 7 |
| P2-07 | Captures QA 1920px | § 3 |
| P2-08 | Alt text images hero landing | § 5 |
| P2-09 | Bundle ultra-optimisé (au-delà P1) | § 7 |

> **Gate production publique (hors ce ticket) :** remplacement placeholders juridiques (SIREN, siège, capital) — condition obligatoire avant ouverture publique, pas avant pilote privé contrôlé.

---

# 5. Critères d'acceptation par bloc

Chaque bloc = vérifiable · verdict **PASS / FAIL** documenté dans le rapport de clôture.

## AC-P0 — Démo & environnements

| # | Critère | Attendu |
|---|---------|---------|
| A1 | Build production | `pnpm build` OK · aucune référence runtime au mode démo |
| A2 | Recherche codebase | Aucun `demo-trip-`, `demo-booking-`, `demo-notification-` en logique active |
| A3 | Badges UI | Aucun badge « Démo » ou « Mode démonstration » dans le bundle prod |
| A4 | `.env.example` | Variable démo retirée ou commentée « supprimé DEPLOY-READY-01 » |
| A5 | Environnements | Checklist Railway/VPS : `VITE_ENABLE_UI_DEMO_TRIPS` absent preprod + prod |
| A6 | Régression parcours | Landing → Trips → Detail → Book → Bookings → Boarding Pass **PASS** sans données fictives |

## AC-P0 — Juridique & SEO minimal

| # | Critère | Attendu |
|---|---------|---------|
| B1 | Mentions légales | Placeholders **conservés** · note visible « à compléter avant production publique » · acceptable pilote privé |
| B2 | Favicon | Visible onglet navigateur · 32×32 minimum |
| B3 | Meta description | Présente · texte français · < 160 caractères recommandé |
| B4 | `robots.txt` | LOCAL/STAGING/PREPROD : `Disallow: /` · PROD : `Allow: /` + `Sitemap` · fichier ou génération par env documentée |
| B5 | Liens internes | 100 % des liens footer + nav + legal + contact résolvent (pas de 404 involontaire) |

## AC-P0 — Help

| # | Critère | Attendu |
|---|---------|---------|
| C1 | Route publique | `/help` accessible **sans auth** |
| C2 | Cohérence UX | FAQ consultable avant création de compte · Contact → Help sans redirect login |
| C3 | Liens compte | Liens vers `/bookings`, `/profile`, etc. → redirect auth si non connecté |
| C4 | Router | `RequireAuth` **retiré** de `/help` |

## AC-P1 — Hardening technique

| # | Critère | Attendu |
|---|---------|---------|
| D1 | Orphelins | Aucune page/composant non routé sans justification |
| D2 | Lint | `pnpm lint` → 0 erreur, 0 warning |
| D3 | Build | `pnpm build` → succès · taille bundle reportée |
| D4 | Console | Aucun `console.log` / `console.error` ajouté dans `src/` |
| D5 | Régression QA | Aucun FAIL sur parcours § 2 de WEB-PASSENGER-QA-01 |

---

# 6. Décisions CTO (2026-06-23)

Toutes les questions ouvertes sont **tranchées**. Phase DESIGN validée → **BUILD** autorisé.

## Q1 — `/help` : **PUBLIC** ✅

```text
/help devient une route publique.
```

- Cohérent avec Contact et pages légales publiques.
- FAQ accessible avant création de compte et en cas de problème de connexion.
- Liens vers routes compte (`/bookings`, `/profile`, …) → auth naturelle si requis.

## Q2 — Mentions légales : **placeholders conservés** ✅

- Pas d'invention SIREN / adresse / capital social.
- Données réelles = création structure juridique (hors scope immédiat).
- **Pilote privé contrôlé :** placeholders acceptés.
- **Production publique :** remplacement obligatoire (gate post-pilote, hors DoD DEPLOY-READY-01).

## Q3 — `robots.txt` ✅

```text
LOCAL      → Disallow: /
STAGING    → Disallow: /
PREPROD    → Disallow: /
PRODUCTION → Allow: / + Sitemap
```

Aucune indexation avant production.

## Q4 — P2 dans la DoD : **NON** ✅

```text
DoD DEPLOY-READY-01 = P0 + P1 uniquement
P2                  = BACKLOG POST-PILOT
```

## Q5 — Feature Freeze ✅

Voir § 2bis — gel fonctionnel jusqu'à clôture DEPLOY-READY-01.

---

# 7. Technical Design

## Périmètre code

```
frontend/apps/passenger/     ← principal
public/                      ← favicon, robots.txt, manifest (si P2)
docs/features/DEPLOY-READY-01.md
docs/audits/DEPLOY-READY-01-report.md   ← rapport de clôture (à créer en VERIFY)
```

## Modules impactés (estimation)

| Zone | Action |
|------|--------|
| `src/lib/ui-demo-trips.ts` | Supprimer |
| `src/features/trips/demo/` | Supprimer |
| `src/features/bookings/demo/` | Supprimer |
| `src/features/notifications/demo/` | Supprimer |
| `src/components/layout/UiDemoModeBadge.tsx` | Supprimer |
| `src/components/auth/DevDemoAuthHint.tsx` | Supprimer |
| Hooks merge démo | Simplifier (API seule) |
| `src/pages/BookingDetailPlaceholderPage.tsx` | Supprimer |
| `index.html` | Branding Web P0-04 : favicon, icônes, title, theme-color · P0-05 : meta description |
| `public/robots.txt` | Créer · variante par environnement (voir Q3) |
| `app/router.tsx` | `/help` hors `RequireAuth` |
| `features/legal/` contenus notice | Placeholders conservés · note production publique |

## Pas d'impact

- Backend API
- Schéma Prisma
- Admin frontend
- Stripe / webhooks

---

# 8. Security Review

| Risque | Mitigation |
|--------|------------|
| Données fictives en prod | Suppression code démo (pas seulement flag) |
| Fuite info via meta/OG | Pas de données utilisateur dans meta statiques |
| `robots.txt` staging indexé | `Disallow: /` ou `noindex` sur preprod |
| Placeholders juridiques en prod publique | Gate post-pilote · données juriste avant ouverture publique |

**Reviewer :** `@reviewer-securite-code` → APPROVE avant DONE si modifications routing auth (`/help`).

---

# 9. Testing Strategy

## Automatisé (chaque PR / avant DONE)

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
```

## Manuel — checklist régression

Reprendre les parcours § 2 de WEB-PASSENGER-QA-01 :

1. Réservation bout-en-bout (happy path)
2. Compte (profile, settings)
3. Support (help, contact, legal)
4. Abonnements
5. Responsive spot-check 390 + 1280

## Preuve

- Rapport `docs/audits/DEPLOY-READY-01-report.md` avec PASS/FAIL par critère AC
- Captures si changement visible (favicon, legal notice)

---

# 10. Definition of Done (DoD)

**DEPLOY-READY-01 est DONE uniquement si la [Definition of Production Ready](../../ops/DEPLOY-01-RUNBOOK.md#17-definition-of-production-ready) est satisfaite.**

```text
✔ FAIL = 0
✔ WARN P0 = 0
✔ Aucun composant orphelin
✔ Aucun fichier démo utilisé
✔ Aucun secret en dépôt
✔ Lint OK
✔ Build OK
✔ QA PASS
✔ Runbook complété (sections critiques)
✔ Smoke tests validés
```

### Obligatoire — DoD complète (P0 + P1)

- [ ] Tous les items **P0-01 à P0-07** : **PASS**
- [ ] Tous les items **P1-01 à P1-06** : **PASS** (P1-06 lazy loading si nécessaire)
- [ ] **WARN P0 = 0** dans rapport clôture
- [ ] Feature Freeze respecté
- [ ] `pnpm lint` + `pnpm build` verts
- [ ] Aucune régression parcours réservation (AC-P0 A6)
- [ ] Module démo supprimé · checklist WEB-DEMO-DATA-01 cochée
- [ ] KPI tableau Avant/Après consolidé
- [ ] Rapport `docs/audits/DEPLOY-READY-01-report.md`
- [ ] Runbook DEPLOY-01 sections § 8–9 · § 17 complétées (draft → revue CTO)
- [ ] PRD status → **DONE**
- [ ] Validation CTO : **« Produit prêt pour DEPLOY-01 »**

### Hors DoD (reporté)

- [ ] P2 — BACKLOG POST-PILOT (décision Q4)
- [ ] Placeholders juridiques réels — gate **production publique** (décision Q2)

---

# 11. Sortie explicite

À la clôture, le CTO valide la phrase suivante :

> **« Le frontend passager SharingGO est prêt pour DEPLOY-01. Aucune feature nouvelle n'est requise avant déploiement infrastructure. »**

En cas de refus : liste de remédiation avec owner et date cible — **pas** de contournement vers DEPLOY-01.

---

# 12. Déploiement & rollback

| Aspect | Détail |
|--------|--------|
| Environnements touchés | DEV · REC · (validation preprod avant DEPLOY-01) |
| Rollback | Revert commit DEPLOY-READY-01 sur branche · rebuild |
| DEPLOY-01 | **Ne démarre pas** tant que DoD § 10 incomplète |

---

# 13. Planning indicatif (BMAD)

| Phase | Activités | Statut |
|-------|-----------|--------|
| **DISCOVER** | PRD · périmètre P0/P1/P2 | ✅ **DONE** |
| **DESIGN** | Décisions CTO Q1–Q5 · spec robots/help/bundle | ✅ **DONE** |
| **BUILD** | Exécution P0 puis P1 | ▶ **NEXT** |
| **VERIFY** | Lint/build · régression manuelle · rapport clôture | À faire |
| **DONE** | Validation CTO · statut PRD DONE | À faire |

---

---

# 13bis. KPI obligatoire en fin de livraison

**Règle CTO — à partir de DEPLOY-READY-01**

Chaque PR, commit significatif ou sous-livraison se termine par :

| KPI | Avant | Après |
|-----|------:|------:|
| WARN (audit passager) | 14 | *X* |
| FAIL | 0 | **0** |
| Bundle JS | 844 kB | *XXX kB* |
| Routes mortes | 0 | **0** |
| Composants orphelins | 1 | **0** |
| Dépendances démo (fichiers actifs) | ~30 | **0** |

Les valeurs « Avant » du premier sprint reprennent la baseline § 3. Les « Après » deviennent le « Avant » du sprint suivant.

**Rapport final VERIFY :** tableau consolidé dans `docs/audits/DEPLOY-READY-01-report.md`.

---

# 14. Références

| Document | Chemin |
|----------|--------|
| Audit Passenger QA | `docs/audits/WEB-PASSENGER-QA-01.md` |
| Mode démo (à retirer) | `docs/features/WEB-DEMO-DATA-01.md` |
| Ticket exécution | `docs/features/DEPLOY-READY-01.md` |
| App passager | `frontend/apps/passenger/` |
| Runbook DEPLOY-01 (draft) | `docs/ops/DEPLOY-01-RUNBOOK.md` |

---

# 15. Décisions CTO — registre

| # | Question | Décision | Date |
|---|----------|----------|------|
| Q1 | `/help` public ou auth ? | **PUBLIC** | 2026-06-23 |
| Q2 | Mentions légales | **Placeholders conservés** · gate prod publique | 2026-06-23 |
| Q3 | `robots.txt` | **Disallow** local/staging/preprod · **Allow + Sitemap** prod | 2026-06-23 |
| Q4 | P2 dans DoD ? | **NON** — BACKLOG POST-PILOT | 2026-06-23 |
| Q5 | Feature Freeze | **Actif** jusqu'à fin DEPLOY-READY-01 | 2026-06-23 |

---

# 16. Changelog

## v1.3 — 2026-06-23

- Ordre Sprint P0 inversé : `/help` public **avant** nettoyage démo (CTO).
- Ordre Sprint P1 : lazy loading en **dernier recours**.
- **Definition of Production Ready** — gate DEPLOY-READY → DEPLOY-01.
- Runbook § 8 Monitoring · § 9 Sécurité.

## v1.2 — 2026-06-23

- Jalon officiel : fin Construction Passenger · début Release Engineering.
- Règle KPI Avant/Après en fin de chaque livraison (§ 13bis).
- Ordre BUILD Sprint P0 / P1 confirmé CTO.
- Runbook DEPLOY-01 v0.1 (squelette) — constitution parallèle.

## v1.1 — 2026-06-23

- Décisions CTO Q1–Q5 intégrées · phase DESIGN clôturée.
- Feature Freeze formalisé (§ 2bis).
- DoD restreinte à P0 + P1 · P2 → BACKLOG POST-PILOT.
- Roadmap étendue (DRIVER-WORKSPACE-01 · DRIVER-UX-01 · PILOT-02 · COMPANY · B2B).
- Statut → **DESIGN** · prochaine phase **BUILD**.

## v1.0 — 2026-06-23

- Création ticket DEPLOY-READY-01 post validation Passenger V1 Feature Complete.
- Périmètre P0 / P1 / P2 structuré depuis WEB-PASSENGER-QA-01.
- Non-goals stricts (pas de nouvelles features).
- Sortie explicite vers DEPLOY-01.

---

*PRD DEPLOY-READY-01 — DESIGN validé CTO. BUILD autorisé (P0 → P1). Feature Freeze actif.*
