import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import {
  heroTextBackdropClass,
  heroTitleClass,
} from "@/features/home/lib/hero-visual";
import {
  landingContainerClass,
  landingSecondaryButtonClass,
} from "@/features/home/lib/landing-layout";
import { SETTINGS_HERO } from "@/features/settings/constants/settings-content";

const heroShellClass =
  "relative max-w-xl py-12 sm:py-14 lg:min-h-[16rem] lg:py-12 lg:pr-8";

const heroSubtitleClass =
  "mt-4 max-w-lg text-base leading-relaxed text-foreground/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] sm:text-[1.05rem] lg:mt-4";

export function SettingsHeroSection({ onLogout }: { onLogout: () => void }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.06]"
      aria-labelledby="settings-hero-title"
    >
      <HeroBackgroundMedia
        imageSrc={LANDING_ASSETS.heroVan}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className={cn(heroShellClass, "max-lg:pb-14")}>
          <div className={heroTextBackdropClass} aria-hidden />

          <div className="relative">
            <h1 id="settings-hero-title" className={heroTitleClass}>
              <span className="text-primary">{SETTINGS_HERO.title}</span>
            </h1>

            <p className={heroSubtitleClass}>{SETTINGS_HERO.subtitle}</p>

            <button
              type="button"
              onClick={onLogout}
              className={cn(landingSecondaryButtonClass, "mt-6 gap-2")}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {SETTINGS_HERO.logoutCta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
