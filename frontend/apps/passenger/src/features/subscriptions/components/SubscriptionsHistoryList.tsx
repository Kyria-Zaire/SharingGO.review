import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import type { SubscriptionHistoryItem } from "@/features/subscriptions/lib/subscription-history";

function HistoryRow({ item }: { item: SubscriptionHistoryItem }) {
  return (
    <article
      className={cn(
        landingCardClass,
        "border-white/[0.08] bg-[#121212] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5"
      )}
    >
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{item.dateLabel}</p>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-3 text-xs sm:mt-0 sm:shrink-0 sm:gap-6">
        <div>
          <dt className="text-muted-foreground">Prix</dt>
          <dd className="mt-0.5 font-medium text-foreground">{item.priceLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Durée</dt>
          <dd className="mt-0.5 font-medium text-foreground">{item.durationLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Statut</dt>
          <dd className="mt-0.5 font-medium text-foreground">{item.statusLabel}</dd>
        </div>
      </dl>
    </article>
  );
}

export function SubscriptionsHistoryList({ items }: { items: SubscriptionHistoryItem[] }) {
  return (
    <ul className="space-y-4" aria-label="Historique des abonnements">
      {items.map((item) => (
        <li key={item.id}>
          <HistoryRow item={item} />
        </li>
      ))}
    </ul>
  );
}
