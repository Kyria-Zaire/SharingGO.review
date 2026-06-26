import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { PROFILE_EDIT_INFO_BANNER } from "@/features/profile/edit/constants/profile-edit-content";

export function ProfileEditInfoBanner() {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
        "text-sm leading-relaxed text-foreground"
      )}
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p>{PROFILE_EDIT_INFO_BANNER}</p>
    </div>
  );
}
