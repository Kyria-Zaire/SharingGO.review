import { useState, type ReactNode } from "react";
import { Check, ChevronDown, Headphones, Info, Pencil, Phone, User } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  BOOKING_DETAIL_MODIFY_CTA,
  BOOKING_DETAIL_PRACTICAL_TIPS,
  BOOKING_DETAIL_SUPPORT,
  BOOKING_DETAIL_TIPS_CTA,
} from "@/features/bookings/constants/booking-detail-content";
import {
  formatPassengerFullName,
  formatPassengerPhone,
} from "@/features/bookings/lib/booking-detail-format";
import type { PassengerUser } from "@/types/auth";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

function MobileAccordionSection({
  title,
  panelId,
  defaultOpen = false,
  children,
}: {
  title: string;
  panelId: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerId = `${panelId}-trigger`;

  return (
    <div className={CARD_CLASS}>
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-touch w-full items-center justify-between gap-3 px-4 py-3 text-left"
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
        className="border-t border-white/[0.06] px-4 pb-4 pt-3"
      >
        {children}
      </div>
    </div>
  );
}

export function BookingDetailMobileSections({ user }: { user: PassengerUser | null }) {
  return (
    <section className="space-y-3 lg:hidden" aria-label="Informations complémentaires">
      <MobileAccordionSection
        title="Informations pratiques"
        panelId="booking-practical"
        defaultOpen={false}
      >
        <ul className="space-y-3">
          {BOOKING_DETAIL_PRACTICAL_TIPS.map((tip) => (
            <li key={tip.id} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{tip.label}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled
          className="mt-4 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium opacity-60"
        >
          <Info className="h-4 w-4" aria-hidden />
          {BOOKING_DETAIL_TIPS_CTA}
        </button>
      </MobileAccordionSection>

      <MobileAccordionSection
        title="Informations passager"
        panelId="booking-passenger"
        defaultOpen
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" aria-hidden />
          <span>Passager</span>
        </div>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Nom complet</dt>
            <dd className="mt-0.5 font-semibold text-foreground">
              {formatPassengerFullName(user)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5 text-foreground">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Téléphone</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{formatPassengerPhone()}</dd>
          </div>
        </dl>
        <button
          type="button"
          disabled
          className="mt-4 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium opacity-60"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          {BOOKING_DETAIL_MODIFY_CTA}
        </button>
      </MobileAccordionSection>

      <MobileAccordionSection title={BOOKING_DETAIL_SUPPORT.title} panelId="booking-support">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5">
              <a
                href={`mailto:${BOOKING_DETAIL_SUPPORT.email}`}
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                {BOOKING_DETAIL_SUPPORT.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Téléphone</dt>
            <dd className="mt-0.5">
              <a
                href={`tel:${BOOKING_DETAIL_SUPPORT.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 font-semibold text-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {BOOKING_DETAIL_SUPPORT.phone}
              </a>
            </dd>
          </div>
        </dl>
        <a
          href={`mailto:${BOOKING_DETAIL_SUPPORT.email}`}
          className="mt-4 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium transition-colors hover:bg-white/[0.04]"
        >
          <Headphones className="h-4 w-4" aria-hidden />
          {BOOKING_DETAIL_SUPPORT.cta}
        </a>
      </MobileAccordionSection>
    </section>
  );
}
