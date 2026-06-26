import { LANDING_SECTION_IDS } from "@/features/home/constants/landing-content";
import { ROUTES } from "@/types/routes";

export interface ShellNavItem {
  label: string;
  to: string;
  hash?: string;
  end?: boolean;
  authRequired?: boolean;
}

/** Navigation principale desktop (header). */
export const DESKTOP_NAV_ITEMS: ShellNavItem[] = [
  { label: "Accueil", to: ROUTES.home, end: true },
  { label: "Trajets", to: ROUTES.trips },
  { label: "Réservations", to: ROUTES.bookings, authRequired: true },
  { label: "Abonnements", to: ROUTES.subscriptions, authRequired: true },
];

export interface FooterLink {
  label: string;
  to: string;
  hash?: string;
  external?: boolean;
}

export const FOOTER_USEFUL_LINKS: FooterLink[] = [
  { label: "Trajets", to: ROUTES.trips },
  { label: "Abonnements", to: ROUTES.subscriptions },
  { label: "Comment ça fonctionne", to: ROUTES.home, hash: `#${LANDING_SECTION_IDS.howItWorks}` },
  { label: "Aide & FAQ", to: ROUTES.help },
];

export const FOOTER_INFO_LINKS: FooterLink[] = [
  { label: "CGU", to: ROUTES.legalTerms },
  { label: "Politique de confidentialité", to: ROUTES.legalPrivacy },
  { label: "Mentions légales", to: ROUTES.legalNotice },
  { label: "Contact", to: ROUTES.contact },
];

export const FOOTER_CONTACT = {
  email: "support@sharinggo.fr",
  phone: "07 80 90 10 20",
} as const;

/** Réseaux sociaux — affichés uniquement si href réel (pas de placeholder). */
export const FOOTER_SOCIAL_LINKS: { label: string; href: string }[] = [];
