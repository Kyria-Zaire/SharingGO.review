import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { HELP_CATEGORY_LABELS, HELP_FAQ_TITLE } from "@/features/help/constants/help-content";
import type { HelpFaqItem } from "@/features/help/constants/help-content";

export function HelpFaqSection({ items }: { items: readonly HelpFaqItem[] }) {
  return (
    <section aria-labelledby="help-faq-title">
      <h2 id="help-faq-title" className="text-lg font-bold text-foreground">
        {HELP_FAQ_TITLE}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} question{items.length > 1 ? "s" : ""} affichée{items.length > 1 ? "s" : ""}
      </p>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <details
            key={item.id}
            id={item.id}
            className="group rounded-xl border border-white/[0.08] bg-[#121212] open:border-primary/30 open:bg-primary/5"
          >
            <summary
              className={cn(
                "flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground",
                "[&::-webkit-details-marker]:hidden"
              )}
            >
              <span className="flex min-w-0 flex-col gap-1 text-left sm:flex-row sm:items-center sm:gap-3">
                <span>{item.question}</span>
                <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-wide text-primary/80">
                  {HELP_CATEGORY_LABELS[item.category]}
                </span>
              </span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="border-t border-white/[0.08] px-4 pb-4 pt-2 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
