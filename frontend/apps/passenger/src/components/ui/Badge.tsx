import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { BadgeVariant } from "@/types/ui.types";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-muted text-foreground",
  success: "border-primary/30 bg-primary/10 text-primary",
  warning: "border-warning/30 bg-warning/10 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  muted: "border-transparent bg-muted text-muted-foreground",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
