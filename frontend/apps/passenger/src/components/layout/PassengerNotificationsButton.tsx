import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PassengerNotificationsButtonProps {
  className?: string;
}

/** Placeholder notifications — page dédiée WEB-NOTIF ultérieure. */
export function PassengerNotificationsButton({ className }: PassengerNotificationsButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-touch min-w-touch items-center justify-center rounded-full",
        "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      aria-label="Notifications — bientôt disponible"
      disabled
      title="Notifications — bientôt disponible"
    >
      <Bell className="h-5 w-5" aria-hidden />
    </button>
  );
}
