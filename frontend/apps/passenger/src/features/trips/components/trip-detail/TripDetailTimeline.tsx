import { Bus, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { TRIP_DETAIL_STOP_POINTS } from "@/features/trips/constants/trip-detail-content";
import {
  formatTime,
  formatTripCalendarDate,
  formatTripDuration,
} from "@/lib/format-date";
import {
  formatTripCityShort,
  isChalonsCity,
  isVatryCity,
} from "@/lib/trip-city-labels";
import { TripDetailHeroMap } from "@/features/trips/components/trip-detail/TripDetailHeroMap";
import type { PublicTrip } from "@/types/trips.types";

const DESKTOP_LABEL_CLASS = "text-[0.6875rem] font-medium leading-none text-muted-foreground";
const DESKTOP_TIME_ROW_CLASS =
  "mt-1 flex min-h-[1.75rem] items-center lg:min-h-[1.85rem]";
const DESKTOP_TIME_CLASS =
  "text-[1.75rem] font-bold leading-none tracking-tight text-foreground lg:text-[1.875rem]";
const DESKTOP_CITY_CLASS =
  "mt-1.5 text-sm font-semibold leading-snug text-foreground";
const DESKTOP_STOP_CLASS = "mt-0.5 text-xs leading-snug text-muted-foreground";
const DESKTOP_DATE_CLASS = "mt-auto pt-2 text-xs leading-none text-foreground/75";

function resolveTripStopPoint(city: string): string {
  if (isChalonsCity(city)) {
    return TRIP_DETAIL_STOP_POINTS.chalons;
  }
  if (isVatryCity(city)) {
    return TRIP_DETAIL_STOP_POINTS.vatry;
  }
  return "";
}

const JOURNEY_DASH_COUNT = 10;

function JourneyDashLine({ count = JOURNEY_DASH_COUNT }: { count?: number }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2.5 px-0.5 lg:gap-3.5">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="h-px w-1.5 shrink-0 bg-white/40 lg:w-2"
          aria-hidden
        />
      ))}
    </div>
  );
}

