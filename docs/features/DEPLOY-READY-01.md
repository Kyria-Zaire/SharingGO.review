# DEPLOY-READY-01 — Hardening pré-déploiement passager

**Statut :** DESIGN (décisions CTO validées — **BUILD autorisé**)  
**Type :** phase hardening · **pas** de nouvelle feature  
**PRD :** [`docs/prd/active/DEPLOY-READY-01-passenger-deploy-readiness.md`](../prd/active/DEPLOY-READY-01-passenger-deploy-readiness.md)  
**Prérequis :** Passenger V1 FEATURE COMPLETE · WEB-PASSENGER-QA-01 GO CONDITIONNEL

---

## 🔒 Feature Freeze (actif)

```text
Aucune nouvelle fonctionnalité Passenger
jusqu'à la fin de DEPLOY-READY-01
```

Uniquement : corrections · hardening · préparation déploiement.

---

## Jalon

```text
✅ Passenger V1 Feature Complete
✅ Passenger QA Complete
▶ DEPLOY-READY-01 (BUILD)     ← nous sommes ici
        ↓
DEPLOY-01
        ↓
PILOT-01
        ↓
DRIVER-01 → PILOT-02 → B2B
```

**Sortie attendue :** *Produit prêt pour DEPLOY-01* (validation CTO).

**DoD :** P0 + P1 uniquement. P2 = BACKLOG POST-PILOT.

---

## Décisions CTO (2026-06-23)

| # | Décision |
|---|----------|
| Q1 | `/help` → **route publique** |
| Q2 | Mentions légales → **placeholders conservés** (gate prod publique) |
| Q3 | `robots.txt` → Disallow local/staging/preprod · Allow + Sitemap prod |
| Q4 | P2 → **hors DoD** |
| Q5 | **Feature Freeze** actif |

---

## P0 — Obligatoire (DoD)

| # | Tâche | Fichiers / zone |
|---|-------|-----------------|
| 1 | Retrait définitif mode démo UI | `src/lib/ui-demo-trips.ts`, `features/*/demo/`, merges hooks |
| 2 | Suppression badges DÉMO | `UiDemoModeBadge.tsx`, `NotificationCard` badge démo |
| 3 | Validation env `VITE_ENABLE_UI_DEMO_TRIPS` | Railway / VPS / `.env.example` |
| 4 | Juridique — placeholders + note prod publique | `features/legal/` (pas de faux SIREN) |
| 5 | `/help` public | `router.tsx` — retirer `RequireAuth` |
| 6 | Favicon | `public/` + `index.html` |
| 7 | Meta description | `index.html` |
| 8 | `robots.txt` par env | `public/robots.txt` (voir Q3) |
| 9 | Audit liens internes | footer, nav, legal, contact, help |

---

## P1 — Hardening technique (DoD)

| # | Tâche |
|---|-------|
| 1 | Supprimer `BookingDetailPlaceholderPage.tsx` (orphelin) |
| 2 | Supprimer exports morts (`env.ts`, constantes boarding démo) |
| 3 | Nettoyage imports inutilisés |
| 4 | Simplifier hooks post-suppression démo |
| 5 | Revue TypeScript strict |
| 6 | Réduction bundle (844 kB → cible < 600 kB ou justification) |
| 7 | Lazy loading routes si gain significatif |

---

## P2 — BACKLOG POST-PILOT (hors DoD)

Lighthouse · PWA · Twitter Cards · OG avancé · SEO avancé · bundle ultra-optimisé · 1920px.

**Gate prod publique (hors ticket) :** SIREN / siège / capital réels.

---

## Interdit pendant ce ticket

- Driver · Company · B2B
- Nouvelles features Passenger
- Backend métier nouveau
- DEPLOY-01 (infra)

---

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
# + régression manuelle parcours WEB-PASSENGER-QA-01 § 2
```

**Rapport de clôture (VERIFY) :** `docs/audits/DEPLOY-READY-01-report.md`

---

## Références

| Doc | Rôle |
|-----|------|
| `docs/audits/WEB-PASSENGER-QA-01.md` | Audit source |
| `docs/features/WEB-DEMO-DATA-01.md` | Module démo à retirer |
| PRD actif | Périmètre · AC · DoD · décisions CTO |
