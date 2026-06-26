import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.06]", className)} aria-hidden />;
}

export function HelpSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-label="Chargement du centre d'aide">
      <SkeletonBar className="h-12 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={cn(landingCardClass, "h-24 bg-[#121212]")} />
        ))}
      </div>
      <div className={cn(landingCardClass, "space-y-3 bg-[#121212] p-6")}>
        <SkeletonBar className="h-5 w-48" />
        <SkeletonBar className="h-11 w-full" />
        <SkeletonBar className="h-11 w-full" />
        <SkeletonBar className="h-11 w-full" />
      </div>
    </div>
  );
}
