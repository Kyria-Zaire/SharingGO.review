/** Logo officiel SharingGO — `public/images/SharingGO.png` */
export const BRAND_LOGO_SRC = "/images/SharingGO.png";
export const BRAND_LOGO_ALT = "SharingGO";

/** Web icons — generated via `pnpm generate:brand-icons` (GO crop from wordmark). */
export const BRAND_THEME_COLOR = "#22c55e";

/** Meta description — mirrored in `index.html` for SEO / link previews. */
export const BRAND_META_DESCRIPTION =
  "SharingGO facilite vos déplacements entre Châlons-en-Champagne et l'aéroport Paris-Vatry. Réservez votre navette en ligne, payez en toute sécurité et recevez votre billet numérique.";

/** Canonical public site URL — Sitemap in prod robots.txt (`pnpm generate:robots`). */
export const BRAND_SITE_URL = "https://sharinggo.fr";

export const BRAND_ICONS = {
  favicon: "/favicon.ico",
  favicon32: "/favicon-32x32.png",
  appleTouch: "/apple-touch-icon.png",
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
} as const;
