import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  action?: ReactNode;
}

export function ErrorState({
  title = "Erreur de chargement",
  message,
  onRetry,
  className,
  action,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className
      )}
    >
      <AlertCircle className="mb-3 h-10 w-10 text-destructive" aria-hidden />
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex gap-2">
        {onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Réessayer
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
