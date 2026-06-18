import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { PassengerHeader } from "./PassengerHeader";

export function PassengerLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PassengerHeader />
      <main
        className="mx-auto w-full max-w-lg flex-1 px-4 py-5"
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
