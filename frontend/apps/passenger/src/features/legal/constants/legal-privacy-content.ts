import {
  Archive,
  BookOpen,
  Cookie,
  CreditCard,
  Database,
  FileText,
  LogIn,
  Mail,
  Scale,
  Shield,
  Ticket,
  Workflow,
} from "lucide-react";
import type { LegalDocumentSection, LegalHeroContent } from "@/features/legal/types/legal-document";

export const LEGAL_PRIVACY_HERO: LegalHeroContent = {
  title: "Politique de confidentialité",
  lastUpdatedLabel: "Dernière mise à jour",
  lastUpdatedDate: "23 juin 2026",
  lastUpdatedIso: "2026-06-23",
  intro:
    "Découvrez comment SharingGO collecte, utilise et protège vos données personnelles.",
};

export const LEGAL_PRIVACY_SECTIONS: LegalDocumentSection[] = [
  {
    id: "introduction",
    number: 1,
    title: "Introduction",
    icon: BookOpen,
    paragraphs: [
      "SharingGO s'engage à protéger la vie privée des passagers utilisant sa plateforme de réservation.",
      "Cette politique décrit les données que nous traitons, les finalités associées et vos droits en tant qu'utilisateur.",
      "Le texte présenté ici est une version de travail, destinée à être validée par un conseil juridique avant production.",
    ],
  },
  {
    id: "donnees-collectees",
    number: 2,
    title: "Données collectées",
    icon: Database,
    paragraphs: [
      "Nous pouvons collecter : identité (nom, prénom, email), photo de profil Google, numéro de téléphone, historique de réservations et d'abonnements.",
      "Lors du paiement, Stripe traite les données bancaires nécessaires — SharingGO n'en conserve pas l'intégralité.",
      "Des données techniques (logs, adresse IP, navigateur) peuvent être enregistrées à des fins de sécurité et de diagnostic.",
    ],
  },
  {
    id: "utilisation",
    number: 3,
    title: "Utilisation des données",
    icon: Workflow,
    paragraphs: [
      "Vos données servent à créer et gérer votre compte, traiter vos réservations, émettre vos billets QR et assurer le support client.",
      "Nous utilisons également certaines informations pour améliorer le service et prévenir les usages frauduleux.",
      "SharingGO ne vend pas vos données personnelles à des tiers.",
    ],
  },
  {
    id: "google-auth",
    number: 4,
    title: "Authentification Google",
    icon: LogIn,
    paragraphs: [
      "Les passagers s'authentifient principalement via Google OAuth.",
      "Nous recevons les informations de profil autorisées par Google (email, nom, photo) pour identifier votre compte SharingGO.",
      "La gestion de votre compte Google reste soumise aux conditions de Google.",
    ],
  },
  {
    id: "stripe",
    number: 5,
    title: "Paiements Stripe",
    icon: CreditCard,
    paragraphs: [
      "Les paiements de billets et d'abonnements sont traités par Stripe, prestataire certifié PCI-DSS.",
      "SharingGO reçoit uniquement les informations nécessaires à la confirmation (statut, référence, montant) — pas vos coordonnées bancaires complètes.",
      "Consultez la politique de confidentialité de Stripe pour plus de détails sur le traitement côté prestataire.",
    ],
  },
  {
    id: "reservations",
    number: 6,
    title: "Réservations",
    icon: Ticket,
    paragraphs: [
      "Les données liées à vos trajets (horaires, statut, QR d'embarquement) sont conservées pour l'exécution du service.",
      "Le QR code JWT est généré pour valider l'embarquement et n'est pas réutilisable après scan.",
      "Ces informations peuvent être consultées depuis Mes réservations tant que votre compte est actif.",
    ],
  },
  {
    id: "conservation",
    number: 7,
    title: "Conservation",
    icon: Archive,
    paragraphs: [
      "Les données sont conservées pendant la durée nécessaire à la fourniture du service et aux obligations légales applicables.",
      "Les comptes inactifs ou les données obsolètes pourront faire l'objet d'une suppression ou d'une anonymisation selon notre politique interne.",
      "Les durées exactes de conservation seront précisées dans la version définitive de cette politique.",
    ],
  },
  {
    id: "droits-rgpd",
    number: 8,
    title: "Vos droits RGPD",
    icon: Scale,
    paragraphs: [
      "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition au traitement.",
      "Vous pouvez également demander la portabilité de vos données lorsque applicable.",
      "Pour exercer vos droits : support@sharinggo.fr. Une réponse vous sera adressée dans les délais réglementaires.",
    ],
  },
  {
    id: "cookies",
    number: 9,
    title: "Cookies",
    icon: Cookie,
    paragraphs: [
      "SharingGO utilise des cookies strictement nécessaires au fonctionnement de l'application (session, sécurité, préférences essentielles).",
      "Aucun bandeau cookies ni gestionnaire de consentement (CMP) n'est intégré dans cette version MVP.",
      "Une politique cookies détaillée pourra être ajoutée avant la mise en production.",
    ],
  },
  {
    id: "securite",
    number: 10,
    title: "Sécurité",
    icon: Shield,
    paragraphs: [
      "Nous appliquons des mesures techniques et organisationnelles : HTTPS, cookies HttpOnly, limitation de débit, validation des entrées.",
      "L'accès aux données est restreint aux personnes habilitées dans le cadre de leurs fonctions.",
      "En cas d'incident de sécurité affectant vos données, nous vous informerons selon la réglementation applicable.",
    ],
  },
  {
    id: "modifications",
    number: 11,
    title: "Modifications",
    icon: FileText,
    paragraphs: [
      "Cette politique peut être mise à jour pour refléter l'évolution du service ou de la réglementation.",
      "La date de dernière mise à jour est indiquée en tête de page.",
      "Nous vous invitons à consulter régulièrement cette page pour prendre connaissance des changements.",
    ],
  },
  {
    id: "contact",
    number: 12,
    title: "Contact",
    icon: Mail,
    paragraphs: [
      "Pour toute question relative à vos données personnelles, contactez notre équipe.",
      "Email : support@sharinggo.fr — Téléphone : 07 80 90 10 20.",
      "Vous pouvez également utiliser la page Contact pour nous écrire.",
    ],
  },
];

export const LEGAL_PRIVACY_ERROR = {
  title: "Impossible de charger la Politique de confidentialité",
  retry: "Réessayer",
} as const;
