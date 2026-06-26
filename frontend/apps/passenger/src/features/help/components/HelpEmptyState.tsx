import { Mail, SearchX } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass, landingSecondaryButtonClass } from "@/features/home/lib/landing-layout";
import { HELP_EMPTY, HELP_SUPPORT } from "@/features/help/constants/help-content";

const supportMailto = `mailto:${HELP_SUPPORT.email}?subject=${encodeURIComponent("Demande d'aide SharingGO")}`;

export function HelpEmptyState() {
  return (
    <div
      className={cn(landingCardClass, "flex flex-col items-center bg-[#121212] px-6 py-12 text-center")}
      role="status"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06]">
        <SearchX className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{HELP_EMPTY.title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{HELP_EMPTY.description}</p>
      <a href={supportMailto} className={cn(landingSecondaryButtonClass, "mt-6 gap-2")}>
        <Mail className="h-4 w-4" aria-hidden />
        {HELP_EMPTY.contactCta}
      </a>
    </div>
  );
}
