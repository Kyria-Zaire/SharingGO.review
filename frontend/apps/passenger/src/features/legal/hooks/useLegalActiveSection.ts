import { useEffect, useState } from "react";
import type { LegalDocumentSection } from "@/features/legal/types/legal-document";

export function useLegalActiveSection(
  sections: readonly LegalDocumentSection[],
  defaultSectionId: string,
  enabled: boolean
): string {
  const [activeSection, setActiveSection] = useState(defaultSectionId);

  useEffect(() => {
    if (!enabled) return;

    const sectionIds = sections.map((section) => section.id);
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
          setActiveSection(top.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [enabled, sections]);

  return activeSection;
}
