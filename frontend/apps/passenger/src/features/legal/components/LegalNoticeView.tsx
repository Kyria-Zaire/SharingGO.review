import { LegalDocumentLayout } from "@/features/legal/components/LegalDocumentLayout";
import { LEGAL_NOTICE_DOCUMENT_META } from "@/features/legal/constants/legal-document-meta";
import {
  LEGAL_NOTICE_HERO,
  LEGAL_NOTICE_SECTIONS,
} from "@/features/legal/constants/legal-notice-content";

export function LegalNoticeView() {
  return (
    <LegalDocumentLayout
      hero={LEGAL_NOTICE_HERO}
      meta={LEGAL_NOTICE_DOCUMENT_META}
      sections={LEGAL_NOTICE_SECTIONS}
      articleLabel="Contenu des Mentions légales"
    />
  );
}
