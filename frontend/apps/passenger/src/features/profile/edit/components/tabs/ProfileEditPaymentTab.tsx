import { CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { PROFILE_EDIT_PAYMENT } from "@/features/profile/edit/constants/profile-edit-content";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

export function ProfileEditPaymentTab() {
  return (
    <article className={cn(CARD_CLASS, "mt-6 max-w-2xl")} aria-label={PROFILE_EDIT_PAYMENT.title}>
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold text-foreground">{PROFILE_EDIT_PAYMENT.title}</h2>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{PROFILE_EDIT_PAYMENT.stripeManaged}</p>

      <div className="mt-6 flex items-start gap-4 rounded-xl border border-white/[0.06] bg-[#161616] p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#121212] text-muted-foreground">
          <CreditCard className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{PROFILE_EDIT_PAYMENT.empty}</p>
          <p className="mt-1 text-sm text-muted-foreground">{PROFILE_EDIT_PAYMENT.stripeNote}</p>
        </div>
      </div>

      <Button
        variant="secondary"
        className="mt-6"
        disabled
        title={PROFILE_EDIT_PAYMENT.manageSoonTitle}
      >
        {PROFILE_EDIT_PAYMENT.manageCta}
      </Button>
    </article>
  );
}
