import { Check, ChevronLeft, Download, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  BOARDING_PASS_BACK_LABEL,
  BOARDING_PASS_DOWNLOAD_PDF,
  BOARDING_PASS_DOWNLOAD_PDF_TITLE,
  BOARDING_PASS_SUBTITLE,
  BOARDING_PASS_TITLE,
  BOARDING_PASS_WALLET_CTA,
  BOARDING_PASS_WALLET_TITLE,
} from "@/features/boarding-pass/constants/boarding-pass-content";
import type { BoardingPassBadgeView } from "@/features/boarding-pass/lib/boarding-pass-status";
import { ROUTES } from "@/types/routes";

const badgeClass: Record<BoardingPassBadgeView["kind"], string> = {
  valid: "border-primary/50 bg-primary/10 text-primary",
  used: "border-white/15 bg-white/[0.06] text-foreground",
  canceled: "border-destructive/40 bg-destructive/10 text-destructive",
  expired: "border-warning/40 bg-warning/10 text-warning",
};

export function BoardingPassHeader({
  reservationId,
  badge,
}: {
  reservationId: string;
  badge: BoardingPassBadgeView;
}) {
  const actionOutlineClass =
    "inline-flex min-h-[2.375rem] items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-foreground opacity-60";

  return (
    <header className="space-y-3 lg:space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div className="space-y-2 sm:space-y-3">
          <Link
            to={ROUTES.bookingDetail(reservationId)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {BOARDING_PASS_BACK_LABEL}
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
              {BOARDING_PASS_TITLE}
            </h1>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                badgeClass[badge.kind]
              )}
            >
              {badge.kind === "valid" ? <Check className="h-3 w-3" aria-hidden /> : null}
              {badge.label}
            </span>
          </div>

          <p className="hidden max-w-2xl text-sm text-muted-foreground sm:block">
            {BOARDING_PASS_SUBTITLE}
          </p>
        </div>

        <div className="hidden shrink-0 flex-col gap-2 sm:flex-row lg:flex">
          <span className={cn(actionOutlineClass, "cursor-not-allowed")} title={BOARDING_PASS_DOWNLOAD_PDF_TITLE}>
            <Download className="h-4 w-4" aria-hidden />
            <span className="hidden xl:inline">{BOARDING_PASS_DOWNLOAD_PDF}</span>
            <span className="xl:hidden">PDF</span>
          </span>
          <span className={cn(actionOutlineClass, "cursor-not-allowed")} title={BOARDING_PASS_WALLET_TITLE}>
            <Wallet className="h-4 w-4" aria-hidden />
            {BOARDING_PASS_WALLET_CTA}
          </span>
        </div>
      </div>
    </header>
  );
}
