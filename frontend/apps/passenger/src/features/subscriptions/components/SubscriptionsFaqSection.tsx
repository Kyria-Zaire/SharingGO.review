import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  SUBSCRIPTIONS_FAQ_ITEMS,
  SUBSCRIPTIONS_SECTION_IDS,
} from "@/features/subscriptions/constants/subscriptions-content";

export function SubscriptionsFaqSection() {
  return (
    <section
      id={SUBSCRIPTIONS_SECTION_IDS.faq}
      className="scroll-mt-24 pt-10 lg:pt-12"
      aria-labelledby="subscriptions-faq-title"
    >
      <h2 id="subscriptions-faq-title" className="text-xl font-bold text-foreground">
        Questions fréquentes
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tout ce qu&apos;il faut savoir avant de choisir votre formule.
      </p>

      <div className="mt-6 space-y-2">
        {SUBSCRIPTIONS_FAQ_ITEMS.map((item) => (
          <details
            key={item.id}
            className="group rounded-xl border border-white/[0.08] bg-[#121212] open:border-primary/30 open:bg-primary/5"
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
            <p className="border-t border-white/[0.08] px-4 pb-4 pt-2 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
