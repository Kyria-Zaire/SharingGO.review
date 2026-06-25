import { useId, useMemo } from "react";
import { cn } from "@/lib/cn";
import { formatTripCityShort } from "@/lib/trip-city-labels";
import {
  TRIP_HERO_MAP_ASSET,
  HERO_MAP_REFERENCE_ASPECT,
  HERO_MAP_TIMELINE_ASPECT,
  resolveHeroMapRoutePoints,
  shouldShowHeroMapDynamicOverlay,
} from "@/features/trips/constants/trip-hero-map";
import {
  resolveMarkerPlacement,
  routeChevronPositions,
  smoothRoutePath,
  type MarkerPlacement,
  type PercentPoint,
} from "@/features/trips/lib/trip-hero-map-overlay";
import type { PublicTrip } from "@/types/trips.types";

export interface TripDetailHeroMapProps {
  trip: PublicTrip;
  className?: string;
  /** `timeline` — carte dans la section « Votre trajet ». */
  variant?: "hero" | "inline" | "timeline";
}

const PLACEMENT_CLASS: Record<MarkerPlacement, string> = {
  right: "flex-row items-center gap-2 -translate-x-0 -translate-y-1/2",
  left: "flex-row-reverse items-center gap-2 -translate-x-full -translate-y-1/2",
  below: "flex-col items-center gap-1.5 -translate-x-1/2 translate-y-0",
  above: "flex-col-reverse items-center gap-1.5 -translate-x-1/2 -translate-y-full",
};

function MapMarker({
  label,
  position,
  placement,
  compact = false,
}: {
  label: string;
  position: PercentPoint;
  placement: MarkerPlacement;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-20 flex",
        PLACEMENT_CLASS[placement]
      )}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"
        )}
        aria-hidden
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 blur-[2px]" />
        <span
          className={cn(
            "relative rounded-full bg-primary ring-white shadow-[0_0_10px_rgba(34,197,94,0.85)]",
            compact ? "h-2 w-2 ring-[2px]" : "h-3 w-3 ring-[2.5px]"
          )}
        />
      </span>
      <span
        className={cn(
          "truncate rounded-md border border-white/12 bg-black/80 font-semibold leading-tight text-white backdrop-blur-md",
          compact
            ? "max-w-[4.75rem] px-1.5 py-0.5 text-[0.5625rem] leading-none"
            : "max-w-[9.5rem] px-2.5 py-1 text-[0.7rem] shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:max-w-none sm:text-xs"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function TripDetailHeroMap({
  trip,
  className,
  variant = "hero",
}: TripDetailHeroMapProps) {
  const isTimeline = variant === "timeline";
  const isCompactMarker = variant === "inline";
  const mapId = useId().replace(/:/g, "");
  const glowFilterId = `route-glow-${mapId}`;
  const arrowMarkerId = `route-arrow-${mapId}`;

  const percentPoints = useMemo(
    () => resolveHeroMapRoutePoints(trip.line.startCity),
    [trip.line.startCity]
  );

  const showDynamicOverlay = useMemo(
    () => shouldShowHeroMapDynamicOverlay(),
    []
  );

  const showGrading = variant === "hero" && showDynamicOverlay;

  const routePath = useMemo(() => smoothRoutePath(percentPoints), [percentPoints]);
  const chevrons = useMemo(() => routeChevronPositions(percentPoints), [percentPoints]);

  const startPos = percentPoints[0] ?? { x: 14, y: 20 };
  const endPos = percentPoints[percentPoints.length - 1] ?? { x: 86, y: 80 };

  const startLabel = formatTripCityShort(trip.line.startCity);
  const endLabel = formatTripCityShort(trip.line.endCity);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-white/[0.12] bg-[#050505]",
        isTimeline || variant === "inline"
          ? "w-full rounded-xl shadow-none"
          : "rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
        className
      )}
      role="img"
      aria-label={`Itinéraire ${startLabel} vers ${endLabel}`}
    >
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${isTimeline ? HERO_MAP_TIMELINE_ASPECT : HERO_MAP_REFERENCE_ASPECT}`,
        }}
      >
        <img
          src={TRIP_HERO_MAP_ASSET}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full",
            isTimeline || !showDynamicOverlay ? "object-cover object-top" : "object-contain object-center"
          )}
          loading="eager"
          decoding="async"
          draggable={false}
        />

        {showGrading ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-[#0b1220]/30 mix-blend-multiply"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]"
              aria-hidden
            />
          </>
        ) : null}

        {showDynamicOverlay ? (
          <>
            <svg
              className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <marker
                  id={arrowMarkerId}
                  markerWidth="5"
                  markerHeight="5"
                  refX="4"
                  refY="2.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,5 L5,2.5 z" fill="rgba(255,255,255,0.9)" />
                </marker>
              </defs>

              <path
                d={routePath}
                fill="none"
                stroke="rgba(34,197,94,0.45)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                filter={`url(#${glowFilterId})`}
              />
              <path
                d={routePath}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                markerEnd={`url(#${arrowMarkerId})`}
              />

              {chevrons.map((chevron, index) => (
                <g
                  key={index}
                  transform={`translate(${chevron.x} ${chevron.y}) rotate(${chevron.angle})`}
                >
                  <path
                    d="M -1.4 -1.1 L 1.5 0 L -1.4 1.1 Z"
                    fill="rgba(255,255,255,0.92)"
                  />
                </g>
              ))}
            </svg>

            <MapMarker
              label={startLabel}
              position={startPos}
              placement={resolveMarkerPlacement(startPos.x, startPos.y)}
              compact={isCompactMarker}
            />
            <MapMarker
              label={endLabel}
              position={endPos}
              placement={resolveMarkerPlacement(endPos.x, endPos.y)}
              compact={isCompactMarker}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
