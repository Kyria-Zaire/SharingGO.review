export const CONTACT_HERO = {
  title: "Contactez-nous",
  subtitle:
    "Notre équipe est disponible pour répondre à vos questions et vous accompagner dans l'utilisation de SharingGO.",
  emailCta: "Envoyer un email",
} as const;

export const CONTACT_SUPPORT = {
  email: "support@sharinggo.fr",
  phone: "07 80 90 10 20",
  emailResponseTime: "Réponse sous 24 à 48 h ouvrées",
  phoneHours: "Lundi → Vendredi",
  phoneSchedule: "9h00 → 18h00",
} as const;

export const CONTACT_METHODS = {
  email: {
    title: "Email",
    cta: "Envoyer un email",
  },
  phone: {
    title: "Téléphone",
    cta: "Appeler",
  },
  help: {
    title: "Centre d'aide",
    description: "Accéder à la FAQ",
    cta: "Ouvrir le centre d'aide",
  },
} as const;

export const CONTACT_FORM = {
  title: "Envoyez-nous un message",
  description: "Remplissez le formulaire ci-dessous. Nous vous répondrons dès que possible.",
  nameLabel: "Nom",
  namePlaceholder: "Votre nom",
  emailLabel: "Email",
  emailPlaceholder: "vous@exemple.fr",
  subjectLabel: "Sujet",
  subjectPlaceholder: "Objet de votre demande",
  categoryLabel: "Catégorie",
  messageLabel: "Message",
  messagePlaceholder: "Décrivez votre demande…",
  submitCta: "Envoyer",
  soonNote: "Le formulaire sera connecté au support dans une prochaine version.",
} as const;

export const CONTACT_CATEGORIES = [
  { value: "booking", label: "Réservation" },
  { value: "trip", label: "Trajet" },
  { value: "payment", label: "Paiement" },
  { value: "subscription", label: "Abonnement" },
  { value: "account", label: "Compte" },
  { value: "report", label: "Signalement" },
  { value: "other", label: "Autre" },
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]["value"];

export const CONTACT_FAQ = {
  title: "Questions fréquentes",
  items: [
    {
      id: "how-book",
      question: "Comment réserver ?",
      helpAnchor: "how-book",
    },
    {
      id: "find-ticket",
      question: "Comment retrouver mon billet ?",
      helpAnchor: "find-bookings",
    },
    {
      id: "subscription",
      question: "Comment fonctionne l'abonnement ?",
      helpAnchor: "mosolf",
    },
    {
      id: "support",
      question: "Comment contacter le support ?",
      helpAnchor: "contact-support",
    },
  ],
} as const;

export const CONTACT_REASSURANCE = {
  title: "Pourquoi nous contacter ?",
  intro: "Notre équipe peut vous aider concernant :",
  topics: [
    "Réservations",
    "Paiements",
    "Billets QR",
    "Compte",
    "Abonnements",
  ],
} as const;

export const CONTACT_USEFUL_LINKS_TITLE = "Liens utiles";

export const CONTACT_ERROR = {
  title: "Impossible de charger la page Contact",
  retry: "Réessayer",
} as const;

export const supportMailto = `mailto:${CONTACT_SUPPORT.email}?subject=${encodeURIComponent("Contact SharingGO")}`;
