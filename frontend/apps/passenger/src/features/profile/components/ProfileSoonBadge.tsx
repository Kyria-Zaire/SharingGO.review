import { cn } from "@/lib/cn";
import { PROFILE_COMING_SOON } from "@/features/profile/constants/profile-content";

export function ProfileSoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
    >
      {PROFILE_COMING_SOON.badge}
    </span>
  );
}
