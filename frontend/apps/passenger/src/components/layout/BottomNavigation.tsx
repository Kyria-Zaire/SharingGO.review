import { Home, Ticket, Bus, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { passengerShellWidthClass } from "@/lib/passenger-layout";
import { BOTTOM_NAV_ITEMS } from "@/types/routes";

const NAV_ICONS: Record<string, LucideIcon> = {
  Accueil: Home,
  Trajets: Bus,
  Réservations: Ticket,
  Profil: User,
};

export function BottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      aria-label="Navigation principale"
    >
      <ul className={`${passengerShellWidthClass} flex items-stretch justify-around px-4 md:px-6 lg:px-8`}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.label] ?? Home;
          return (
            <li key={item.href} className="flex-1">
              <NavLink
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-touch flex-col items-center justify-center gap-1 px-2 py-2 text-[0.65rem] font-medium transition-colors sm:text-xs",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
