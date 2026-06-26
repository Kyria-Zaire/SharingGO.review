import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  LEGAL_TERMS_SECTIONS,
  LEGAL_TERMS_TOC_TITLE,
  type LegalTermsSectionId,
} from "@/features/legal/constants/legal-terms-content";

function scrollToSection(id: LegalTermsSectionId) {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function TocButton({
  number,
  title,
  sectionId,
  isActive,
  onNavigate,
}: {
  number: number;
  title: string;
  sectionId: LegalTermsSectionId;
  isActive: boolean;
  onNavigate: (id: LegalTermsSectionId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(sectionId)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
        "hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold",
          isActive ? "bg-primary/20 text-primary" : "bg-white/[0.08] text-muted-foreground"
        )}
      >
        {number}
      </span>
      <span className="leading-snug">{title}</span>
    </button>
  );
}

export function LegalTableOfContents({
  activeSection,
}: {
  activeSection: LegalTermsSectionId;
}) {
  const handleNavigate = (id: LegalTermsSectionId) => {
    scrollToSection(id);
  };

  return (
    <>
      <nav
        className={cn(landingCardClass, "hidden bg-[#121212] p-4 lg:block")}
        aria-label={LEGAL_TERMS_TOC_TITLE}
      >
        <h2 className="px-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {LEGAL_TERMS_TOC_TITLE}
        </h2>
        <ul className="mt-3 space-y-0.5">
          {LEGAL_TERMS_SECTIONS.map((section) => (
            <li key={section.id}>
              <TocButton
                number={section.number}
                title={section.title}
                sectionId={section.id}
                isActive={activeSection === section.id}
                onNavigate={handleNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      <details className={cn(landingCardClass, "group bg-[#121212] lg:hidden")}>
        <summary
          className={cn(
            "flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground",
            "[&::-webkit-details-marker]:hidden"
          )}
        >
          {LEGAL_TERMS_TOC_TITLE}
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <ul className="space-y-0.5 border-t border-white/[0.06] px-2 pb-3 pt-2">
          {LEGAL_TERMS_SECTIONS.map((section) => (
            <li key={section.id}>
              <TocButton
                number={section.number}
                title={section.title}
                sectionId={section.id}
                isActive={activeSection === section.id}
                onNavigate={handleNavigate}
              />
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
