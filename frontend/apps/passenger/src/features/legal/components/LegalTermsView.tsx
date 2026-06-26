import { LegalDocumentLayout } from "@/features/legal/components/LegalDocumentLayout";
import { LEGAL_TERMS_DOCUMENT_META } from "@/features/legal/constants/legal-document-meta";
import {
  LEGAL_TERMS_HERO,
  LEGAL_TERMS_SECTIONS,
} from "@/features/legal/constants/legal-terms-content";

export function LegalTermsView() {
  return (
    <LegalDocumentLayout
      hero={LEGAL_TERMS_HERO}
      meta={LEGAL_TERMS_DOCUMENT_META}
      sections={LEGAL_TERMS_SECTIONS}
      articleLabel="Contenu des Conditions Générales"
    />
  );
}
