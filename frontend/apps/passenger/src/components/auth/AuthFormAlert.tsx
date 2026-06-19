import { AlertCircle } from "lucide-react";

interface AuthFormAlertProps {
  message: string;
  onDismiss?: () => void;
}

export function AuthFormAlert({ message, onDismiss }: AuthFormAlertProps) {
  return (
    <div
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center"
      role="alert"
    >
      <AlertCircle className="mx-auto mb-2 h-5 w-5 text-destructive" aria-hidden />
      <p className="text-sm text-destructive">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          className="mt-3 text-xs font-medium text-primary underline-offset-2 hover:underline"
          onClick={onDismiss}
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
