import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.06]", className)} aria-hidden />;
}

export function LegalSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-label="Chargement des Conditions Générales">
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <div className={cn(landingCardClass, "hidden h-80 bg-[#121212] lg:block")} />
        <div className={cn(landingCardClass, "space-y-6 bg-[#121212] p-6")}>
          <SkeletonBar className="h-6 w-48" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-6 w-40 mt-8" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
