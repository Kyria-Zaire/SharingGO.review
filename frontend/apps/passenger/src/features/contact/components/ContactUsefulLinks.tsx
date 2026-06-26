import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { CONTACT_USEFUL_LINKS_TITLE } from "@/features/contact/constants/contact-content";
import { ROUTES } from "@/types/routes";

const USEFUL_LINKS = [
  { label: "Centre d'aide", to: ROUTES.help },
  { label: "CGU", to: ROUTES.legalTerms },
  { label: "Politique de confidentialité", to: ROUTES.legalPrivacy },
  { label: "Mentions légales", to: ROUTES.legalNotice },
] as const;

export function ContactUsefulLinks() {
  return (
    <nav className={cn(landingCardClass, "bg-[#121212] p-6")} aria-labelledby="contact-links-title">
      <h2 id="contact-links-title" className="text-base font-semibold text-foreground">
        {CONTACT_USEFUL_LINKS_TITLE}
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