function DesktopTimelineJourneyLine() {
  return (
    <div className="flex w-full items-center justify-between" aria-hidden>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/40 bg-transparent" />
      <JourneyDashLine />
      <span className="mx-1 flex shrink-0 bg-[#161616] px-1 py-0.5">
        <Bus className="h-6 w-6 text-foreground lg:h-7 lg:w-7" strokeWidth={1.5} />
      </span>
      <JourneyDashLine count={JOURNEY_DASH_COUNT - 2} />
      <svg
        viewBox="0 0 6 8"
        className="h-2.5 w-2 shrink-0 text-white/55"
        aria-hidden
      >
        <path d="M0 0 L6 4 L0 8 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

function DesktopDurationBadge({ duration }: { duration: string }) {
  return (
    <div className="rounded-md border border-white/[0.1] bg-[#121212] px-2.5 py-1 text-center">
      <p className="text-[0.5625rem] font-medium leading-none text-muted-foreground">
        Durée estimée
      </p>
      <p className="mt-0.5 text-xs font-bold leading-none text-foreground">{duration}</p>
    </div>
  );
}

function DesktopTimelineSideColumn({
  label,
  time,
  city,
  stopPoint,
  date,
  className,
}: {
  label: string;
  time: string;
  city: string;
  stopPoint: string;
  date: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <p className={DESKTOP_LABEL_CLASS}>{label}</p>
      <div className={DESKTOP_TIME_ROW_CLASS}>
        <p className={DESKTOP_TIME_CLASS}>{time}</p>
      </div>
      <p className={DESKTOP_CITY_CLASS}>{city}</p>
      {stopPoint ? <p className={DESKTOP_STOP_CLASS}>{stopPoint}</p> : null}
      <p className={DESKTOP_DATE_CLASS}>{date}</p>
    </div>
  );
}

function DesktopTimelineCenterColumn({ duration }: { duration: string | null }) {
  return (
    <div className="flex w-full max-w-[10rem] flex-col items-center self-stretch justify-self-center px-1 lg:max-w-[11rem]">
      <p className={cn(DESKTOP_LABEL_CLASS, "text-transparent")} aria-hidden>
        Départ
      </p>
      <div className={cn(DESKTOP_TIME_ROW_CLASS, "w-full overflow-visible")}>
        <div className="relative left-1/2 w-[calc(100%+10rem)] -translate-x-1/2 lg:w-[calc(100%+11.5rem)] xl:w-[calc(100%+13rem)]">
          <DesktopTimelineJourneyLine />
        </div>
      </div>
      {duration ? (
        <div className="mt-2">
          <DesktopDurationBadge duration={duration} />
        </div>
      ) : null}
      <div className="flex-1" aria-hidden />
    </div>
  );
}

export function TripDetailTimeline({ trip }: { trip: PublicTrip }) {
  const duration = formatTripDuration(trip.departureTime, trip.arrivalTime);
  const startCity = formatTripCityShort(trip.line.startCity);
  const endCity = formatTripCityShort(trip.line.endCity);
  const departureDate = formatTripCalendarDate(trip.departureTime);
  const arrivalDate = trip.arrivalTime
    ? formatTripCalendarDate(trip.arrivalTime)
    : departureDate;

  return (
    <section
      className={cn(
        landingCardClass,
        "bg-[#161616] p-5 sm:p-6 md:px-5 md:py-4 lg:px-6 lg:py-5"
      )}
      aria-labelledby="trip-timeline-title"
    >
      <div className="mb-4 flex items-center gap-2 md:mb-3.5">
        <Clock className="h-4 w-4 text-primary" aria-hidden />
        <h2 id="trip-timeline-title" className="text-base font-semibold text-foreground">
          Votre trajet
        </h2>
      </div>

      {/* Desktop — maquette PO : timeline + carte ~33 % */}
      <div className="hidden md:flex md:items-start md:gap-4 lg:gap-5 xl:gap-6">
        <div
          className={cn(
            "grid min-w-0 flex-1 items-stretch",
            "grid-cols-[minmax(0,1.05fr)_minmax(5.5rem,0.72fr)_minmax(0,0.95fr)]",
            "gap-x-3",
            "lg:gap-x-4",
            "xl:gap-x-5"
          )}
        >
          <DesktopTimelineSideColumn
            label="Départ"
            time={formatTime(trip.departureTime)}
            city={startCity}
            stopPoint={resolveTripStopPoint(trip.line.startCity)}
            date={departureDate}
            className="max-w-[10rem] justify-self-start lg:max-w-[11rem]"
          />
          <DesktopTimelineCenterColumn duration={duration} />
          <DesktopTimelineSideColumn
            label="Arrivée"
            time={trip.arrivalTime ? formatTime(trip.arrivalTime) : "—"}
            city={endCity}
            stopPoint={resolveTripStopPoint(trip.line.endCity)}
            date={arrivalDate}
            className="w-full max-w-[10rem] justify-self-end lg:max-w-[11rem]"
          />
        </div>

        <TripDetailHeroMap
          trip={trip}
          variant="timeline"
          className="-mt-2 w-[min(11rem,30%)] shrink-0 origin-top-right scale-[1.12] lg:-mt-3 lg:w-[min(13rem,31%)] lg:scale-[1.15] xl:-mt-3 xl:w-[min(14rem,32%)]"
        />
      </div>

      {/* Mobile — inchangé */}
      <div className="space-y-4 md:hidden">
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
            <span className="my-1 min-h-[2.5rem] w-px border-l border-dashed border-white/25" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground/80" aria-hidden />
          </div>
          <div className="min-w-0 space-y-5">
            <div>
              <p className="text-xl font-bold text-foreground">{formatTime(trip.departureTime)}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{startCity}</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {trip.arrivalTime ? formatTime(trip.arrivalTime) : "—"}
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{endCity}</p>
            </div>
          </div>
        </div>
        {duration ? (
          <p className="text-sm text-muted-foreground">
            Durée estimée : <span className="font-medium text-foreground">{duration}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
