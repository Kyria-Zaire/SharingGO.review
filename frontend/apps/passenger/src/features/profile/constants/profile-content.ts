import type { ProfileTab } from "@/features/profile/lib/profile-tabs";

export const PROFILE_HERO_CONTENT = {
  titleBefore: "Mon ",
  titleHighlight: "profil",
  subtitle:
    "Gérez vos informations personnelles, vos préférences et votre sécurité.",
  logoutCta: "Déconnexion",
} as const;

export const PROFILE_TAB_LABELS: Record<ProfileTab, string> = {
  overview: "Vue d'ensemble",
  information: "Informations",
  payment: "Paiement",
  preferences: "Préférences",
  security: "Sécurité",
};

export const PROFILE_IDENTITY = {
  badge: "Passager",
  editCta: "Modifier mon profil",
  phoneMissing: "Non renseigné",
} as const;

export const PROFILE_SUBSCRIPTION = {
  activeLabel: "Abonnement actif",
  viewCta: "Voir mon abonnement",
  discoverCta: "Découvrir nos abonnements",
  emptyTitle: "Aucun abonnement actif",
  emptyDescription:
    "Profitez de trajets illimités sur la ligne Châlons ↔ Vatry avec une formule mensuelle.",
  nextBilling: "Prochain prélèvement",
} as const;

export const PROFILE_STATS = {
  title: "Statistiques",
  tripsCompleted: "Trajets effectués",
  reservations: "Réservations",
  activeSubscription: "Abonnement actif",
  yes: "Oui",
  no: "Non",
} as const;

export const PROFILE_LOYALTY = {
  prefix: "Vous avez effectué",
  suffix: "trajets",
  thanks: "Merci de voyager avec SharingGO ❤️",
  futureHint: "Programme fidélité — bientôt disponible",
} as const;

export const PROFILE_ACTIVITY = {
  title: "Activité récente",
  viewAllCta: "Voir toutes mes réservations",
  emptyTitle: "Aucune activité récente",
  emptyDescription: "Vos dernières réservations apparaîtront ici.",
} as const;

export const PROFILE_INFORMATION = {
  title: "Informations personnelles",
  firstName: "Prénom",
  lastName: "Nom",
  email: "Email",
  comingSoonMessage: "La modification du profil sera disponible prochainement.",
} as const;

export const PROFILE_PAYMENT = {
  title: "Moyen de paiement",
  cardKnown: "Carte enregistrée via Stripe lors de vos paiements.",
  noCard: "Aucun moyen de paiement enregistré.",
  addCta: "Ajouter un moyen de paiement",
  addDisabledTitle:
    "L'enregistrement d'une carte se fait lors d'un paiement Stripe (réservation ou abonnement).",
  stripeNote:
    "Stripe reste la source de vérité pour vos paiements. Aucun portefeuille local n'est créé.",
} as const;

export const PROFILE_PREFERENCES = {
  title: "Préférences",
  comingSoonIntro: "Cette section sera disponible dans une prochaine mise à jour.",
  comingSoonListTitle: "Vous pourrez bientôt gérer :",
  comingSoonItems: ["Notifications", "Langue", "Préférences de communication"] as const,
} as const;

export const PROFILE_SOON_BADGE = "Bientôt" as const;

export const PROFILE_SECURITY = {
  title: "Sécurité du compte",
  comingSoonIntro: "Fonctionnalités de sécurité avancées bientôt disponibles.",
  changePassword: "Changer mot de passe",
  changePasswordHint:
    "Connexion Google : gérez votre mot de passe depuis votre compte Google.",
  devices: "Appareils connectés",
  devicesPlaceholder:
    "Consultez et révoquez les appareils connectés à votre compte.",
  deleteAccount: "Suppression du compte",
  deleteAccountHint:
    "Cette action est irréversible. Contactez le support pour toute demande de suppression.",
} as const;

export const PROFILE_ERROR = {
  title: "Impossible de charger votre profil",
  retry: "Réessayer",
} as const;
