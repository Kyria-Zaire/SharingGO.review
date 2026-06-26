import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  SUBSCRIPTIONS_PROMO_BANNER,
  SUBSCRIPTIONS_SECTION_IDS,
} from "@/features/subscriptions/constants/subscriptions-content";

export function SubscriptionsPromoBanner() {
  const handleHowItWorks = () => {
    document.getElementById(SUBSCRIPTIONS_SECTION_IDS.faq)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div
      className={cn(
        landingCardClass,
        "flex flex-col gap-4 border-primary/25 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Info className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm leading-relaxed text-foreground sm:text-base">
          {SUBSCRIPTIONS_PROMO_BANNER.message}
        </p>
      </div>

      <button
        type="button"
        onClick={handleHowItWorks}
        className="inline-flex min-h-touch shrink-0 items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.04]"
      >
        {SUBSCRIPTIONS_PROMO_BANNER.cta}
      </button>
    </div>
  );
}
