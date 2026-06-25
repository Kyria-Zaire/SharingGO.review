import { formatTripCalendarDate } from "@/lib/format-date";

export function formatBoardingValidDateLabel(departureTime: string): string {
  return `Valide le ${formatTripCalendarDate(departureTime)}`;
}
