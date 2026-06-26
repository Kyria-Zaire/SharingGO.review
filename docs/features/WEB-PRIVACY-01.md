# WEB-PRIVACY-01 — Politique de confidentialité

**Statut :** en attente validation CTO  
**Route :** `/legal/privacy` (publique)

## Objectif

Deuxième pilier juridique — réutilisation complète de l'infrastructure WEB-LEGAL-01.

## Composants réutilisés

- `LegalDocumentLayout` (nouveau — factorisation CGU + privacy)
- `LegalHeroSection`, `LegalDocumentMetaCard`, `LegalTableOfContents`
- `LegalSection`, `LegalContactCard`, `LegalFooterLinks`, `LegalSkeleton`
- `useLegalActiveSection` (généralisé)

## Spécifique

- `constants/legal-privacy-content.ts` — 12 sections RGPD synthétiques
- `components/LegalPrivacyView.tsx`
- `pages/PrivacyPolicyPage.tsx`

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
node ../../tmp-screenshot-privacy.mjs
```

Captures : `docs/qa/WEB-PRIVACY-01-desktop.png`, `WEB-PRIVACY-01-mobile.png`
