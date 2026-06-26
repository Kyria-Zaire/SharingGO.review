import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { landingCardClass, landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";
import { LEGAL_CONTACT_CARD } from "@/features/legal/constants/legal-terms-content";
import { ROUTES } from "@/types/routes";

export function LegalContactCard() {
  return (
    <aside
      className={cn(landingCardClass, "bg-[#121212] p-6")}
      aria-labelledby="legal-contact-title"
    >
      <h2 id="legal-contact-title" className="text-base font-semibold text-foreground">
        {LEGAL_CONTACT_CARD.title}
      </h2>

      <ul className="mt-4 space-y-3 text-sm">
        <li>
          <a
            href={`mailto:${LEGAL_CONTACT_CARD.email}`}
            className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {LEGAL_CONTACT_CARD.email}
          </a>
        </li>
        <li>
          <a
            href={`tel:${LEGAL_CONTACT_CARD.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {LEGAL_CONTACT_CARD.phone}
          </a>
        </li>
      </ul>

      <Link to={ROUTES.contact} className={cn(landingPrimaryButtonClass, "mt-6 w-full")}>
        {LEGAL_CONTACT_CARD.cta}
      </Link>
    </aside>
  );
}
