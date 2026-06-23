import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";

export interface PassengerLogoProps {
  className?: string;
  centered?: boolean;
}

export function PassengerLogo({ className, centered }: PassengerLogoProps) {
  return (
    <Link
      to={ROUTES.home}
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        centered && "justify-center",
        className
      )}
      aria-label="SharingGO — Accueil"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="currentColor">
          <path d="M7 5.5 12 3l5 2.5V12l-5 2.5L7 12V5.5zm2 1.4v4.2l3 1.5 3-1.5V6.9l-3-1.5-3 1.5z" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">SharingGO</span>
    </Link>
  );
}
