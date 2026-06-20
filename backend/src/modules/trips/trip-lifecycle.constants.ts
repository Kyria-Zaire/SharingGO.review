import { TripLifecycleStatus } from "@prisma/client";

export const TRIP_LIFECYCLE_AUDIT_ACTIONS = {
  BOARDING_STARTED: "TRIP_BOARDING_STARTED",
  DEPARTED: "TRIP_DEPARTED",
  COMPLETED: "TRIP_COMPLETED",
  CANCELLED: "TRIP_CANCELLED",
} as const;

/** Allowed manual transitions (OPS-03B / CTO). */
export const ALLOWED_LIFECYCLE_TRANSITIONS: Record<
  TripLifecycleStatus,
  readonly TripLifecycleStatus[]
> = {
  [TripLifecycleStatus.WAITING]: [TripLifecycleStatus.BOARDING, TripLifecycleStatus.CANCELLED],
  [TripLifecycleStatus.BOARDING]: [TripLifecycleStatus.DEPARTED, TripLifecycleStatus.CANCELLED],
  [TripLifecycleStatus.DEPARTED]: [TripLifecycleStatus.COMPLETED],
  [TripLifecycleStatus.COMPLETED]: [],
  [TripLifecycleStatus.CANCELLED]: [],
};
