import { cn } from "@/lib/cn";
import { PROFILE_SOON_BADGE } from "@/features/profile/constants/profile-content";

export function ProfileSoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-white/20 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-muted-foreground",
        className
      )}
    >
      {PROFILE_SOON_BADGE}
    </span>
  );
}
