import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.06]", className)} aria-hidden />;
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-label="Chargement du profil">
      <div className="grid gap-5 md:grid-cols-2">
        <div className={cn(landingCardClass, "space-y-4 bg-[#121212] p-6")}>
          <div className="flex items-center gap-4">
            <SkeletonBar className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-5 w-40" />
              <SkeletonBar className="h-4 w-52" />
            </div>
          </div>
          <SkeletonBar className="h-10 w-full rounded-lg" />
        </div>
        <div className={cn(landingCardClass, "space-y-4 bg-[#121212] p-6")}>
          <SkeletonBar className="h-5 w-36" />
          <SkeletonBar className="h-8 w-28" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className={cn(landingCardClass, "space-y-3 bg-[#121212] p-6")}>
        <SkeletonBar className="h-5 w-32" />
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonBar className="h-16 w-full" />
          <SkeletonBar className="h-16 w-full" />
          <SkeletonBar className="h-16 w-full" />
        </div>
      </div>
      <SkeletonBar className="h-28 w-full rounded-2xl" />
    </div>
  );
}
