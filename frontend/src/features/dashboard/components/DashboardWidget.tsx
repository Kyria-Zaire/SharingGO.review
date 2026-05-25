import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type DashboardWidgetTone = "default" | "critical" | "warning" | "ops";

const toneClass: Record<DashboardWidgetTone, string> = {
  default: "border-border bg-muted/15",
  ops: "border-primary/35 bg-primary/5",
  warning: "border-warning/50 bg-warning/10",
  critical: "border-destructive/70 bg-destructive/15 shadow-sm shadow-destructive/20",
};

interface DashboardWidgetProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  tone?: DashboardWidgetTone;
  children: ReactNode;
  className?: string;
}

export function DashboardWidget({
  title,
  description,
  actions,
  tone = "default",
  children,
  className,
}: DashboardWidgetProps) {
  return (
    <section
      className={cn(
        "rounded-lg border px-4 py-4",
        toneClass[tone],
        className
      )}
    >
      <DashboardWidgetHeader title={title} description={description} actions={actions} />
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function DashboardWidgetHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function DashboardWidgetLoading() {
  return (
    <div className="space-y-2" aria-busy="true">
      <div className="h-10 animate-pulse rounded-md bg-muted" />
      <div className="h-10 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

export function DashboardWidgetEmpty({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}
