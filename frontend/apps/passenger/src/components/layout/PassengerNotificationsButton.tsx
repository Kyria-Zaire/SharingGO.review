import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";

export interface PassengerNotificationsButtonProps {
  className?: string;
}

export function PassengerNotificationsButton({ className }: PassengerNotificationsButtonProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex min-h-touch min-w-touch items-center justify-center rounded-full",
          "text-muted-foreground transition-colors",
          "cursor-not-allowed opacity-60",
          className
        )}
        aria-label="Notifications — connexion requise"
        disabled
        title="Connectez-vous pour voir vos notifications"
      >
        <Bell className="h-5 w-5" aria-hidden />
      </button>
    );
  }

  return (
    <Link
      to={ROUTES.notifications}
      className={cn(
        "inline-flex min-h-touch min-w-touch items-center justify-center rounded-full",
        "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" aria-hidden />
    </Link>
  );
}
