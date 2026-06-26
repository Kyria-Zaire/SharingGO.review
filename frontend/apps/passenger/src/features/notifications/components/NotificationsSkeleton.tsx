import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.06]", className)} aria-hidden />;
}

export function NotificationsSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-label="Chargement des notifications">
      <SkeletonBar className="h-10 w-48" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={cn(landingCardClass, "flex gap-4 bg-[#121212] p-5")}>
          <SkeletonBar className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-4 w-2/3" />
            <SkeletonBar className="h-3 w-full" />
            <SkeletonBar className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
