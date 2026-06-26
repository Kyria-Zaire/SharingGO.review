import type { ProfileEditTab } from "@/features/profile/edit/lib/profile-edit-tabs";

export const PROFILE_EDIT_HERO = {
  backLabel: "Retour au profil",
  title: "Modifier mon profil",
  subtitle: "Mettez à jour vos informations personnelles et vos préférences.",
  photoUploadTitle: "Modification de la photo — bientôt disponible",
} as const;

export const PROFILE_EDIT_INFO_BANNER =
  "Les informations de votre profil sont utilisées pour vos réservations et votre billet QR.";

export const PROFILE_EDIT_SYNC = {
  google: "Synchronisé avec votre compte Google",
  lastSyncLabel: "Dernière synchronisation",
  todayAt: (time: string) => `Aujourd'hui à ${time}`,
} as const;

export const PROFILE_EDIT_TAB_LABELS: Record<ProfileEditTab, string> = {
  information: "Informations",
  payment: "Paiement",
  preferences: "Préférences",
  security: "Sécurité",
};

export const PROFILE_EDIT_ACTIONS = {
  save: "Enregistrer les modifications",
  cancel: "Annuler",
  saveSoonMessage: "La modification du profil sera disponible prochainement.",
  deleteAccount: "Supprimer mon compte",
} as const;

export const PROFILE_EDIT_INFORMATION = {
  title: "Informations personnelles",
  firstName: "Prénom",
  lastName: "Nom",
  email: "Email",
  phone: "Téléphone",
  birthDate: "Date de naissance",
  address: "Adresse",
  postalCode: "Code postal",
  city: "Ville",
  country: "Pays",
  notProvided: "Non renseigné",
  emailGoogleHint: "Email lié à votre compte Google — non modifiable.",
  optionalHint: "Optionnel",
} as const;

export const PROFILE_EDIT_PAYMENT = {
  title: "Moyens de paiement",
  stripeManaged: "Moyens de paiement gérés par Stripe",
  empty: "Aucun moyen de paiement n'est exposé par l'application pour le moment.",
  manageCta: "Gérer mes moyens de paiement",
  manageSoonTitle: "Gestion des moyens de paiement — bientôt disponible",
  stripeNote:
    "Stripe reste la source de vérité. Vos cartes sont enregistrées lors d'un paiement (réservation ou abonnement).",
} as const;

export const PROFILE_EDIT_PREFERENCES = {
  title: "Préférences",
  localStateHint:
    "Ces réglages sont visuels pour le moment. La sauvegarde sera disponible prochainement.",
  emailNotifications: "Notifications par email",
  smsNotifications: "Notifications par SMS",
  offers: "Offres et promotions",
  language: "Langue",
  languageValue: "Français",
  distanceUnit: "Unité de distance",
  distanceValue: "Kilomètres",
} as const;

export const PROFILE_EDIT_SECURITY = {
  title: "Sécurité",
  soonIntro: "Fonctionnalités de sécurité avancées bientôt disponibles.",
  changePassword: "Changer le mot de passe",
  changePasswordHint: "Mettez à jour le mot de passe de votre compte.",
  twoFactor: "Authentification à deux facteurs",
  twoFactorHint: "Renforcez la sécurité de votre compte.",
  devices: "Appareils connectés",
  devicesHint: "Consultez les sessions actives sur votre compte.",
  deleteAccount: "Supprimer mon compte",
  deleteAccountHint:
    "Cette action est définitive. Contactez le support si vous souhaitez supprimer votre compte.",
} as const;
