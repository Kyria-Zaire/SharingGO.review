import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/features/home/components/SectionHeading";
import { cn } from "@/lib/cn";
import { FAQ_ITEMS, LANDING_SECTION_IDS } from "@/features/home/constants/landing-content";

export function FaqSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.faq}
      className="scroll-mt-20 border-t border-border py-8"
      aria-labelledby="landing-faq-title"
    >
      <SectionHeading
        id="landing-faq-title"
        title="Questions fréquentes"
        description="Réponses courtes aux questions essentielles."
      />

      <div className="space-y-2">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.id}
            className="group rounded-xl border border-border bg-muted/20 open:border-primary/30 open:bg-primary/5"
          >
            <summary
              className={cn(
                "flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground",
                "[&::-webkit-details-marker]:hidden"
              )}
            >
              {item.question}
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="border-t border-border px-4 pb-4 pt-2 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
