import type { LucideIcon } from "lucide-react";

export interface LegalHeroContent {
  title: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  lastUpdatedIso: string;
  intro: string;
}

export interface LegalDocumentSection {
  id: string;
  number: number;
  title: string;
  icon: LucideIcon;
  paragraphs: readonly string[];
}

export const LEGAL_TOC_TITLE = "Sommaire";

export const LEGAL_FOOTER_LINKS_TITLE = "Pages légales";
