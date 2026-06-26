import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { CONTACT_FAQ } from "@/features/contact/constants/contact-content";
import { ROUTES } from "@/types/routes";

export function ContactFaqCard() {
  return (
    <section className={cn(landingCardClass, "bg-[#121212] p-6")} aria-labelledby="contact-faq-title">
      <h2 id="contact-faq-title" className="text-base font-semibold text-foreground">
        {CONTACT_FAQ.title}
      </h2>

      <ul className="mt-4 divide-y divide-white/[0.06]">
        {CONTACT_FAQ.items.map((item) => (
          <li key={item.id}>
            <Link
              to={`${ROUTES.help}#${item.helpAnchor}`}
              className="flex min-h-touch items-center justify-between gap-3 py-3 text-sm text-foreground transition-colors hover:text-primary"
            >
              {item.question}
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
