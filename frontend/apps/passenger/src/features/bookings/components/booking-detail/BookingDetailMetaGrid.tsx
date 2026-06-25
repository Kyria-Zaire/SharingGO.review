import { Check, Headphones, Info, Pencil, Phone, ShieldAlert, User } from "lucide-react";
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

const META_CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

const outlineButtonClass =
  "inline-flex min-h-[2.375rem] w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04]";

const supportPhoneHref = BOOKING_DETAIL_SUPPORT.phone.replace(/\s/g, "");

export function BookingDetailMetaGrid({ user }: { user: PassengerUser | null }) {
  return (
    <section
      className="hidden gap-4 lg:grid lg:grid-cols-3"
      aria-label="Informations complémentaires"
    >
      <article className={META_CARD_CLASS}>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">Informations passager</h2>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Nom complet</dt>
            <dd className="mt-0.5 font-semibold text-foreground">
              {formatPassengerFullName(user)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5 font-medium text-foreground">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Téléphone</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{formatPassengerPhone()}</dd>
          </div>
        </dl>
        <button
          type="button"
          disabled
          className={cn(outlineButtonClass, "mt-5 cursor-not-allowed opacity-60")}
          title="Modification — bientôt disponible"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          {BOOKING_DETAIL_MODIFY_CTA}
        </button>
      </article>

      <article className={META_CARD_CLASS}>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">Informations pratiques</h2>
        </div>
        <ul className="mt-4 space-y-3">
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
          className={cn(outlineButtonClass, "mt-5 cursor-not-allowed opacity-60")}
          title="Conseils — bientôt disponible"
        >
          <Info className="h-4 w-4" aria-hidden />
          {BOOKING_DETAIL_TIPS_CTA}
        </button>
      </article>

      <article className={META_CARD_CLASS}>
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">{BOOKING_DETAIL_SUPPORT.title}</h2>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
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
                href={`tel:${supportPhoneHref}`}
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
          className={cn(outlineButtonClass, "mt-5")}
        >
          {BOOKING_DETAIL_SUPPORT.cta}
        </a>
      </article>
    </section>
  );
}
