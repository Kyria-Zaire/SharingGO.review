import { cn } from "@/lib/cn";
import type { LegalTermsSection } from "@/features/legal/constants/legal-terms-content";

export function LegalSection({ section }: { section: LegalTermsSection }) {
  const Icon = section.icon;

  return (
    <section
      id={section.id}
      className="scroll-mt-28 space-y-4 border-b border-white/[0.06] pb-10 last:border-b-0"
      aria-labelledby={`legal-section-${section.id}-title`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
            Section {section.number}
          </p>
          <h2
            id={`legal-section-${section.id}-title`}
            className="mt-1 text-xl font-bold text-foreground sm:text-2xl"
          >
            {section.title}
          </h2>
        </div>
      </div>

      <div className="space-y-4 pl-0 sm:pl-12">
        {section.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className={cn(
              "max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]"
            )}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
