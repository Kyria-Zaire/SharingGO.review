import { getGoogleProfilePicture } from "@/features/profile/lib/google-profile-picture";

export function isGoogleOAuthSession(): boolean {
  return getGoogleProfilePicture() != null;
}

export const profileEditInputClass =
  "mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#161616] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export const profileEditInputReadOnlyClass =
  "mt-1.5 w-full cursor-default rounded-lg border border-white/[0.1] bg-[#161616] px-4 py-3 text-sm text-foreground opacity-80 focus-visible:outline-none";
