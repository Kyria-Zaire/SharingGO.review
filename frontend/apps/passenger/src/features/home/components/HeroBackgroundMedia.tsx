import { HERO_FALLBACK_CLASS, HERO_IMAGE_CLASS } from "@/features/home/lib/hero-visual";

export interface HeroBackgroundMediaProps {
  imageSrc: string;
  photoFailed: boolean;
  onPhotoError: () => void;
}

export function HeroBackgroundMedia({
  imageSrc,
  photoFailed,
  onPhotoError,
}: HeroBackgroundMediaProps) {
  return (
    <div className="absolute inset-0" aria-hidden>
      {photoFailed ? (
        <div className={HERO_FALLBACK_CLASS} />
      ) : (
        <img
          src={imageSrc}
          alt=""
          className={HERO_IMAGE_CLASS}
          loading="eager"
          fetchPriority="high"
          onError={onPhotoError}
        />
      )}

      {/* Lisibilité texte à gauche — van visible à droite */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10 lg:from-black/90 lg:via-black/50 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
    </div>
  );
}
