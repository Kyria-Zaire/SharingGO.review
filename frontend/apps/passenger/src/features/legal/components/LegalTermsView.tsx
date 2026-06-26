import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { LegalContactCard } from "@/features/legal/components/LegalContactCard";
import { LegalDocumentMetaCard } from "@/features/legal/components/LegalDocumentMetaCard";
import { LegalFooterLinks } from "@/features/legal/components/LegalFooterLinks";
import { LegalHeroSection } from "@/features/legal/components/LegalHeroSection";
import { LegalSection } from "@/features/legal/components/LegalSection";
import { LegalSkeleton } from "@/features/legal/components/LegalSkeleton";
import { LegalTableOfContents } from "@/features/legal/components/LegalTableOfContents";
import { useLegalActiveSection } from "@/features/legal/hooks/useLegalActiveSection";
import { LEGAL_TERMS_DOCUMENT_META } from "@/features/legal/constants/legal-document-meta";
import { LEGAL_TERMS_SECTIONS } from "@/features/legal/constants/legal-terms-content";

export function LegalTermsView() {
  const [contentReady, setContentReady] = useState(false);
  const activeSection = useLegalActiveSection(contentReady);

  useEffect(() => {
    setContentReady(false);
    const timer = window.setTimeout(() => setContentReady(true), 280);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      <LegalHeroSection />

      <div className={landingContainerClass}>
        <div className={cn("relative z-20 -mt-4 sm:-mt-8 lg:-mt-10", "pb-8 pt-6 lg:pb-12")}>
          {!contentReady ? <LegalSkeleton /> : null}

          {contentReady ? (
            <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
              <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <LegalDocumentMetaCard meta={LEGAL_TERMS_DOCUMENT_META} />
                <LegalTableOfContents activeSection={activeSection} />
              </div>

              <div className="min-w-0 space-y-10">
                <article className="max-w-3xl space-y-2" aria-label="Contenu des Conditions Générales">
                  {LEGAL_TERMS_SECTIONS.map((section) => (
                    <LegalSection key={section.id} section={section} />
                  ))}
                </article>

                <div className="grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
                  <LegalContactCard />
                  <LegalFooterLinks />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
