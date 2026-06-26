import { Mail, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass, landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";
import { HELP_SUPPORT } from "@/features/help/constants/help-content";

const supportMailto = `mailto:${HELP_SUPPORT.email}?subject=${encodeURIComponent("Demande d'aide SharingGO")}`;

export function HelpSupportCard() {
  return (
    <aside className={cn(landingCardClass, "bg-[#121212] p-6")} aria-labelledby="help-support-title">
      <h2 id="help-support-title" className="text-base font-semibold text-foreground">
        {HELP_SUPPORT.title}
      </h2>

      <ul className="mt-4 space-y-3 text-sm">
        <li>
          <a
            href={supportMailto}
            className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {HELP_SUPPORT.email}
          </a>
        </li>
        <li>
          <a
            href={`tel:${HELP_SUPPORT.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {HELP_SUPPORT.phone}
          </a>
        </li>
      </ul>

      <a href={supportMailto} className={cn(landingPrimaryButtonClass, "mt-6 w-full")}>
        <Mail className="h-4 w-4" aria-hidden />
        {HELP_SUPPORT.emailCta}
      </a>
    </aside>
  );
}
