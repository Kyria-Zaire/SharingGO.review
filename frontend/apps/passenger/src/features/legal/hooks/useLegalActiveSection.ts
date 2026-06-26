import { useEffect, useState } from "react";
import {
  LEGAL_TERMS_SECTIONS,
  type LegalTermsSectionId,
} from "@/features/legal/constants/legal-terms-content";

export function useLegalActiveSection(enabled: boolean): LegalTermsSectionId {
  const [activeSection, setActiveSection] = useState<LegalTermsSectionId>("presentation");

  useEffect(() => {
    if (!enabled) return;

    const sectionIds = LEGAL_TERMS_SECTIONS.map((section) => section.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        if (top?.target.id) {
          setActiveSection(top.target.id as LegalTermsSectionId);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [enabled]);

  return activeSection;
}
