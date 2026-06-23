import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import type { ShellNavItem } from "@/constants/shell-navigation";
import { DESKTOP_NAV_ITEMS } from "@/constants/shell-navigation";
import { cn } from "@/lib/cn";
import { passengerHeaderContainerClass } from "@/lib/passenger-layout";
import { PassengerLogo } from "./PassengerLogo";
import { PassengerNotificationsButton } from "./PassengerNotificationsButton";
import { PassengerUserMenu } from "./PassengerUserMenu";

function navTarget(item: ShellNavItem) {
  if (item.hash) {
    return { pathname: item.to, hash: item.hash };
  }
  return item.to;
}

function isNavItemActive(item: ShellNavItem, pathname: string, hash: string): boolean {
  if (item.hash) {
    return pathname === item.to && hash === item.hash;
  }
  if (item.end) {
    return pathname === item.to && !hash;
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function DesktopNavLink({ item }: { item: ShellNavItem }) {
  const { pathname, hash } = useLocation();
  const active = isNavItemActive(item, pathname, hash);

  return (
    <NavLink
      to={navTarget(item)}
      end={item.end}
      className={() =>
        cn(
          "flex h-16 items-center border-b-2 px-4 text-sm font-medium transition-colors",
          active
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )
      }
    >
      {item.label}
    </NavLink>
  );
}

function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { pathname, hash } = useLocation();

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
        aria-label="Fermer le menu"
        onClick={onClose}
      />
      <nav
        className="fixed inset-y-0 left-0 z-50 w-[min(100%,18rem)] border-r border-white/10 bg-black p-5 md:hidden"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
        aria-label="Menu principal"
      >
        <div className="mb-6 flex items-center justify-between">
          <PassengerLogo />
          <button
            type="button"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="space-y-1">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item, pathname, hash);
            return (
              <li key={item.label}>
                <NavLink
                  to={navTarget(item)}
                  end={item.end}
                  onClick={onClose}
                  className={cn(
                    "flex min-h-touch items-center rounded-lg px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export function PassengerHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 isolate border-b border-white/10 bg-black">
      <div
        className={passengerHeaderContainerClass}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {/* Mobile */}
        <div className="relative flex h-16 items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-foreground hover:bg-muted"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <PassengerLogo centered className="absolute left-1/2 -translate-x-1/2" />
          <div className="flex items-center gap-1">
            <PassengerNotificationsButton />
            <PassengerUserMenu compact />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden h-16 items-center md:grid md:grid-cols-[1fr_auto_1fr]">
          <PassengerLogo />
          <nav className="flex h-16 items-stretch justify-center" aria-label="Navigation principale">
            {DESKTOP_NAV_ITEMS.map((item) => (
              <DesktopNavLink key={item.label} item={item} />
            ))}
          </nav>
          <div className="flex items-center justify-end gap-2">
            <PassengerNotificationsButton />
            <PassengerUserMenu />
          </div>
        </div>
      </div>

      <MobileNavDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
