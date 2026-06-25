import { useState } from "react";
import { Check, Copy, Shield, User, Armchair } from "lucide-react";
import QRCode from "react-qr-code";
import { cn } from "@/lib/cn";
import {
  BOARDING_PASS_COUNTDOWN_PREFIX,
  BOARDING_PASS_DEMO_MESSAGE,
  BOARDING_PASS_QR_FOOTER,
  BOARDING_PASS_REFERENCE_LABEL,
  BOARDING_PASS_SEATS_LABEL,
  BOARDING_PASS_SEATS_VALUE,
} from "@/features/boarding-pass/constants/boarding-pass-content";
import type { BoardingPassReadinessView } from "@/features/boarding-pass/lib/boarding-pass-status";
import { formatPassengerFullName } from "@/features/bookings/lib/booking-detail-format";
import { formatBookingPublicReference } from "@/features/bookings/lib/booking-card-format";
import type { PassengerUser } from "@/types/auth";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:p-5 lg:p-6";

export function BoardingPassMainCard({
  reservationId,
  user,
  readiness,
  qrPayload,
  showQr,
  isDemoBooking,
  countdownDisplay,
  showCountdown,
}: {
  reservationId: string;
  user: PassengerUser | null;
  readiness: BoardingPassReadinessView;
  qrPayload: string | null;
  showQr: boolean;
  isDemoBooking: boolean;
  countdownDisplay: string;
  showCountdown: boolean;
}) {
  const reference = formatBookingPublicReference(reservationId);
  const [copied, setCopied] = useState(false);

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className={cn(CARD_CLASS, "p-3 sm:p-4 lg:p-6")} aria-label="Carte billet numérique">
      <div className="flex flex-col gap-4 sm:gap-5 lg:grid lg:grid-cols-[10.5rem_minmax(0,1fr)_11.5rem] lg:items-center lg:gap-6">
        <div className="order-1 space-y-3 sm:space-y-4 lg:space-y-4">
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 sm:p-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary sm:h-8 sm:w-8">
                <Check className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{readiness.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1">{readiness.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="text-xs font-medium text-muted-foreground">{BOARDING_PASS_REFERENCE_LABEL}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <p className="font-mono text-sm font-semibold text-foreground">{reference}</p>
              <button
                type="button"
                onClick={() => void handleCopyReference()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
                aria-label={copied ? "Référence copiée" : "Copier la référence"}
              >
                <Copy className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            {copied ? <p className="mt-1 text-xs text-primary">Copié</p> : null}
          </div>
        </div>

        <div className="order-2 flex flex-col items-center lg:order-2">
          {isDemoBooking ? (
            <div className="flex w-full max-w-[17.5rem] flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
              <div className="h-40 w-40 rounded-xl bg-white/5" aria-hidden />
              <p className="text-sm text-muted-foreground">{BOARDING_PASS_DEMO_MESSAGE}</p>
            </div>
          ) : showQr && qrPayload ? (
            <div className="relative w-full max-w-[11rem] sm:max-w-[13rem] lg:max-w-[17.5rem]">
              <div
                className={cn(
                  "rounded-2xl border border-white/10 bg-white p-3 sm:p-4",
                  "shadow-[0_0_48px_rgba(34,197,94,0.22)]"
                )}
              >
                <QRCode
                  value={qrPayload}
                  size={220}
                  level="M"
                  aria-label="QR code d'embarquement"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 256 256"
                />
              </div>
            </div>
          ) : (
            <div className="flex w-full max-w-[17.5rem] flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
              <div className="h-40 w-40 rounded-xl bg-white/5 opacity-50" aria-hidden />
              <p className="text-sm text-muted-foreground">{readiness.subtitle}</p>
            </div>
          )}

          <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground sm:mt-4">
            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
            {BOARDING_PASS_QR_FOOTER}
          </p>

          {showCountdown && showQr && !isDemoBooking ? (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {BOARDING_PASS_COUNTDOWN_PREFIX}{" "}
              <span className="font-mono font-semibold text-foreground">{countdownDisplay}</span>
            </p>
          ) : null}
        </div>

        <div className="order-3 lg:hidden">
          <p className="text-xs font-medium text-muted-foreground">{BOARDING_PASS_REFERENCE_LABEL}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-mono text-sm font-semibold text-foreground">{reference}</p>
            <button
              type="button"
              onClick={() => void handleCopyReference()}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
              aria-label={copied ? "Référence copiée" : "Copier la référence"}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="order-4 hidden space-y-4 lg:order-3 lg:block">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {formatPassengerFullName(user)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{user?.email ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-white/[0.06] pt-4">
            <Armchair className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-xs text-muted-foreground">{BOARDING_PASS_SEATS_LABEL}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {BOARDING_PASS_SEATS_VALUE}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
