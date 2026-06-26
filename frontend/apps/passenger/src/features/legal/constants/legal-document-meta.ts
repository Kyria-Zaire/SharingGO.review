export const LEGAL_DOCUMENT_META_LABELS = {
  readingTime: "Temps de lecture",
  version: "Version",
  effectiveDate: "Entrée en vigueur",
  lastUpdated: "Dernière mise à jour",
} as const;

export interface LegalDocumentMeta {
  readingTime: string;
  version: string;
  effectiveDate: string;
  effectiveDateIso: string;
  lastUpdatedDate: string;
  lastUpdatedIso: string;
}

export const LEGAL_TERMS_DOCUMENT_META: LegalDocumentMeta = {
  readingTime: "≈ 8 minutes",
  version: "1.0",
  effectiveDate: "23 juin 2026",
  effectiveDateIso: "2026-06-23",
  lastUpdatedDate: "23 juin 2026",
  lastUpdatedIso: "2026-06-23",
};

export const LEGAL_PRIVACY_DOCUMENT_META: LegalDocumentMeta = {
  readingTime: "≈ 7 minutes",
  version: "1.0",
  effectiveDate: "23 juin 2026",
  effectiveDateIso: "2026-06-23",
  lastUpdatedDate: "23 juin 2026",
  lastUpdatedIso: "2026-06-23",
};

export const LEGAL_NOTICE_DOCUMENT_META: LegalDocumentMeta = {
  readingTime: "≈ 3 minutes",
  version: "1.0",
  effectiveDate: "23 juin 2026",
  effectiveDateIso: "2026-06-23",
  lastUpdatedDate: "23 juin 2026",
  lastUpdatedIso: "2026-06-23",
};
