import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { PROFILE_LOYALTY } from "@/features/profile/constants/profile-content";

const CARD_CLASS = cn(
  landingCardClass,
  "border-primary/20 bg-gradient-to-br from-[#121212] to-[#0f1a12] p-5 sm:p-6"
);

export function ProfileLoyaltyCard({ tripsCompleted }: { tripsCompleted: number }) {
  return (
    <article className={CARD_CLASS} aria-label="Fidélité">
      <p className="text-sm text-muted-foreground">{PROFILE_LOYALTY.prefix}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">
        {tripsCompleted}{" "}
        <span className="text-lg font-semibold text-muted-foreground">{PROFILE_LOYALTY.suffix}</span>
      </p>
      <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
        <Heart className="h-4 w-4 text-primary" aria-hidden />
        {PROFILE_LOYALTY.thanks}
      </p>
      <p className="mt-4 text-xs text-muted-foreground">{PROFILE_LOYALTY.futureHint}</p>
    </article>
  );
}
