import { Link, Outlet } from "react-router-dom";
import { passengerShellWidthClass } from "@/lib/passenger-layout";
import { ROUTES } from "@/types/routes";

/** Layout minimal pour login / register — sans bottom navigation. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background">
      <header
        className={`${passengerShellWidthClass} border-b border-border px-4 py-4 md:px-6 lg:px-8`}
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <Link to={ROUTES.home} className="text-xs font-medium uppercase tracking-widest text-primary">
          SharingGO
        </Link>
      </header>
      <main
        className={`${passengerShellWidthClass} flex flex-1 flex-col px-4 py-8 md:px-6 lg:px-8`}
      >
        <Outlet />
      </main>
    </div>
  );
}
