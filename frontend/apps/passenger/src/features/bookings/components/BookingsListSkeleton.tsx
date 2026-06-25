import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

export function BookingsListSkeleton() {
  return (
    <div className="mt-5 space-y-4" aria-busy="true" aria-label="Chargement des réservations">
      <div className={cn(landingCardClass, "hidden h-32 animate-pulse bg-[#161616] lg:block")} />
      <div className={cn(landingCardClass, "h-44 animate-pulse bg-[#161616] lg:hidden")} />
      <div className={cn(landingCardClass, "h-44 animate-pulse bg-[#161616] lg:hidden")} />
    </div>
  );
}
