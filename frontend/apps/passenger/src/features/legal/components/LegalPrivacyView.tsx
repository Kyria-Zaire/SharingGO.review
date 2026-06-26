import { LegalDocumentLayout } from "@/features/legal/components/LegalDocumentLayout";
import { LEGAL_PRIVACY_DOCUMENT_META } from "@/features/legal/constants/legal-document-meta";
import {
  LEGAL_PRIVACY_HERO,
  LEGAL_PRIVACY_SECTIONS,
} from "@/features/legal/constants/legal-privacy-content";

export function LegalPrivacyView() {
  return (
    <LegalDocumentLayout
      hero={LEGAL_PRIVACY_HERO}
      meta={LEGAL_PRIVACY_DOCUMENT_META}
      sections={LEGAL_PRIVACY_SECTIONS}
      articleLabel="Contenu de la Politique de confidentialité"
    />
  );
}
