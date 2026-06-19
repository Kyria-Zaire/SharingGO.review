import { passengerShellWidthClass } from "@/lib/passenger-layout";
import { Link } from "react-router-dom";
import { ROUTES } from "@/types/routes";

export function PassengerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div
        className={`${passengerShellWidthClass} flex h-14 items-center justify-between px-4 md:px-6 lg:px-8`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <Link to={ROUTES.home} className="flex flex-col">
          <span className="text-[0.65rem] font-medium uppercase tracking-widest text-primary">
            SharingGO
          </span>
          <span className="text-sm font-semibold text-foreground">Navette convoyeur</span>
        </Link>
        <p className="text-xs text-muted-foreground">Châlons ↔ Vatry</p>
      </div>
    </header>
  );
}
