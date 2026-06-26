import { PiggyBank, Route, Headphones, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { SUBSCRIPTIONS_WHY_INTRO, SUBSCRIPTIONS_WHY_ITEMS } from "@/features/subscriptions/constants/subscriptions-content";

const WHY_ICONS = {
  savings: PiggyBank,
  flexibility: Route,
  reliability: ShieldCheck,
  support: Headphones,
} as const;

export function SubscriptionsWhySection() {
  return (
    <section className="pt-10 lg:pt-12" aria-labelledby="subscriptions-why-title">
      <h2 id="subscriptions-why-title" className="text-xl font-bold text-foreground">
        Pourquoi choisir SharingGO
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{SUBSCRIPTIONS_WHY_INTRO}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SUBSCRIPTIONS_WHY_ITEMS.map((item) => {
          const Icon = WHY_ICONS[item.id as keyof typeof WHY_ICONS] ?? ShieldCheck;
          return (
            <article
              key={item.id}
              className={cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
