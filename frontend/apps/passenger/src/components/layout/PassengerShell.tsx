import { Outlet } from "react-router-dom";
import { cn } from "@/lib/cn";
import { usePassengerShell } from "@/hooks/usePassengerShell";
import { passengerShellWidthClass } from "@/lib/passenger-layout";
import { PassengerBottomNav } from "./PassengerBottomNav";
import { PassengerFooter } from "./PassengerFooter";
import { PassengerHeader } from "./PassengerHeader";

export function PassengerShell() {
  const { isHome, showBottomNav, showMarketingFooter, mainBottomPadding } = usePassengerShell();

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background">
      <PassengerHeader />

      <main
        className={cn(
          "flex-1",
          isHome ? "w-full" : passengerShellWidthClass,
          isHome ? "py-0" : "py-5 lg:py-6"
        )}
        style={{ paddingBottom: mainBottomPadding }}
      >
        <Outlet />
      </main>

      {showMarketingFooter ? <PassengerFooter /> : null}
      {showBottomNav ? <PassengerBottomNav /> : null}
    </div>
  );
}
