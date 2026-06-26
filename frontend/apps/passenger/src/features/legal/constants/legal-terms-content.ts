import {
  BookOpen,
  CreditCard,
  FileText,
  Gavel,
  Lock,
  Mail,
  QrCode,
  Scale,
  Shield,
  Ticket,
  User,
  Wallet,
} from "lucide-react";

import type { LegalDocumentSection, LegalHeroContent } from "@/features/legal/types/legal-document";

export const LEGAL_TERMS_HERO: LegalHeroContent = {
  title: "Conditions Générales d'Utilisation",
  lastUpdatedLabel: "Dernière mise à jour",
  lastUpdatedDate: "23 juin 2026",
  lastUpdatedIso: "2026-06-23",
  intro:
    "Veuillez lire attentivement les présentes Conditions Générales avant d'utiliser SharingGO.",
};

export const LEGAL_TERMS_SECTIONS: LegalDocumentSection[] = [
  {
    id: "presentation",
    number: 1,
    title: "Présentation",
    icon: BookOpen,
    paragraphs: [
      "SharingGO exploite une navette professionnelle sur la ligne Châlons-en-Champagne ↔ Paris-Vatry.",
      "L'application permet de consulter les trajets, réserver une place, payer en ligne et présenter un billet numérique à l'embarquement.",
      "Les présentes Conditions Générales s'appliquent à tout utilisateur de la plateforme SharingGO.",
    ],
  },
  {
    id: "objet",
    number: 2,
    title: "Objet",
    icon: FileText,
    paragraphs: [
      "Les CGU définissent les modalités d'accès et d'utilisation du service SharingGO.",
      "En créant un compte ou en effectuant une réservation, vous acceptez sans réserve les présentes conditions.",
      "Le service est proposé en version V1 : une ligne unique, huit départs par jour, huit places par trajet.",
    ],
  },
  {
    id: "compte",
    number: 3,
    title: "Compte utilisateur",
    icon: User,
    paragraphs: [
      "L'accès aux réservations nécessite un compte passager authentifié (Google OAuth ou autre moyen proposé).",
      "Vous vous engagez à fournir des informations exactes et à préserver la confidentialité de votre session.",
      "SharingGO se réserve le droit de suspendre un compte en cas d'usage frauduleux ou contraire aux présentes CGU.",
    ],
  },
  {
    id: "reservations",
    number: 4,
    title: "Réservations",
    icon: Ticket,
    paragraphs: [
      "Une réservation est initiée depuis la page Trajets pour un créneau disponible.",
      "Une place est provisoirement retenue pendant la phase de paiement (durée limitée).",
      "La réservation est confirmée uniquement après validation du paiement par Stripe.",
      "L'annulation en ligne n'est pas encore disponible : toute demande doit être adressée au support.",
    ],
  },
  {
    id: "paiement",
    number: 5,
    title: "Paiement",
    icon: Wallet,
    paragraphs: [
      "Le tarif unitaire d'un trajet est de 8,99 € TTC, sauf couverture par un abonnement actif.",
      "Les paiements sont traités par Stripe. SharingGO ne conserve pas vos données bancaires complètes.",
      "En cas d'échec de paiement, la réservation n'est pas confirmée et la place redevient disponible.",
      "Les remboursements éventuels sont traités selon les délais bancaires habituels (5 à 10 jours ouvrés).",
    ],
  },
  {
    id: "billets-qr",
    number: 6,
    title: "Billets QR",
    icon: QrCode,
    paragraphs: [
      "Après confirmation, un billet numérique avec QR code est accessible depuis Mes réservations.",
      "Le QR code est personnel, à usage unique et valable jusqu'à dix minutes après l'heure de départ prévue.",
      "Le conducteur scanne le code pour valider l'embarquement. Toute reproduction ou partage est interdit.",
    ],
  },
  {
    id: "abonnements",
    number: 7,
    title: "Abonnements",
    icon: CreditCard,
    paragraphs: [
      "Des formules d'abonnement mensuel peuvent être proposées pour réserver sans paiement unitaire à chaque trajet.",
      "La formule Mosolf est réservée aux collaborateurs disposant d'un code entreprise à usage unique.",
      "L'activation d'un abonnement Mosolf désactive les autres abonnements actifs sur le compte.",
      "La résiliation s'effectue selon les modalités indiquées sur la page Abonnements ou via le support.",
    ],
  },
  {
    id: "responsabilites",
    number: 8,
    title: "Responsabilités",
    icon: Scale,
    paragraphs: [
      "SharingGO s'efforce d'assurer la ponctualité et la qualité du service, sans garantie d'absence d'interruption.",
      "L'utilisateur est responsable de se présenter à l'arrêt indiqué dans les délais requis (15 minutes avant le départ recommandé).",
      "SharingGO ne saurait être tenu responsable des retards imputables à des circonstances indépendantes de sa volonté (trafic, intempéries, force majeure).",
    ],
  },
  {
    id: "donnees",
    number: 9,
    title: "Données personnelles",
    icon: Lock,
    paragraphs: [
      "SharingGO traite vos données dans le respect du RGPD et de sa Politique de confidentialité.",
      "Les données collectées servent à la gestion des réservations, du compte et du support client.",
      "Pour exercer vos droits (accès, rectification, suppression), contactez support@sharinggo.fr.",
    ],
  },
  {
    id: "suspension",
    number: 10,
    title: "Suspension",
    icon: Shield,
    paragraphs: [
      "SharingGO peut suspendre ou résilier l'accès au service en cas de violation des CGU ou de comportement abusif.",
      "Les réservations confirmées et payées restent soumises aux conditions applicables au moment de la réservation.",
      "Aucune suppression massive de données n'est effectuée sans procédure de traçabilité interne.",
    ],
  },
  {
    id: "propriete",
    number: 11,
    title: "Propriété intellectuelle",
    icon: Gavel,
    paragraphs: [
      "L'ensemble des éléments de la plateforme (marque, interface, textes, visuels) est protégé par le droit de la propriété intellectuelle.",
      "Toute reproduction ou exploitation non autorisée est interdite.",
      "Le contenu juridique de cette page pourra être mis à jour après validation par un conseil juridique.",
    ],
  },
  {
    id: "modification",
    number: 12,
    title: "Modification des CGU",
    icon: FileText,
    paragraphs: [
      "SharingGO peut modifier les présentes CGU pour refléter l'évolution du service ou la réglementation.",
      "La date de dernière mise à jour est indiquée en tête de page.",
      "La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.",
    ],
  },
  {
    id: "contact",
    number: 13,
    title: "Contact",
    icon: Mail,
    paragraphs: [
      "Pour toute question relative aux présentes CGU, contactez notre équipe support.",
      "Email : support@sharinggo.fr — Téléphone : 07 80 90 10 20.",
      "Vous pouvez également utiliser le formulaire de contact disponible sur la page dédiée.",
    ],
  },
];

export const LEGAL_CONTACT_CARD = {
  title: "Une question ?",
  email: "support@sharinggo.fr",
  phone: "07 80 90 10 20",
  cta: "Nous contacter",
} as const;

export const LEGAL_ERROR = {
  title: "Impossible de charger les Conditions Générales",
  retry: "Réessayer",
} as const;
