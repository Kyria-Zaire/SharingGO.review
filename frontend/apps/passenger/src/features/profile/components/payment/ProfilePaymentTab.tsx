import { CreditCard, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { PROFILE_PAYMENT } from "@/features/profile/constants/profile-content";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

export function ProfilePaymentTab() {
  return (
    <article className={cn(CARD_CLASS, "mt-6 max-w-2xl")} aria-label={PROFILE_PAYMENT.title}>
      <h2 className="text-lg font-semibold text-foreground">{PROFILE_PAYMENT.title}</h2>

      <div className="mt-6 flex items-start gap-4 rounded-xl border border-white/[0.06] bg-[#161616] p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#121212] text-muted-foreground">
          <CreditCard className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{PROFILE_PAYMENT.noCard}</p>
          <p className="mt-1 text-sm text-muted-foreground">{PROFILE_PAYMENT.stripeNote}</p>
        </div>
      </div>

      <Button
        variant="secondary"
        className="mt-6 gap-2"
        disabled
        title={PROFILE_PAYMENT.addDisabledTitle}
      >
        <Plus className="h-4 w-4" aria-hidden />
        {PROFILE_PAYMENT.addCta}
      </Button>
    </article>
  );
}
