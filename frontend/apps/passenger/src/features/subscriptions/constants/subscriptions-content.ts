import type { SubscriptionsFilter } from "@/features/subscriptions/lib/subscriptions-tabs";

export const SUBSCRIPTIONS_HERO_CONTENT = {
  titleBefore: "Mes ",
  titleHighlight: "abonnements",
  subtitle: "Des formules adaptées à vos trajets réguliers sur la ligne Châlons ↔ Vatry.",
} as const;

export const SUBSCRIPTIONS_FILTER_LABELS: Record<SubscriptionsFilter, string> = {
  plans: "Nos abonnements",
  mine: "Mes abonnements",
  history: "Historique",
};

export const SUBSCRIPTIONS_PROMO_BANNER = {
  message: "Avec un abonnement, bénéficiez de trajets illimités sur votre ligne.",
  cta: "Comment ça fonctionne ?",
} as const;

export const SUBSCRIPTIONS_BILLING_TOGGLE = {
  monthly: "Mensuel",
  annual: "Annuel (-10%)",
  annualSoon: "Bientôt",
} as const;

export const SUBSCRIPTION_CATALOG_PLANS = [
  {
    id: "convoyeur",
    apiType: "CONVOYEUR_MONTHLY" as const,
    title: "Convoyeur Mensuel",
    priceMonthly: 30,
    description: "Pour les convoyeurs qui empruntent la navette régulièrement.",
    features: [
      "Trajets illimités sur la ligne Châlons ↔ Vatry",
      "Réservation sans repayer chaque trajet",
      "Valable 30 jours, renouvellement mensuel",
      "QR d'embarquement sur chaque réservation",
    ],
    popular: false,
  },
  {
    id: "mosolf",
    apiType: "MOSOLF_MONTHLY" as const,
    title: "Mosolf Mensuel",
    priceMonthly: 40,
    description: "Réservé aux collaborateurs Mosolf avec code entreprise valide.",
    features: [
      "Accès mensuel à la navette partenaire",
      "Code entreprise Mosolf requis avant souscription",
      "Désactive les autres abonnements actifs",
      "Valable 30 jours, renouvellement mensuel",
    ],
    popular: true,
  },
] as const;

export const SUBSCRIPTIONS_PLAN_CTA = "Choisir cette formule";
export const SUBSCRIPTIONS_MOSOLF_CTA = "Vérifier mon code Mosolf";
export const SUBSCRIPTIONS_MOSOLF_CODE_FLOW = {
  title: "Code entreprise Mosolf",
  description:
    "Cette formule est réservée aux collaborateurs Mosolf. Saisissez votre code entreprise pour vérifier votre éligibilité avant le paiement.",
  codeLabel: "Code entreprise Mosolf",
  codePlaceholder: "Ex. MOSOLF-XXXX",
  submitLabel: "Vérifier mon éligibilité",
  eligibleHint:
    "Votre compte est éligible. Vous pouvez poursuivre vers le paiement sécurisé Stripe.",
  ineligibleHint:
    "Pour souscrire, utilisez un compte @mosolf.com ou contactez le support avec votre code entreprise valide.",
  continueCheckout: "Continuer vers le paiement",
  contactSupport: "Contacter le support",
  supportEmail: "support@sharinggo.fr",
} as const;

export const SUBSCRIPTIONS_WHY_INTRO =
  "Une navette professionnelle pensée pour vos trajets réguliers sur la ligne Châlons ↔ Vatry." as const;

export const SUBSCRIPTIONS_WHY_ITEMS = [
  {
    id: "savings",
    title: "Économies",
    description: "Réduisez le coût de vos trajets réguliers avec une formule mensuelle.",
  },
  {
    id: "flexibility",
    title: "Flexibilité",
    description: "Réservez vos créneaux sans repasser par le paiement à chaque trajet.",
  },
  {
    id: "reliability",
    title: "Fiabilité",
    description: "Planning régulier sur la ligne Châlons ↔ Vatry.",
  },
  {
    id: "support",
    title: "Support",
    description: "Une équipe disponible 7j/7 pour vous accompagner.",
  },
] as const;

export const SUBSCRIPTIONS_FAQ_ITEMS = [
  {
    id: "cancel",
    question: "Puis-je résilier mon abonnement ?",
    answer:
      "Oui. Votre abonnement reste actif jusqu'à la fin de la période en cours. Contactez le support pour toute question de résiliation.",
  },
  {
    id: "mosolf",
    question: "Comment fonctionne Mosolf ?",
    answer:
      "La formule Mosolf nécessite un code personnel à usage unique. À l'activation, elle remplace tout autre abonnement actif sur votre compte.",
  },
  {
    id: "switch",
    question: "Puis-je changer de formule ?",
    answer:
      "Vous pouvez souscrire à une nouvelle formule lorsque votre abonnement actuel n'est plus actif. Mosolf désactive automatiquement les autres abonnements.",
  },
  {
    id: "booking",
    question: "Comment réserver avec mon abonnement ?",
    answer:
      "Choisissez un trajet, réservez votre place : si votre abonnement est actif, la réservation est confirmée sans paiement unitaire.",
  },
  {
    id: "line",
    question: "Sur quelle ligne mon abonnement est-il valable ?",
    answer:
      "Sur la ligne unique SharingGO : Châlons-en-Champagne ↔ Vatry.",
  },
] as const;

export const SUBSCRIPTIONS_EMPTY = {
  plansUnavailable: {
    title: "Abonnements indisponibles",
    description: "Les formules ne peuvent pas être affichées pour le moment. Réessayez dans quelques instants.",
  },
  mine: {
    title: "Pas d'abonnement actif",
    description: "Souscrivez à une formule pour réserver vos trajets sans repayer à chaque fois.",
  },
  history: {
    title: "Historique vide",
    description: "Vos anciens abonnements et paiements d'abonnement apparaîtront ici.",
  },
} as const;

export const SUBSCRIPTIONS_MANAGE_CTA = "Gérer";
export const SUBSCRIPTIONS_MANAGE_TITLE = "Gestion des abonnements — bientôt disponible";

export const SUBSCRIPTIONS_ERROR = {
  title: "Impossible de charger vos abonnements",
  retry: "Réessayer",
} as const;

export const SUBSCRIPTIONS_SECTION_IDS = {
  faq: "subscriptions-faq",
  howItWorks: "subscriptions-how-it-works",
} as const;
