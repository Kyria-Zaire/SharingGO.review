import { NavLink } from "react-router-dom";
import { ADMIN_NAV_SECTIONS } from "@/constants/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useOpenIncidentCount } from "@/features/incidents/hooks/useOpenIncidentCount";
import { cn } from "@/lib/cn";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const openIncidentCount = useOpenIncidentCount();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Fermer le menu"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(16rem,85vw)] flex-col border-r border-border bg-muted/30 transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:w-56 lg:shrink-0 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="border-b border-border px-4 py-5">
          <BrandLogo size="sm" />
          <p className="mt-2 text-sm font-semibold text-foreground">Admin cockpit</p>
        </div>
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.label ?? "main"} className="flex flex-col gap-1">
              {section.label ? (
                <p className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {item.showOpenIncidentBadge && openIncidentCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                      {openIncidentCount}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
