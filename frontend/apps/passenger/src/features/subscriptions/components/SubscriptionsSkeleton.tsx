import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.06]", className)} aria-hidden />;
}

export function SubscriptionsSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-label="Chargement des abonnements">
      <SkeletonBar className="h-24 w-full rounded-2xl" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={cn(landingCardClass, "space-y-4 bg-[#121212] p-6")}>
          <SkeletonBar className="h-5 w-40" />
          <SkeletonBar className="h-8 w-28" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-5/6" />
          <SkeletonBar className="mt-4 h-11 w-full rounded-lg" />
        </div>
        <div className={cn(landingCardClass, "space-y-4 bg-[#121212] p-6")}>
          <SkeletonBar className="h-5 w-40" />
          <SkeletonBar className="h-8 w-28" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-5/6" />
          <SkeletonBar className="mt-4 h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
