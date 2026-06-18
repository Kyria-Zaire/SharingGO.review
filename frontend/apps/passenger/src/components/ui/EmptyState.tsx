import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "./Badge";

export interface EmptyStateProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  badge,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center",
        className
      )}
    >
      {icon ? <div className="mb-4 text-primary">{icon}</div> : null}
      {badge ? (
        <Badge variant="success" className="mb-4">
          {badge}
        </Badge>
      ) : null}
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
