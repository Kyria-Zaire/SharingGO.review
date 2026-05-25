import { Link } from "react-router-dom";
import { AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  DashboardWidget,
  DashboardWidgetEmpty,
  DashboardWidgetLoading,
} from "@/features/dashboard/components/DashboardWidget";
import type { DashboardAttentionItem } from "@/features/dashboard/utils/dashboard-attention";
import { cn } from "@/lib/cn";

export function DashboardAttentionPanel({
  items,
  isLoading,
}: {
  items: DashboardAttentionItem[];
  isLoading: boolean;
}) {
  const hasCritical = items.some((item) => item.tone === "critical");

  return (
    <DashboardWidget
      title="Attention Required"
      description="Urgences opérationnelles — action immédiate"
      tone={hasCritical ? "critical" : items.length > 0 ? "warning" : "default"}
      actions={
        items.length > 0 ? (
          <Badge variant="destructive" className="text-xs font-bold uppercase">
            {items.length} alerte{items.length > 1 ? "s" : ""}
          </Badge>
        ) : null
      }
    >
      {isLoading ? (
        <DashboardWidgetLoading />
      ) : items.length === 0 ? (
        <DashboardWidgetEmpty message="Aucune urgence détectée — exploitation stable." />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-start gap-3 rounded-lg border-2 px-3 py-3 transition-colors",
                  item.tone === "critical"
                    ? "border-destructive bg-destructive/20 hover:bg-destructive/30"
                    : "border-warning/60 bg-warning/15 hover:bg-warning/25"
                )}
              >
                <AlertOctagon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    item.tone === "critical" ? "text-destructive" : "text-warning"
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      item.tone === "critical" ? "text-destructive" : "text-warning"
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-foreground/90">{item.detail}</p>
                </div>
                <Badge
                  variant={item.tone === "critical" ? "destructive" : "warning"}
                  className="ml-auto shrink-0 text-[10px] font-bold uppercase"
                >
                  {item.tone === "critical" ? "Critique" : "Warning"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}
