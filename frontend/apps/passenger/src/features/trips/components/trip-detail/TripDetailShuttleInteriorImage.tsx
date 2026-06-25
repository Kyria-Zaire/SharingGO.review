import { useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";

export interface TripDetailShuttleInteriorImageProps {
  className?: string;
}

export function TripDetailShuttleInteriorImage({ className }: TripDetailShuttleInteriorImageProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  if (photoFailed) {
    return (
      <div
        className={cn("shrink-0 bg-[#121212]", className)}
        role="img"
        aria-label="Intérieur de la navette SharingGO"
      />
    );
  }

  return (
    <img
      src={LANDING_ASSETS.subscriptionInterior}
      alt="Intérieur de la navette SharingGO"
      className={cn("shrink-0 object-cover object-center", className)}
      loading="lazy"
      onError={() => setPhotoFailed(true)}
    />
  );
}
