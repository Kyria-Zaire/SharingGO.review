import type { TripLifecycleStatus } from "@/types/trips.types";

export interface TripLifecycleDisplay {
  label: string;
  badgeClassName: string;
}

export const TRIP_LIFECYCLE_DISPLAY: Record<TripLifecycleStatus, TripLifecycleDisplay> = {
  WAITING: {
    label: "WAITING",
    badgeClassName: "border-slate-400/50 bg-slate-500/10 text-slate-300",
  },
  BOARDING: {
    label: "BOARDING",
    badgeClassName: "border-blue-400/50 bg-blue-500/10 text-blue-300",
  },
  DEPARTED: {
    label: "DEPARTED",
    badgeClassName: "border-orange-400/50 bg-orange-500/10 text-orange-300",
  },
  COMPLETED: {
    label: "COMPLETED",
    badgeClassName: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
  },
  CANCELLED: {
    label: "CANCELLED",
    badgeClassName: "border-red-400/50 bg-red-500/10 text-red-300",
  },
};

