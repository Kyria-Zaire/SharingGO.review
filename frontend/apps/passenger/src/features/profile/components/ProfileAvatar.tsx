import { useState } from "react";
import { cn } from "@/lib/cn";
import { getGoogleProfilePicture } from "@/features/profile/lib/google-profile-picture";
import type { PassengerUser } from "@/types/auth";
import { profileInitials } from "@/features/profile/lib/profile-format";

export function ProfileAvatar({
  user,
  size = "lg",
  className,
}: {
  user: PassengerUser;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const picture = getGoogleProfilePicture();
  const initials = profileInitials(user);
  const sizeClass =
    size === "xl"
      ? "h-24 w-24 text-2xl"
      : size === "lg"
        ? "h-16 w-16 text-lg"
        : "h-12 w-12 text-sm";

  if (picture && !imageFailed) {
    return (
      <img
        src={picture}
        alt=""
        className={cn(
          "shrink-0 rounded-full border border-white/[0.12] object-cover",
          sizeClass,
          className
        )}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 font-semibold text-primary",
        sizeClass,
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
