import { useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";

export interface LandingSubscriptionVisualProps {
  className?: string;
  /** Remplit un parent positionné (bannière mobile). */
  fill?: boolean;
}

export function LandingSubscriptionVisual({ className, fill = false }: LandingSubscriptionVisualProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden",
        fill
          ? "absolute inset-0 h-full w-full bg-black"
          : "relative h-full min-h-[14rem] w-full rounded-xl border border-white/[0.08] bg-[#050505]",
        className
      )}
    >
      {photoFailed ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#14532d]/25 via-black to-black" />
          <div className="absolute inset-x-8 top-4 h-1 rounded-full bg-primary/80 blur-[2px]" aria-hidden />
        </>
      ) : (
        <img
          src={LANDING_ASSETS.subscriptionInterior}
          alt="Intérieur premium de la navette SharingGO, sièges cuir et éclairage vert"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
          onError={() => setPhotoFailed(true)}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
    </div>
  );
}
