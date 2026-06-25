import { Outlet } from "react-router-dom";
import { cn } from "@/lib/cn";
import { usePassengerShell } from "@/hooks/usePassengerShell";
import { passengerShellWidthClass } from "@/lib/passenger-layout";
import { PassengerFooter } from "./PassengerFooter";
import { PassengerHeader } from "./PassengerHeader";
import { UiDemoModeBadge } from "./UiDemoModeBadge";

export function PassengerShell() {
  const { isMarketingSurface, showMarketingFooter, mainBottomPadding } = usePassengerShell();

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background">
      <PassengerHeader />

      <main
        className={cn(
          "flex-1",
          isMarketingSurface ? "w-full" : passengerShellWidthClass,
          isMarketingSurface ? "py-0" : "py-5 lg:py-6"
        )}
        style={{ paddingBottom: mainBottomPadding }}
      >
        <Outlet />
      </main>

      {showMarketingFooter ? <PassengerFooter /> : null}
      <UiDemoModeBadge />
    </div>
  );
}
