import {
  Building2,
  Copyright,
  Lock,
  Mail,
  Scale,
  Server,
  UserCircle,
} from "lucide-react";
import type { LegalDocumentSection, LegalHeroContent } from "@/features/legal/types/legal-document";

export const LEGAL_NOTICE_HERO: LegalHeroContent = {
  title: "Mentions légales",
  lastUpdatedLabel: "Dernière mise à jour",
  lastUpdatedDate: "23 juin 2026",
  lastUpdatedIso: "2026-06-23",
  intro:
    "Informations relatives à l'éditeur, à l'hébergement et aux responsabilités du site SharingGO.",
};

export const LEGAL_NOTICE_PLACEHOLDER_NOTE =
  "Ces informations seront mises à jour avant la mise en production.";

export const LEGAL_NOTICE_SECTIONS: LegalDocumentSection[] = [
  {
    id: "editeur",
    number: 1,
    title: "Éditeur",
    icon: Building2,
    paragraphs: [
      "Le site et l'application SharingGO sont édités par :",
      "[Nom de la société] — [Forme juridique]",
      "Siège social : [Adresse complète]",
      "SIREN : [Numéro SIREN] — Capital social : [Montant]",
      LEGAL_NOTICE_PLACEHOLDER_NOTE,
    ],
  },
  {
    id: "responsable-publication",
    number: 2,
    title: "Responsable de publication",
    icon: UserCircle,
    paragraphs: [
      "Responsable de publication : [Nom du responsable]",
      "Contact : support@sharinggo.fr",
      LEGAL_NOTICE_PLACEHOLDER_NOTE,
    ],
  },
  {
    id: "hebergement",
    number: 3,
    title: "Hébergement",
    icon: Server,
    paragraphs: [
      "Le site est hébergé par :",
      "[Nom de l'hébergeur]",
      "[Adresse de l'hébergeur]",
      LEGAL_NOTICE_PLACEHOLDER_NOTE,
    ],
  },
  {
    id: "propriete-intellectuelle",
    number: 4,
    title: "Propriété intellectuelle",
    icon: Copyright,
    paragraphs: [
      "L'ensemble des éléments du site SharingGO (textes, visuels, logo, interface) est protégé par le droit de la propriété intellectuelle.",
      "Toute reproduction ou représentation non autorisée est interdite.",
    ],
  },
  {
    id: "responsabilite",
    number: 5,
    title: "Responsabilité",
    icon: Scale,
    paragraphs: [
      "SharingGO s'efforce d'assurer l'exactitude des informations publiées sur le site.",
      "L'éditeur ne saurait être tenu responsable des erreurs, omissions ou indisponibilités temporaires du service.",
      "L'utilisateur reste responsable de l'usage qu'il fait de la plateforme et de ses réservations.",
    ],
  },
  {
    id: "donnees-personnelles",
    number: 6,
    title: "Données personnelles",
    icon: Lock,
    paragraphs: [
      "Le traitement des données personnelles est décrit dans notre Politique de confidentialité.",
      "Pour exercer vos droits RGPD, contactez support@sharinggo.fr.",
    ],
  },
  {
    id: "contact",
    number: 7,
    title: "Contact",
    icon: Mail,
    paragraphs: [
      "Pour toute question relative aux présentes mentions légales :",
      "Email : support@sharinggo.fr — Téléphone : 07 80 90 10 20.",
      "Vous pouvez également utiliser la page Contact.",
    ],
  },
];

export const LEGAL_NOTICE_ERROR = {
  title: "Impossible de charger les Mentions légales",
  retry: "Réessayer",
} as const;
