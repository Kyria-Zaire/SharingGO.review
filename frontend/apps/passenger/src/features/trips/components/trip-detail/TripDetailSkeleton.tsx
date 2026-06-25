import { landingContainerClass } from "@/features/home/lib/landing-layout";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-white/[0.06] bg-[#161616]/80 ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function TripDetailSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Chargement du trajet">
      <SkeletonBlock className="h-64 rounded-none border-x-0 border-t-0 sm:h-72" />

      <div className={landingContainerClass}>
        <div className="space-y-5 py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
          <div className="space-y-5">
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-52 lg:hidden" />
            <SkeletonBlock className="h-48" />
            <SkeletonBlock className="h-56" />
          </div>
          <SkeletonBlock className="hidden h-80 lg:block" />
        </div>
      </div>
    </div>
  );
}
