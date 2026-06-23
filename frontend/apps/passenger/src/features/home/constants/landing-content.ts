export const LANDING_SECTION_IDS = {
  howItWorks: "how-it-works",
  pricing: "pricing",
  faq: "faq",
} as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Réservez votre trajet",
    description: "Choisissez votre horaire Châlons ↔ Vatry et bloquez votre place en ligne.",
  },
  {
    step: 2,
    title: "Recevez votre QR personnel",
    description: "Après confirmation, votre accès numérique est disponible dans votre espace.",
  },
  {
    step: 3,
    title: "Présentez votre QR au chauffeur",
    description: "Montrez votre QR à l'embarquement. Un billet = un trajet = un accès.",
  },
] as const;

export const PRICING_PLANS = [
  {
    id: "ticket",
    name: "Billet",
    price: "8 €",
    period: "par trajet",
    description: "Voyage occasionnel.",
    highlight: false,
  },
  {
    id: "convoyeur",
    name: "Abonnement Convoyeur",
    price: "30 €",
    period: "/ mois",
    description: "Pour les utilisateurs réguliers.",
    highlight: true,
  },
  {
    id: "mosolf",
    name: "Abonnement Mosolf",
    price: "40 €",
    period: "/ mois",
    description: "Réservé aux collaborateurs éligibles.",
    highlight: false,
  },
] as const;

export const BENEFITS = [
  {
    id: "booking",
    title: "Réservation garantie",
    description: "Places limitées et contrôlées.",
  },
  {
    id: "payment",
    title: "Paiement sécurisé",
    description: "Paiement en ligne avant départ.",
  },
  {
    id: "qr",
    title: "QR personnel",
    description: "Un accès individuel par réservation.",
  },
  {
    id: "tracking",
    title: "Suivi simplifié",
    description: "Retrouvez facilement vos trajets.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    id: "reserve",
    question: "Comment réserver ?",
    answer:
      "Consultez les trajets disponibles, sélectionnez votre horaire et confirmez votre place. La réservation se finalise en ligne avant le départ.",
  },
  {
    id: "qr",
    question: "Quand vais-je recevoir mon QR ?",
    answer:
      "Dès que votre réservation est confirmée (paiement ou abonnement actif), votre QR personnel apparaît dans Mes réservations.",
  },
  {
    id: "price",
    question: "Combien coûte un trajet ?",
    answer:
      "8 € le billet à l'unité, 30 €/mois en abonnement convoyeur, 40 €/mois pour les collaborateurs Mosolf éligibles.",
  },
  {
    id: "cancel",
    question: "Que faire si je ne peux plus voyager ?",
    answer:
      "Consultez vos réservations depuis Mes réservations. Les conditions d'annulation vous seront indiquées avant confirmation.",
  },
] as const;

export const ROUTE_FACTS = [
  "Trajet régulier",
  "Places limitées",
  "Réservation obligatoire",
] as const;
