import {
  Bell,
  Bus,
  CalendarCheck,
  CreditCard,
  Settings2,
  User,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  HELP_CATEGORIES_TITLE,
  HELP_CATEGORY_DESCRIPTIONS,
  HELP_CATEGORY_LABELS,
} from "@/features/help/constants/help-content";
import type { HelpCategory, HelpCategoryFilter } from "@/features/help/lib/help-categories";

const CATEGORY_ICONS = {
  bookings: CalendarCheck,
  trips: Bus,
  subscriptions: CreditCard,
  payments: Wallet,
  account: User,
  notifications: Bell,
  settings: Settings2,
} as const;

export function HelpCategoriesGrid({
  selected,
  onSelect,
  counts,
}: {
  selected: HelpCategoryFilter;
  onSelect: (category: HelpCategoryFilter) => void;
  counts: Record<HelpCategory, number>;
}) {
  const categories = Object.keys(CATEGORY_ICONS) as HelpCategory[];

  return (
    <section aria-labelledby="help-categories-title">
      <h2 id="help-categories-title" className="text-lg font-bold text-foreground">
        {HELP_CATEGORIES_TITLE}
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={cn(
            landingCardClass,
            "flex min-h-[5.5rem] flex-col items-start gap-2 bg-[#121212] p-4 text-left transition-colors",
            "hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            selected === "all" && "border-primary/40 bg-primary/5"
          )}
        >
          <span className="text-sm font-semibold text-foreground">Toutes les thématiques</span>
          <span className="text-xs text-muted-foreground">Voir l&apos;ensemble des questions</span>
        </button>

        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const isActive = selected === category;
          const count = counts[category];

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={cn(
                landingCardClass,
                "flex min-h-[5.5rem] flex-col items-start gap-2 bg-[#121212] p-4 text-left transition-colors",
                "hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <span className="text-sm font-semibold text-foreground">
                    {HELP_CATEGORY_LABELS[category]}
                  </span>
                </div>
                {count > 0 ? (
                  <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
                    {count}
                  </span>
                ) : null}
              </div>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {HELP_CATEGORY_DESCRIPTIONS[category]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
