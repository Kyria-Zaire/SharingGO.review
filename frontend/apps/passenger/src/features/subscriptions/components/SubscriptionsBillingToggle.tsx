import { cn } from "@/lib/cn";
import { SUBSCRIPTIONS_BILLING_TOGGLE } from "@/features/subscriptions/constants/subscriptions-content";

export type BillingPeriod = "monthly" | "annual";

export function SubscriptionsBillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}) {
  return (
    <div
      className="inline-flex rounded-xl border border-white/[0.08] bg-[#121212] p-1"
      role="group"
      aria-label="Période de facturation"
    >
      <button
        type="button"
        aria-pressed={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(
          "min-h-touch rounded-lg px-4 text-sm font-semibold transition-colors",
          value === "monthly"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {SUBSCRIPTIONS_BILLING_TOGGLE.monthly}
      </button>

      <button
        type="button"
        aria-pressed={value === "annual"}
        onClick={() => onChange("annual")}
        className={cn(
          "relative min-h-touch rounded-lg px-4 text-sm font-semibold transition-colors",
          value === "annual"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {SUBSCRIPTIONS_BILLING_TOGGLE.annual}
        <span className="ml-2 inline-flex rounded-md bg-white/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide">
          {SUBSCRIPTIONS_BILLING_TOGGLE.annualSoon}
        </span>
      </button>
    </div>
  );
}
