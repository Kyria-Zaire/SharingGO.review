import { ArrowRight, Headphones, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  BOARDING_PASS_SUPPORT_CTA,
  BOARDING_PASS_SUPPORT_EMAIL,
  BOARDING_PASS_SUPPORT_PHONE,
  BOARDING_PASS_SUPPORT_SUBTITLE,
  BOARDING_PASS_SUPPORT_TITLE,
} from "@/features/boarding-pass/constants/boarding-pass-content";

const CARD_CLASS =
  "rounded-2xl border border-primary/25 bg-[#121212] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:p-6";

const supportPhoneHref = BOARDING_PASS_SUPPORT_PHONE.replace(/\s/g, "");

export function BoardingPassSupportSection() {
  return (
    <section className={CARD_CLASS} aria-label="Support passager">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-base font-semibold text-foreground">{BOARDING_PASS_SUPPORT_TITLE}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{BOARDING_PASS_SUPPORT_SUBTITLE}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          <a
            href={`mailto:${BOARDING_PASS_SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
            {BOARDING_PASS_SUPPORT_EMAIL}
          </a>
          <a
            href={`tel:${supportPhoneHref}`}
            className="inline-flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
            {BOARDING_PASS_SUPPORT_PHONE}
          </a>
        </div>

        <a
          href={`mailto:${BOARDING_PASS_SUPPORT_EMAIL}`}
          className={cn(
            "inline-flex min-h-[2.5rem] shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5",
            "text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          )}
        >
          {BOARDING_PASS_SUPPORT_CTA}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}
