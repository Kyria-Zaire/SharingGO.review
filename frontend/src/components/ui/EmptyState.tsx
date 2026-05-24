import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "./Badge";

export interface EmptyStateProps {
  title: string;
  description: string;
  badge?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  badge = "Coming next",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-16 text-center",
        className
      )}
    >
      {icon ? <div className="mb-4 text-primary">{icon}</div> : null}
      <Badge variant="success" className="mb-4">
        {badge}
      </Badge>
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
