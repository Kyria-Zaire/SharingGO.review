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
  ctaSecondary: "Découvrir nos abonnements",
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
