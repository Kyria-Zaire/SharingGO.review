import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.06]", className)} aria-hidden />;
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-label="Chargement des paramètres">
      <div className={cn(landingCardClass, "space-y-4 bg-[#121212] p-6")}>
        <div className="flex items-center gap-4">
          <SkeletonBar className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-4 w-32" />
            <SkeletonBar className="h-4 w-48" />
            <SkeletonBar className="h-4 w-40" />
          </div>
        </div>
      </div>
      <SkeletonBar className="h-10 w-full" />
      <div className={cn(landingCardClass, "space-y-4 bg-[#121212] p-6")}>
        <SkeletonBar className="h-5 w-40" />
        <SkeletonBar className="h-11 w-full" />
        <SkeletonBar className="h-11 w-full" />
      </div>
    </div>
  );
}
