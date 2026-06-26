import { useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { HeroBackgroundMedia } from "@/features/home/components/HeroBackgroundMedia";
import { landingSecondaryButtonClass } from "@/features/home/lib/landing-layout";
import {
  heroTextBackdropClass,
  heroTitleClass,
} from "@/features/home/lib/hero-visual";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { NOTIFICATIONS_HERO_CONTENT } from "@/features/notifications/constants/notifications-content";

const heroShellClass =
  "relative py-12 sm:py-14 lg:min-h-[16rem] lg:py-12";

const heroSubtitleClass =
  "mt-4 max-w-lg text-base leading-relaxed text-foreground/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] sm:text-[1.05rem]";

export function NotificationsHeroSection({
  onMarkAllRead,
  canMarkAllRead,
  unreadCount,
}: {
  onMarkAllRead: () => void;
  canMarkAllRead: boolean;
  unreadCount: number;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.06]"
      aria-labelledby="notifications-hero-title"
    >
      <HeroBackgroundMedia
        imageSrc={LANDING_ASSETS.heroVan}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className={cn(heroShellClass, "max-lg:pb-10")}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className={cn("relative max-w-xl", heroShellClass, "py-0")}>
              <div className={heroTextBackdropClass} aria-hidden />
              <div className="relative">
                <h1 id="notifications-hero-title" className={heroTitleClass}>
                  {NOTIFICATIONS_HERO_CONTENT.titleBefore}
                  <span className="text-primary">{NOTIFICATIONS_HERO_CONTENT.titleHighlight}</span>
                </h1>
                <p className={heroSubtitleClass}>{NOTIFICATIONS_HERO_CONTENT.subtitle}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={!canMarkAllRead}
              title={
                canMarkAllRead
                  ? undefined
                  : NOTIFICATIONS_HERO_CONTENT.markAllReadSoonTitle
              }
              className={cn(
                landingSecondaryButtonClass,
                "hidden shrink-0 lg:inline-flex",
                !canMarkAllRead && "cursor-not-allowed opacity-50"
              )}
            >
              {NOTIFICATIONS_HERO_CONTENT.markAllRead}
              {unreadCount > 0 ? (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
