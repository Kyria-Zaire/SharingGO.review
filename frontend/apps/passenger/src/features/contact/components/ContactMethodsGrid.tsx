import { HelpCircle, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  landingCardClass,
  landingOutlineButtonClass,
  landingPrimaryButtonClass,
} from "@/features/home/lib/landing-layout";
import {
  CONTACT_METHODS,
  CONTACT_SUPPORT,
  supportMailto,
} from "@/features/contact/constants/contact-content";
import { ROUTES } from "@/types/routes";

const CARD_CLASS = cn(landingCardClass, "flex flex-col bg-[#121212] p-6");

export function ContactMethodsGrid() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Moyens de contact">
      <article className={CARD_CLASS}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Mail className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">{CONTACT_METHODS.email.title}</h2>
        <p className="mt-2 text-sm font-medium text-foreground">{CONTACT_SUPPORT.email}</p>
        <p className="mt-1 text-sm text-muted-foreground">{CONTACT_SUPPORT.emailResponseTime}</p>
        <a href={supportMailto} className={cn(landingPrimaryButtonClass, "mt-6 w-full")}>
          {CONTACT_METHODS.email.cta}
        </a>
      </article>

      <article className={CARD_CLASS}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Phone className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">{CONTACT_METHODS.phone.title}</h2>
        <p className="mt-2 text-sm font-medium text-foreground">{CONTACT_SUPPORT.phone}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {CONTACT_SUPPORT.phoneHours}
          <br />
          {CONTACT_SUPPORT.phoneSchedule}
        </p>
        <a
          href={`tel:${CONTACT_SUPPORT.phone.replace(/\s/g, "")}`}
          className={cn(landingOutlineButtonClass, "mt-6 w-full")}
        >
          {CONTACT_METHODS.phone.cta}
        </a>
      </article>

      <article className={CARD_CLASS}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <HelpCircle className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">{CONTACT_METHODS.help.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{CONTACT_METHODS.help.description}</p>
        <Link to={ROUTES.help} className={cn(landingOutlineButtonClass, "mt-6 w-full")}>
          {CONTACT_METHODS.help.cta}
        </Link>
      </article>
    </section>
  );
}
