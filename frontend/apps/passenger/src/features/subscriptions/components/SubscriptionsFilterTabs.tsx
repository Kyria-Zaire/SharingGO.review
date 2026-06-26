import { BadgePercent, Clock3, CreditCard } from "lucide-react";
import { cn } from "@/lib/cn";
import { SUBSCRIPTIONS_FILTER_LABELS } from "@/features/subscriptions/constants/subscriptions-content";
import type { SubscriptionsFilter } from "@/features/subscriptions/lib/subscriptions-tabs";
import { SUBSCRIPTIONS_FILTERS } from "@/features/subscriptions/lib/subscriptions-tabs";

const FILTER_ICONS = {
  plans: BadgePercent,
  mine: CreditCard,
  history: Clock3,
} as const;

export function SubscriptionsFilterTabs({
  value,
  onChange,
  counts,
}: {
  value: SubscriptionsFilter;
  onChange: (filter: SubscriptionsFilter) => void;
  counts?: Partial<Record<SubscriptionsFilter, number>>;
}) {
  return (
    <div
      className="flex gap-6 overflow-x-auto border-b border-white/[0.08] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Sections abonnements"
    >
      {SUBSCRIPTIONS_FILTERS.map((filter) => {
        const isActive = value === filter;
        const Icon = FILTER_ICONS[filter];
        const count = counts?.[filter];

        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative flex min-h-touch shrink-0 items-center gap-2 pb-3 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(filter)}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {SUBSCRIPTIONS_FILTER_LABELS[filter]}
            {typeof count === "number" && count > 0 ? (
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold",
                  isActive ? "bg-primary/20 text-primary" : "bg-white/[0.08] text-muted-foreground"
                )}
              >
                {count}
              </span>
            ) : null}
            {isActive ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
