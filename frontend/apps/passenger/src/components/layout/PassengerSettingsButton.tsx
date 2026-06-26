import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";

export interface PassengerSettingsButtonProps {
  className?: string;
}

export function PassengerSettingsButton({ className }: PassengerSettingsButtonProps) {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const isActive = pathname === ROUTES.settings;

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
        aria-label="Paramètres — connexion requise"
        disabled
        title="Connectez-vous pour accéder aux paramètres"
      >
        <Settings className="h-5 w-5" aria-hidden />
      </button>
    );
  }

  return (
    <Link
      to={ROUTES.settings}
      className={cn(
        "inline-flex min-h-touch min-w-touch items-center justify-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      aria-label="Paramètres"
      aria-current={isActive ? "page" : undefined}
    >
      <Settings className="h-5 w-5" aria-hidden />
    </Link>
  );
}
