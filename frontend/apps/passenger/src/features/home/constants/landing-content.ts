export const LANDING_SECTION_IDS = {
  departures: "departures",
  howItWorks: "how-it-works",
  pricing: "pricing",
  why: "why-sharinggo",
  goodToKnow: "faq",
  faq: "faq",
} as const;

export const HERO_CONTENT = {
  badge: "NAVETTE PROFESSIONNELLE",
  titleBefore: "Votre trajet en toute",
  titleHighlight: "simplicité",
  subtitle:
    "Réservez votre place à bord de nos navettes Châlons-en-Champagne ↔ Vatry en quelques clics.",
  subtitleBold: "à bord",
  ctaPrimary: "Voir les trajets disponibles",
  ctaSecondary: "Comment ça fonctionne ?",
} as const;

export const HERO_TRUST_ITEMS = [
  { id: "seats", label: "Places garanties" },
  { id: "payment", label: "Paiement sécurisé" },
  { id: "support", label: "Support réactif" },
] as const;

export const SUBSCRIPTION_PLANS = [
  {
    id: "convoyeur",
    name: "Mensuel",
    price: "30,00 €",
    period: "/mois",
    features: ["Trajets illimités", "Valable 30 jours"],
    popular: true,
  },
  {
    id: "mosolf",
    name: "Multi-trajets",
    price: "40,00 €",
    period: "/mois",
    features: ["20 trajets inclus", "Valable 30 jours"],
    popular: false,
  },
] as const;

export const SUBSCRIPTION_BENEFITS = [
  "Trajets illimités ou à prix réduit",
  "Réservation prioritaire",
  "Annulation flexible",
  "Économie garantie",
] as const;

export const WHY_CHOOSE_ITEMS = [
  {
    id: "reliable",
    title: "Fiable & Ponctuel",
    description: "Des départs à l'heure, des trajets optimisés.",
  },
  {
    id: "comfort",
    title: "Confort & Sécurité",
    description: "Véhicules récents et chauffeurs professionnels.",
  },
  {
    id: "pricing",
    title: "Prix Transparent",
    description: "Aucun frais caché, paiement sécurisé.",
  },
  {
    id: "support",
    title: "Support Disponible",
    description: "Notre équipe vous accompagne 7j/7.",
  },
] as const;

export const GOOD_TO_KNOW_ITEMS = [
  {
    id: "schedule",
    title: "Horaires flexibles",
    description: "Plusieurs départs par jour adaptés à vos missions.",
  },
  {
    id: "booking",
    title: "Réservation facile",
    description: "Réservez en 2 minutes sur web ou mobile.",
  },
  {
    id: "cancel",
    title: "Annulation gratuite",
    description: "Jusqu'à 2h avant le départ sans frais.",
  },
  {
    id: "qr",
    title: "QR Code",
    description: "Votre billet directement dans votre mobile.",
  },
] as const;

/** @deprecated Ancienne landing — conservé pour références internes. */
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

/** @deprecated */
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

/** @deprecated */
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

/** @deprecated */
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

/** @deprecated */
export const ROUTE_FACTS = [
  "Trajet régulier",
  "Places limitées",
  "Réservation obligatoire",
] as const;
