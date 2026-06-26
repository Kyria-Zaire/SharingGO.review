# WEB-LEGAL-NOTICE-01 — Mentions légales

**Statut :** en attente validation CTO  
**Route :** `/legal/notice` (publique)

## Objectif

Troisième document juridique — démonstration de la réutilisation maximale de `LegalDocumentLayout`.

## Fichiers spécifiques

- `constants/legal-notice-content.ts` — 7 sections + placeholders société/hébergeur
- `components/LegalNoticeView.tsx`
- `pages/LegalNoticePage.tsx`

## Validation

```powershell
cd frontend/apps/passenger
pnpm lint
pnpm build
node ../../tmp-screenshot-legal-notice.mjs
```

Captures : `docs/qa/WEB-LEGAL-NOTICE-01-desktop.png`, `WEB-LEGAL-NOTICE-01-mobile.png`
