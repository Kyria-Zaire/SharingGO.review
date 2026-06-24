import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Mail, Phone } from "lucide-react";
import {
  FOOTER_CONTACT,
  FOOTER_INFO_LINKS,
  FOOTER_SOCIAL_LINKS,
  FOOTER_USEFUL_LINKS,
  type FooterLink,
} from "@/constants/shell-navigation";
import { cn } from "@/lib/cn";
import { passengerHeaderContainerClass } from "@/lib/passenger-layout";
import { PassengerLogo } from "./PassengerLogo";
import { Button } from "@/components/ui/Button";

function FooterNavLink({ link }: { link: FooterLink }) {
  const to = link.hash ? { pathname: link.to, hash: link.hash } : link.to;
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {link.label}
      </Link>
    </li>
  );
}

function FooterBrandBlock() {
  return (
    <div className="space-y-4">
      <PassengerLogo />
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        La navette professionnelle entre Châlons-en-Champagne et Vatry.
      </p>
      {FOOTER_SOCIAL_LINKS.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Réseaux sociaux">
          {FOOTER_SOCIAL_LINKS.map((social) => (
            <li key={social.href}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-foreground hover:bg-muted/80"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FooterHelpContent() {
  return (
    <>
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <a
            href={`mailto:${FOOTER_CONTACT.email}`}
            className="break-all transition-colors hover:text-foreground"
          >
            {FOOTER_CONTACT.email}
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <a
            href={`tel:${FOOTER_CONTACT.phone.replace(/\s/g, "")}`}
            className="transition-colors hover:text-foreground"
          >
            {FOOTER_CONTACT.phone}
          </a>
        </li>
      </ul>
      <Link to={{ pathname: "/", hash: "#contact" }} className="mt-4 inline-block">
        <Button variant="primary" size="md" className="w-full sm:w-auto">
          Nous contacter
        </Button>
      </Link>
    </>
  );
}

function FooterAccordionPanel({
  title,
  panelId,
  children,
  defaultOpen = false,
}: {
  title: string;
  panelId: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerId = `${panelId}-trigger`;

  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-touch w-full items-center justify-between gap-3 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!open}
        className="pb-3"
      >
        {children}
      </div>
    </div>
  );
}

export function PassengerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-background" id="contact">
      <div className={`${passengerHeaderContainerClass} py-8 lg:py-14`}>
        <div className="mb-6 lg:hidden">
          <FooterBrandBlock />
        </div>

        <div className="space-y-0 lg:hidden">
          <FooterAccordionPanel title="Liens utiles" panelId="footer-useful-links">
            <ul className="space-y-2.5">
              {FOOTER_USEFUL_LINKS.map((link) => (
                <FooterNavLink key={link.label} link={link} />
              ))}
            </ul>
          </FooterAccordionPanel>

          <FooterAccordionPanel title="Informations" panelId="footer-info-links">
            <ul className="space-y-2.5">
              {FOOTER_INFO_LINKS.map((link) => (
                <FooterNavLink key={link.label} link={link} />
              ))}
            </ul>
          </FooterAccordionPanel>

          <FooterAccordionPanel title="Besoin d'aide ?" panelId="footer-help">
            <FooterHelpContent />
          </FooterAccordionPanel>
        </div>

        <div className="hidden gap-10 lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <FooterBrandBlock />
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">Liens utiles</h2>
            <ul className="space-y-2.5">
              {FOOTER_USEFUL_LINKS.map((link) => (
                <FooterNavLink key={link.label} link={link} />
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">Informations</h2>
            <ul className="space-y-2.5">
              {FOOTER_INFO_LINKS.map((link) => (
                <FooterNavLink key={link.label} link={link} />
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">Besoin d&apos;aide ?</h2>
            <FooterHelpContent />
          </div>
        </div>

        <p className="mt-6 border-t border-border/60 pt-5 text-center text-xs text-muted-foreground lg:mt-10 lg:pt-6">
          © {currentYear} SharingGO — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
