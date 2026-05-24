/** Visual-only occupancy level for OccupancyBadge (no business rules). */
export type OccupancyVisualLevel = "low" | "medium" | "full";

export function getOccupancyVisualLevel(occupied: number, total: number): OccupancyVisualLevel {
  if (total <= 0) {
    return "low";
  }
  if (occupied >= total) {
    return "full";
  }
  const ratio = occupied / total;
  if (ratio >= 0.6) {
    return "medium";
  }
  return "low";
}
