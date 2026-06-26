import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass, landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";
import {
  NOTIFICATIONS_EMPTY,
  NOTIFICATIONS_TAB_EMPTY,
} from "@/features/notifications/constants/notifications-content";
import { ROUTES } from "@/types/routes";

export function NotificationsEmptyState({ variant = "all" }: { variant?: "all" | "tab" }) {
  const isTab = variant === "tab";

  return (
    <div
      className={cn(
        landingCardClass,
        "flex flex-col items-center bg-[#161616] px-6 py-12 text-center sm:py-14"
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#121212] text-primary">
        <Bell className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-foreground">
        {isTab ? NOTIFICATIONS_TAB_EMPTY.title : NOTIFICATIONS_EMPTY.title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isTab ? NOTIFICATIONS_TAB_EMPTY.description : NOTIFICATIONS_EMPTY.description}
      </p>
      {!isTab ? (
        <Link to={ROUTES.trips} className={cn(landingPrimaryButtonClass, "mt-6")}>
          {NOTIFICATIONS_EMPTY.cta}
        </Link>
      ) : null}
    </div>
  );
}
