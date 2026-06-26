import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

export function ContactSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-label="Chargement de la page Contact">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={cn(landingCardClass, "h-48 bg-[#121212]")} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn(landingCardClass, "h-96 bg-[#121212]")} />
        <div className="space-y-4">
          <div className={cn(landingCardClass, "h-40 bg-[#121212]")} />
          <div className={cn(landingCardClass, "h-40 bg-[#121212]")} />
        </div>
      </div>
    </div>
  );
}
