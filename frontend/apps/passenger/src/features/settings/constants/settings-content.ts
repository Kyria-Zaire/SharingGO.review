import type { SettingsTab } from "@/features/settings/lib/settings-tabs";

export const SETTINGS_HERO = {
  title: "Paramètres",
  titleHighlight: "",
  subtitle: "Personnalisez votre expérience SharingGO.",
  logoutCta: "Déconnexion",
} as const;

export const SETTINGS_ACCOUNT = {
  title: "Compte",
  providerGoogle: "Google",
  providerEmail: "Email et mot de passe",
  synced: "Synchronisé",
  syncedGoogle: "Synchronisé avec votre compte Google",
  lastLogin: "Dernière connexion",
  email: "Email",
} as const;

export const SETTINGS_TAB_LABELS: Record<SettingsTab, string> = {
  general: "Général",
  notifications: "Notifications",
  privacy: "Confidentialité",
  security: "Sécurité",
  about: "À propos",
};

export const SETTINGS_GENERAL = {
  appearanceTitle: "Apparence",
  theme: "Thème",
  themeValue: "Sombre (par défaut)",
  language: "Langue",
  languageValue: "Français",
  distance: "Unité de distance",
  distanceValue: "Kilomètres",
  soonMessage: "Disponible dans une prochaine version",
} as const;

export const SETTINGS_NOTIFICATIONS = {
  title: "Préférences de notification",
  syncHint: "Ces préférences seront synchronisées prochainement.",
  email: "Notifications par email",
  sms: "Notifications par SMS",
  departures: "Rappels de départ",
  promotions: "Offres et promotions",
} as const;

export const SETTINGS_PRIVACY = {
  title: "Confidentialité",
  privacyPolicy: "Politique de confidentialité",
  terms: "Conditions générales",
  downloadData: "Télécharger mes données",
  downloadSoon: "Bientôt disponible",
} as const;

export const SETTINGS_SECURITY = {
  title: "Sécurité",
  password: "Mot de passe",
  passwordHint: "Modifier le mot de passe de votre compte.",
  twoFactor: "Authentification à deux facteurs",
  twoFactorHint: "Renforcez la sécurité de votre compte.",
  sessions: "Sessions connectées",
  sessionsHint: "Consultez les appareils connectés à votre compte.",
} as const;

export const SETTINGS_ABOUT = {
  title: "À propos",
  appName: "SharingGO Passenger",
  versionLabel: "Version actuelle",
  version: "0.1.0",
  copyright: "© 2026 SharingGO. Tous droits réservés.",
  legal: "Mentions légales",
  support: "Support",
  linkSoon: "Bientôt disponible",
} as const;

export const SETTINGS_DANGER = {
  title: "Zone dangereuse",
  deleteAccount: "Supprimer mon compte",
  deleteHint: "Cette action est définitive et supprimera toutes vos données.",
  deleteSoon: "Disponible prochainement.",
} as const;

export const SETTINGS_ACTIONS = {
  save: "Enregistrer",
  cancel: "Annuler",
  saveSoonMessage: "Les paramètres seront bientôt synchronisés avec votre compte.",
} as const;

export const SETTINGS_ERROR = {
  title: "Impossible de charger vos paramètres",
  retry: "Réessayer",
} as const;

export const SETTINGS_COMING_SOON_BADGE = "Bientôt";
