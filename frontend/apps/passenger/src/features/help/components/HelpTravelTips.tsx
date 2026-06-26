import { Clock3, IdCard, Luggage, SearchCheck } from "lucide-react";
import {
  HELP_TRAVEL_TIPS,
  HELP_TRAVEL_TIPS_TITLE,
} from "@/features/help/constants/help-content";

const TIP_ICONS = {
  arrival: Clock3,
  qr: IdCard,
  check: SearchCheck,
  luggage: Luggage,
} as const;

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

export function HelpTravelTips() {
  return (
    <section className={CARD_CLASS} aria-labelledby="help-travel-tips-title">
      <h2 id="help-travel-tips-title" className="text-base font-semibold text-foreground">
        {HELP_TRAVEL_TIPS_TITLE}
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {HELP_TRAVEL_TIPS.map((tip) => {
          const Icon = TIP_ICONS[tip.id];
          return (
            <article key={tip.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <h3 className="text-sm font-semibold text-foreground">{tip.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{tip.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
