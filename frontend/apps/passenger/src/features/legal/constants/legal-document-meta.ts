export const LEGAL_DOCUMENT_META_LABELS = {
  readingTime: "Temps de lecture",
  lastUpdated: "Dernière mise à jour",
  version: "Version",
} as const;

export interface LegalDocumentMeta {
  readingTime: string;
  lastUpdatedDate: string;
  lastUpdatedIso: string;
  version: string;
}

export const LEGAL_TERMS_DOCUMENT_META: LegalDocumentMeta = {
  readingTime: "≈ 8 minutes",
  lastUpdatedDate: "23 juin 2026",
  lastUpdatedIso: "2026-06-23",
  version: "1.0",
};
