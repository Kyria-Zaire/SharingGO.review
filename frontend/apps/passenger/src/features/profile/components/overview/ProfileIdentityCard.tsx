import { User } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass, landingOutlineButtonClass } from "@/features/home/lib/landing-layout";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { PROFILE_IDENTITY } from "@/features/profile/constants/profile-content";
import { profileDisplayName } from "@/features/profile/lib/profile-format";
import type { PassengerUser } from "@/types/auth";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

export function ProfileIdentityCard({
  user,
  onEditProfile,
}: {
  user: PassengerUser;
  onEditProfile: () => void;
}) {
  const name = profileDisplayName(user);

  return (
    <article className={CARD_CLASS} aria-label="Identité">
      <div className="flex items-start gap-4">
        <ProfileAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-foreground">{name}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <User className="h-3.5 w-3.5" aria-hidden />
            {PROFILE_IDENTITY.badge}
          </span>
        </div>
      </div>

      <button type="button" onClick={onEditProfile} className={cn(landingOutlineButtonClass, "mt-6 w-full")}>
        {PROFILE_IDENTITY.editCta}
      </button>
    </article>
  );
}
