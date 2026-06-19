import { useEffect } from "react";
import type { BoardingConsumeResponse } from "@/types/boarding.types";

const FEEDBACK_DURATION_MS = 1500;

export type BoardingScanFeedbackVariant = "default" | "retry-already-used-success";

interface BoardingScanFeedbackProps {
  result: BoardingConsumeResponse;
  variant?: BoardingScanFeedbackVariant;
  onDone: () => void;
}

export function BoardingScanFeedback({
  result,
  variant = "default",
  onDone,
}: BoardingScanFeedbackProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, FEEDBACK_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  let icon: string;
  let title: string;
  let subtitle: string;
  let bgClass: string;
  let textClass: string;

  if (variant === "retry-already-used-success") {
    icon = "✅";
    title = "Embarquement déjà enregistré";
    subtitle = "Ce passager est bien marqué comme embarqué.";
    bgClass = "bg-primary";
    textClass = "text-primary-foreground";
  } else if (result.consumed) {
    icon = "✅";
    title = "Embarqué";
    subtitle = result.passenger
      ? `${result.passenger.firstName ?? ""} ${result.passenger.lastName ?? ""}`.trim()
      : "";
    bgClass = "bg-primary";
    textClass = "text-primary-foreground";
  } else if (result.valid && result.reason === "BOARDING_ALREADY_USED") {
    icon = "⚠️";
    title = "Billet déjà utilisé";
    subtitle = "Ce billet a déjà été scanné";
    bgClass = "bg-destructive";
    textClass = "text-white";
  } else {
    // BoardingConsumptionFailure — valid: false
    icon = "❌";
    title = "Refusé";
    subtitle = result.reason;
    bgClass = "bg-destructive";
    textClass = "text-white";
  }

  return (
    <div
      role="status"
      aria-live="assertive"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 ${bgClass} animate-fade-in`}
    >
      <span className="text-7xl" aria-hidden>
        {icon}
      </span>
      <p className={`text-center text-2xl font-extrabold tracking-tight sm:text-4xl ${textClass}`}>{title}</p>
      {subtitle ? (
        <p className={`max-w-xs px-4 text-center text-base font-medium sm:max-w-md sm:text-xl ${textClass} opacity-80`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
