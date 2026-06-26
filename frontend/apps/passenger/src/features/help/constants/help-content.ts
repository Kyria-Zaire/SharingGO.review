import type { HelpCategory } from "@/features/help/lib/help-categories";

export const HELP_HERO = {
  title: "Centre d'aide",
  subtitleBefore: "Une question ?",
  subtitleHighlight: "Nous sommes là pour vous aider.",
  contactCta: "Contacter le support",
} as const;

export const HELP_SEARCH = {
  placeholder: "Rechercher une aide...",
  label: "Rechercher dans l'aide",
} as const;

export const HELP_CATEGORIES_TITLE = "Parcourir par thème";

export const HELP_CATEGORY_LABELS: Record<HelpCategory, string> = {
  bookings: "Réservations",
  trips: "Trajets",
  subscriptions: "Abonnements",
  payments: "Paiements",
  account: "Compte",
  notifications: "Notifications",
  settings: "Paramètres",
};

export const HELP_CATEGORY_DESCRIPTIONS: Record<HelpCategory, string> = {
  bookings: "Réserver, consulter et gérer vos billets.",
  trips: "Horaires, lignes et informations trajet.",
  subscriptions: "Formules mensuelles et Mosolf.",
  payments: "Paiement Stripe et remboursements.",
  account: "Profil, connexion et identité.",
  notifications: "Alertes et informations compte.",
  settings: "Préférences et configuration app.",
};

export const HELP_FAQ_TITLE = "Questions fréquentes";

export const HELP_SUPPORT = {
  title: "Besoin d'aide ?",
  email: "support@sharinggo.fr",
  phone: "07 80 90 10 20",
  emailCta: "Envoyer un email",
} as const;

export const HELP_USEFUL_LINKS_TITLE = "Liens utiles";

export const HELP_TRAVEL_TIPS_TITLE = "Conseils avant votre trajet";

export const HELP_TRAVEL_TIPS = [
  {
    id: "arrival",
    title: "Arrivez 15 minutes avant",
    description: "Présentez-vous à l'arrêt navette indiqué sur votre billet.",
  },
  {
    id: "qr",
    title: "Présentez votre QR",
    description: "Votre code d'embarquement est disponible sur la page billet.",
  },
  {
    id: "check",
    title: "Vérifiez votre réservation",
    description: "Consultez Mes réservations pour le statut et l'horaire.",
  },
  {
    id: "luggage",
    title: "Bagage cabine inclus",
    description: "1 bagage cabine par passager. Merci de voyager léger.",
  },
] as const;

export const HELP_EMPTY = {
  title: "Aucun résultat",
  description: "Essayez un autre mot-clé ou parcourez les catégories ci-dessus.",
  contactCta: "Contacter le support",
} as const;

export const HELP_ERROR = {
  title: "Impossible de charger le centre d'aide",
  retry: "Réessayer",
} as const;

export const HELP_FAQ_ITEMS = [
  {
    id: "line",
    category: "trips" as const,
    question: "Quels trajets sont proposés ?",
    answer:
      "SharingGO dessert la ligne unique Châlons-en-Champagne ↔ Paris-Vatry avec 8 départs par jour. Consultez la page Trajets pour les horaires et places disponibles.",
  },
  {
    id: "how-book",
    category: "bookings" as const,
    question: "Comment réserver ?",
    answer:
      "Choisissez un trajet sur la page Trajets, sélectionnez un créneau disponible puis suivez le paiement Stripe. Votre place est réservée après confirmation du paiement (8 € par trajet).",
  },
  {
    id: "how-qr",
    category: "bookings" as const,
    question: "Comment fonctionne le QR ?",
    answer:
      "Après paiement, accédez à votre billet depuis Mes réservations. Le QR code JWT est valable jusqu'à 10 minutes après l'heure de départ. Le conducteur le scanne une seule fois pour valider l'embarquement.",
  },
  {
    id: "refund",
    category: "payments" as const,
    question: "Quand arrive mon remboursement ?",
    answer:
      "Les remboursements sont traités par Stripe selon votre banque (généralement 5 à 10 jours ouvrés). Contactez le support avec votre référence de réservation pour toute demande.",
  },
  {
    id: "mosolf",
    category: "subscriptions" as const,
    question: "Comment fonctionne l'abonnement Mosolf ?",
    answer:
      "La formule Mosolf Mensuel (40 €) est réservée aux collaborateurs Mosolf. Vérifiez votre code entreprise depuis la page Abonnements avant le paiement. L'activation désactive les autres abonnements actifs.",
  },
  {
    id: "edit-profile",
    category: "account" as const,
    question: "Comment modifier mon profil ?",
    answer:
      "Rendez-vous sur Mon profil puis « Modifier mon profil ». La sauvegarde des modifications sera disponible dans une prochaine version de l'application.",
  },
  {
    id: "contact-support",
    category: "account" as const,
    question: "Comment contacter le support ?",
    answer:
      "Écrivez à support@sharinggo.fr ou appelez le 07 80 90 10 20. Notre équipe est disponible pour vous accompagner sur vos réservations et votre compte.",
  },
  {
    id: "cancel",
    category: "bookings" as const,
    question: "Comment annuler ?",
    answer:
      "L'annulation en ligne n'est pas encore disponible dans l'application. Contactez le support avec votre référence de réservation pour toute demande d'annulation.",
  },
  {
    id: "ticket",
    category: "bookings" as const,
    question: "Comment fonctionne le billet ?",
    answer:
      "Votre billet numérique contient le trajet, l'horaire et un QR d'embarquement unique. Il est accessible depuis Mes réservations une fois le paiement confirmé par webhook Stripe.",
  },
  {
    id: "find-bookings",
    category: "bookings" as const,
    question: "Comment retrouver mes réservations ?",
    answer:
      "Connectez-vous puis ouvrez Mes réservations. Vous y trouvez vos trajets à venir, passés et annulés avec leur statut et l'accès au billet QR.",
  },
  {
    id: "subscription-book",
    category: "subscriptions" as const,
    question: "Comment réserver avec mon abonnement ?",
    answer:
      "Avec un abonnement actif, réservez un trajet normalement : la confirmation se fait sans paiement unitaire de 8 € si votre abonnement couvre la période.",
  },
  {
    id: "notifications",
    category: "notifications" as const,
    question: "Où voir mes notifications ?",
    answer:
      "Cliquez sur l'icône cloche dans l'en-tête pour ouvrir vos notifications (confirmations, rappels et informations compte).",
  },
  {
    id: "settings-sync",
    category: "settings" as const,
    question: "Mes paramètres sont-ils sauvegardés ?",
    answer:
      "Les préférences affichées dans Paramètres sont locales pour le moment. La synchronisation avec votre compte sera disponible prochainement.",
  },
] as const;

export type HelpFaqItem = (typeof HELP_FAQ_ITEMS)[number];
