import { cn } from "@/lib/cn";
import { TRIP_DETAIL_SHUTTLE_DESKTOP } from "@/features/trips/constants/trip-detail-content";
import { TripDetailShuttleInteriorImage } from "@/features/trips/components/trip-detail/TripDetailShuttleInteriorImage";

export function TripDetailShuttleAboutCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-xl border border-primary/35 bg-[#121212]/60 p-4",
        className
      )}
      aria-labelledby="trip-shuttle-about-title"
    >
      <div className="min-w-0 flex-1">
        <h3 id="trip-shuttle-about-title" className="text-sm font-semibold text-foreground">
          {TRIP_DETAIL_SHUTTLE_DESKTOP.title}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {TRIP_DETAIL_SHUTTLE_DESKTOP.description}
        </p>
      </div>
      <TripDetailShuttleInteriorImage className="h-[4.5rem] w-[6.5rem] rounded-lg lg:h-20 lg:w-28" />
    </div>
  );
}
