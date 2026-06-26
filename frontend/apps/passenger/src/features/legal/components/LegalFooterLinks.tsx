import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { LEGAL_FOOTER_LINKS_TITLE } from "@/features/legal/types/legal-document";
import { ROUTES } from "@/types/routes";

const LEGAL_LINKS = [
  { label: "CGU", to: ROUTES.legalTerms },
  { label: "Politique de confidentialité", to: ROUTES.legalPrivacy },
  { label: "Mentions légales", to: ROUTES.legalNotice },
  { label: "Contact", to: ROUTES.contact },
] as const;

export function LegalFooterLinks() {
  const { pathname } = useLocation();

  return (
    <nav
      className={cn(landingCardClass, "bg-[#121212] p-6")}
      aria-labelledby="legal-footer-links-title"
    >
      <h2 id="legal-footer-links-title" className="text-base font-semibold text-foreground">
        {LEGAL_FOOTER_LINKS_TITLE}
      </h2>

      <ul className="mt-4 divide-y divide-white/[0.06]">
        {LEGAL_LINKS.map((link) => {
          const isCurrent = pathname === link.to;

          return (
            <li key={link.label}>
              {isCurrent ? (
                <span
                  className="flex min-h-touch items-center justify-between gap-3 py-3 text-sm font-medium text-primary"
                  aria-current="page"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                </span>
              ) : (
                <Link
                  to={link.to}
                  className="flex min-h-touch items-center justify-between gap-3 py-3 text-sm text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
