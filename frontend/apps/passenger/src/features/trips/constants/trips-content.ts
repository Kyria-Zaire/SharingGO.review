export const TRIPS_SECTION_IDS = {
  howItWorks: "trips-how-it-works",
} as const;

export const TRIPS_HERO_CONTENT = {
  titleBefore: "Trajets ",
  titleHighlight: "disponibles",
  subtitleBefore: "Réservez votre place ",
  subtitleBold: "à bord",
  subtitleAfter:
    " de nos navettes Châlons-en-Champagne ↔ Vatry en quelques clics.",
} as const;

export const TRIPS_HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Choisissez un trajet",
    description: "Consultez les horaires et places restantes sur la ligne Châlons ↔ Vatry.",
  },
  {
    step: 2,
    title: "Réservez votre place",
    description: "Bloquez votre siège en ligne — paiement sécurisé ou abonnement actif.",
  },
  {
    step: 3,
    title: "Recevez votre QR Code",
    description: "Votre billet numérique est disponible dans Mes réservations après confirmation.",
  },
  {
    step: 4,
    title: "Montez à bord",
    description: "Présentez votre QR au chauffeur à l'embarquement.",
  },
] as const;

export const TRIPS_REASSURANCE_ITEMS = [
  {
    id: "seats",
    title: "Places garanties",
    description: "Réservation confirmée — 8 places maximum par trajet.",
  },
  {
    id: "payment",
    title: "Paiement sécurisé",
    description: "Paiement en ligne via Stripe avant le départ.",
  },
  {
    id: "cancel",
    title: "Annulation flexible",
    description: "Conditions d'annulation indiquées avant confirmation.",
  },
  {
    id: "support",
    title: "Support réactif",
    description: "Notre équipe vous accompagne pour vos réservations.",
  },
] as const;
