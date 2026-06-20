import { cn } from "@/lib/cn";
import {
  boardingErrorDevCode,
  resolveBoardingErrorMessage,
} from "@/features/boarding/utils/boarding-error-messages";

interface BoardingErrorAlertProps {
  code?: string;
  variant?: "destructive" | "warning";
  className?: string;
}

export function BoardingErrorAlert({
  code,
  variant = "destructive",
  className,
}: BoardingErrorAlertProps) {
  const message = resolveBoardingErrorMessage(code);
  boardingErrorDevCode(code);

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2.5",
        variant === "destructive"
          ? "border-destructive/30 bg-destructive/5"
          : "border-warning/30 bg-warning/5",
        className
      )}
    >
      <p className="text-sm font-semibold text-foreground">{message.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{message.description}</p>
    </div>
  );
}
