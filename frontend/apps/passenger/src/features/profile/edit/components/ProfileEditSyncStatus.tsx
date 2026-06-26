import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { PROFILE_EDIT_SYNC } from "@/features/profile/edit/constants/profile-edit-content";
import { isGoogleOAuthSession } from "@/features/profile/edit/lib/profile-edit-form";

export function ProfileEditSyncStatus() {
  const isGoogle = isGoogleOAuthSession();

  const syncedTime = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    []
  );

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#161616]/80 px-4 py-3",
        "text-sm text-foreground"
      )}
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div>
        {isGoogle ? (
          <p className="font-medium">{PROFILE_EDIT_SYNC.google}</p>
        ) : (
          <>
            <p className="font-medium text-muted-foreground">{PROFILE_EDIT_SYNC.lastSyncLabel}</p>
            <p className="mt-0.5 font-medium text-foreground">
              {PROFILE_EDIT_SYNC.todayAt(syncedTime)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
