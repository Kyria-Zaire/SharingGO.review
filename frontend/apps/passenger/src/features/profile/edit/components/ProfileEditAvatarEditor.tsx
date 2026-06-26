import { Camera } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { PROFILE_EDIT_HERO } from "@/features/profile/edit/constants/profile-edit-content";
import type { PassengerUser } from "@/types/auth";

export function ProfileEditAvatarEditor({ user }: { user: PassengerUser }) {
  return (
    <div className="relative mx-auto shrink-0 lg:mx-0">
      <ProfileAvatar user={user} size="xl" className="h-24 w-24 text-2xl sm:h-28 sm:w-28" />
      <button
        type="button"
        disabled
        title={PROFILE_EDIT_HERO.photoUploadTitle}
        className={cn(
          "absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full",
          "border border-white/20 bg-[#121212] text-muted-foreground",
          "cursor-not-allowed opacity-80"
        )}
        aria-label={PROFILE_EDIT_HERO.photoUploadTitle}
      >
        <Camera className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
