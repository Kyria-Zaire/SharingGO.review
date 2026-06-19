import { Outlet } from "react-router-dom";
import { passengerShellWidthClass } from "@/lib/passenger-layout";
import { BottomNavigation } from "./BottomNavigation";
import { PassengerHeader } from "./PassengerHeader";

export function PassengerLayout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background">
      <PassengerHeader />
      <main
        className={`${passengerShellWidthClass} flex-1 px-4 py-5 md:px-6 lg:px-8`}
        style={{
          paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
