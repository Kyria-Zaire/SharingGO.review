import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import { heroTitleClass } from "@/features/home/lib/hero-visual";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { ProfileEditAvatarEditor } from "@/features/profile/edit/components/ProfileEditAvatarEditor";
import { PROFILE_EDIT_HERO } from "@/features/profile/edit/constants/profile-edit-content";
import type { PassengerUser } from "@/types/auth";
import { ROUTES } from "@/types/routes";

const heroSubtitleClass =
  "mt-3 max-w-lg text-base leading-relaxed text-foreground/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] sm:text-[1.05rem]";

export function ProfileEditHeroSection({ user }: { user: PassengerUser }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.06]"
      aria-labelledby="profile-edit-hero-title"
    >
      <HeroBackgroundMedia
        imageSrc={LANDING_ASSETS.heroVan}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className="py-8 sm:py-10 lg:py-12">
          <Link
            to={ROUTES.profile}
            className="mb-6 inline-flex min-h-touch items-center gap-2 rounded-lg border border-white/15 bg-black/35 px-3 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {PROFILE_EDIT_HERO.backLabel}
          </Link>

          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-xl text-center lg:text-left">
              <div
                className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-3xl bg-gradient-to-r from-black/65 via-black/40 to-transparent lg:-inset-x-6"
                aria-hidden
              />
              <div className="relative">
                <h1 id="profile-edit-hero-title" className={heroTitleClass}>
                  {PROFILE_EDIT_HERO.title}
                </h1>
                <p className={heroSubtitleClass}>{PROFILE_EDIT_HERO.subtitle}</p>
              </div>
            </div>

            <ProfileEditAvatarEditor user={user} />
          </div>
        </div>
      </div>
    </section>
  );
}
