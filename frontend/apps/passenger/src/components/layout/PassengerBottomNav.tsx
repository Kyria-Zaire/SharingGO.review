import { Home, Bus, Ticket, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { BOTTOM_NAV_ITEMS } from "@/types/routes";

const NAV_ICONS: Record<string, LucideIcon> = {
  Accueil: Home,
  Trajets: Bus,
  Réservations: Ticket,
  Profil: User,
};

export function PassengerBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      aria-label="Navigation principale"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.label] ?? Home;
          return (
            <li key={item.href} className="flex-1">
              <NavLink
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1 px-2 py-2 text-[0.65rem] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <span
                        className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary"
                        aria-hidden
                      />
                    ) : null}
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
