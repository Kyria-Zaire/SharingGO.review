import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { landingCardClass, landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";

export function SubscriptionsEmptyState({
  title,
  description,
  icon,
  onExplorePlans,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onExplorePlans?: () => void;
}) {
  return (
    <div
      className={cn(
        landingCardClass,
        "flex flex-col items-center bg-[#161616] px-6 py-12 text-center sm:py-14"
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#121212] text-primary">
        {icon}
      </div>
      <h2 className="mt-5 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {onExplorePlans ? (
        <button type="button" onClick={onExplorePlans} className={cn(landingPrimaryButtonClass, "mt-6")}>
          Voir les formules
        </button>
      ) : null}
    </div>
  );
}
