/** Copy page détail trajet — uniquement faits produit confirmés (CDC V1). */

/** Points d'arrêt officiels — timeline détail trajet. */
export const TRIP_DETAIL_STOP_POINTS = {
  chalons: "Gare Routière",
  vatry: "ZAC de Vatry – Parking Navette",
} as const;

export const TRIP_DETAIL_BADGES = {
  professional: "Navette professionnelle",
} as const;

export const TRIP_DETAIL_HERO_TRUST = [
  { id: "payment", label: "Paiement sécurisé" },
  { id: "confirm", label: "Confirmation après paiement" },
  { id: "seats", label: "Places limitées" },
] as const;

export const TRIP_DETAIL_RESERVATION_TRUST = [
  "Paiement sécurisé via Stripe",
  "Confirmation après validation du paiement",
] as const;

/** Spécifications affichées uniquement si confirmées produit. */
export const TRIP_DETAIL_SPECS = [
  {
    id: "frequency",
    label: "Fréquence",
    value: "Planning régulier sur la ligne Châlons ↔ Vatry",
  },
  {
    id: "type",
    label: "Type de navette",
    value: "Navette professionnelle SharingGO",
  },
  {
    id: "capacity",
    label: "Capacité",
    value: "8 places maximum par trajet",
  },
  {
    id: "luggage",
    label: "Bagages",
    value: "Prévoir un bagage de taille cabine",
  },
] as const;

/** Specs desktop — maquette PO (mobile : `TRIP_DETAIL_SPECS`). */
export const TRIP_DETAIL_SPECS_DESKTOP = [
  {
    id: "frequency",
    label: "Fréquence",
    value: "Tous les jours",
  },
  {
    id: "type",
    label: "Type de navette",
    value: "Navette professionnelle",
  },
  {
    id: "luggage",
    label: "Bagages",
    value: "1 bagage à main + 1 bagage en soute inclus",
  },
  {
    id: "accessibility",
    label: "Accessibilité",
    value: "Navette accessible PMR",
  },
  {
    id: "animals",
    label: "Animaux",
    value: "Animaux non autorisés",
  },
] as const;

export const TRIP_DETAIL_KNOW_BEFORE = [
  {
    id: "arrival",
    title: "Arrivez en avance",
    description:
      "Présentez-vous au point de départ au moins 10 minutes avant l'horaire indiqué.",
  },
  {
    id: "qr",
    title: "QR Code d'embarquement",
    description:
      "Votre QR personnel est disponible dans Mes réservations après confirmation du paiement.",
  },
  {
    id: "cancel",
    title: "Annulation",
    description:
      "Les conditions d'annulation vous sont indiquées avant la confirmation de votre réservation.",
  },
  {
    id: "delay",
    title: "En cas de retard",
    description:
      "Contactez le support SharingGO si vous risquez de manquer votre créneau.",
  },
] as const;

/** Checklist desktop — mobile : accordéon `TRIP_DETAIL_KNOW_BEFORE`. */
export const TRIP_DETAIL_KNOW_BEFORE_CHECKLIST = [
  {
    id: "arrival",
    text: "Merci d'arriver 10 minutes avant le départ.",
  },
  {
    id: "qr",
    text: "Présentez votre QR code au chauffeur lors de l'embarquement.",
  },
  {
    id: "cancel",
    text: "Annulation gratuite jusqu'à 2h avant le départ.",
  },
  {
    id: "delay",
    text: "En cas de retard, prévenez-nous via l'application.",
  },
] as const;

export const TRIP_DETAIL_SHUTTLE = {
  title: "À propos de notre navette",
  description:
    "Véhicules récents, sièges confortables et chauffeurs professionnels pour vos trajets Châlons-en-Champagne ↔ Vatry.",
} as const;

/** Bloc navette intégré dans « Ce qu'il faut savoir » (desktop). */
export const TRIP_DETAIL_SHUTTLE_DESKTOP = {
  title: TRIP_DETAIL_SHUTTLE.title,
  description:
    "Nos navettes sont récentes, confortables et climatisées pour vous garantir un trajet agréable et en toute sécurité.",
} as const;

export const TRIP_DETAIL_REASSURANCE = [
  {
    id: "punctuality",
    title: "Ponctualité",
    description: "Des horaires fixes et un planning régulier sur la ligne.",
  },
  {
    id: "comfort",
    title: "Confort",
    description: "Intérieur premium pensé pour vos déplacements professionnels.",
  },
  {
    id: "security",
    title: "Sécurité",
    description: "Paiement en ligne sécurisé et QR personnel à l'embarquement.",
  },
  {
    id: "reliability",
    title: "Fiabilité",
    description: "Réservation obligatoire — votre place est garantie après paiement.",
  },
] as const;
