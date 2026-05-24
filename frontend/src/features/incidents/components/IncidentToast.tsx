import { cn } from "@/lib/cn";

export interface IncidentToastProps {
  message: string | null;
  onDismiss?: () => void;
}

export function IncidentToast({ message, onDismiss }: IncidentToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-md border border-primary/30",
        "bg-background px-4 py-3 text-sm font-medium text-foreground shadow-lg"
      )}
    >
      <span className="text-primary">●</span>
      <span>{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          aria-label="Fermer"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
