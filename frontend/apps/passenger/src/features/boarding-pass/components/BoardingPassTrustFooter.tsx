import { BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { BOARDING_PASS_TRUST_ITEMS } from "@/features/boarding-pass/constants/boarding-pass-content";

const TRUST_ICONS = [ShieldCheck, Lock, BadgeCheck] as const;

export function BoardingPassTrustFooter() {
  return (
    <footer
      className="flex flex-col items-center justify-center gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:gap-8"
      aria-label="Garanties SharingGO"
    >
      {BOARDING_PASS_TRUST_ITEMS.map((label, index) => {
        const Icon = TRUST_ICONS[index] ?? ShieldCheck;
        return (
          <p key={label} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4 text-primary" aria-hidden />
            {label}
          </p>
        );
      })}
    </footer>
  );
}
