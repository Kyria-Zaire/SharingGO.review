import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { HELP_USEFUL_LINKS_TITLE } from "@/features/help/constants/help-content";
import { ROUTES } from "@/types/routes";

const USEFUL_LINKS: { label: string; to: string }[] = [
  { label: "Politique de confidentialité", to: ROUTES.legalPrivacy },
  { label: "CGU", to: ROUTES.legalTerms },
  { label: "Mentions légales", to: ROUTES.legalNotice },
  { label: "Paramètres", to: ROUTES.settings },
  { label: "Profil", to: ROUTES.profile },
  { label: "Abonnements", to: ROUTES.subscriptions },
];

export function HelpUsefulLinks() {
  return (
    <nav className={cn(landingCardClass, "bg-[#121212] p-6")} aria-labelledby="help-links-title">
      <h2 id="help-links-title" className="text-base font-semibold text-foreground">
        {HELP_USEFUL_LINKS_TITLE}
      </h2>

      <ul className="mt-4 divide-y divide-white/[0.06]">
        {USEFUL_LINKS.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="flex min-h-touch items-center justify-between gap-3 py-3 text-sm text-foreground transition-colors hover:text-primary"
            >
              {link.label}
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
