import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.06]", className)} aria-hidden />;
}

export function ProfileEditSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-label="Chargement de l'édition du profil">
      <SkeletonBar className="h-14 w-full rounded-xl" />
      <div className={cn(landingCardClass, "space-y-4 bg-[#121212] p-6")}>
        <SkeletonBar className="h-5 w-48" />
        <SkeletonBar className="h-11 w-full" />
        <SkeletonBar className="h-11 w-full" />
        <SkeletonBar className="h-11 w-full" />
        <SkeletonBar className="h-11 w-full" />
      </div>
    </div>
  );
}
