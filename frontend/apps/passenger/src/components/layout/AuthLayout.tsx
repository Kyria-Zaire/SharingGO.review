import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "@/types/routes";

/** Layout minimal pour login / register — sans bottom navigation. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header
        className="border-b border-border px-4 py-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <Link to={ROUTES.home} className="text-xs font-medium uppercase tracking-widest text-primary">
          SharingGO
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
