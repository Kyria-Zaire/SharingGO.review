import { NavLink } from "react-router-dom";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { useOpenIncidentCount } from "@/features/incidents/hooks/useOpenIncidentCount";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const openIncidentCount = useOpenIncidentCount();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/30">
      <div className="border-b border-border px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">SharingGO</p>
        <p className="mt-1 text-sm font-semibold text-foreground">Admin cockpit</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {item.showOpenIncidentBadge && openIncidentCount > 0 ? (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                {openIncidentCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
