import { useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { TRIP_DETAIL_SHUTTLE } from "@/features/trips/constants/trip-detail-content";

export function TripDetailShuttleSection() {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      className={cn(landingCardClass, "overflow-hidden bg-[#161616] md:hidden")}
      aria-labelledby="trip-shuttle-title"
    >
      <div className="grid">
        <div className="relative min-h-[12rem]">
          {photoFailed ? (
            <div className="absolute inset-0 bg-gradient-to-br from-[#14532d]/25 via-black to-black" />
          ) : (
            <img
              src={LANDING_ASSETS.subscriptionInterior}
              alt=""
              className="h-full w-full object-cover object-center"
              loading="lazy"
              onError={() => setPhotoFailed(true)}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/60" />
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-6">
          <h2 id="trip-shuttle-title" className="text-lg font-bold text-foreground sm:text-xl">
            {TRIP_DETAIL_SHUTTLE.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {TRIP_DETAIL_SHUTTLE.description}
          </p>
        </div>
      </div>
    </section>
  );
}
