import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { ButtonSize, ButtonVariant } from "@/types/ui.types";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  secondary: "border border-border bg-muted text-foreground hover:bg-muted/80 active:bg-muted/60",
  ghost: "text-foreground hover:bg-muted active:bg-muted/80",
  destructive: "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-touch px-3 text-xs",
  md: "min-h-touch px-4 text-sm",
  lg: "min-h-[3rem] px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {isLoading ? "Chargement en cours…" : children}
    </button>
  );
}
