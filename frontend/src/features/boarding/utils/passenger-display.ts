import type { BoardingPassenger } from "@/types/boarding.types";

export function formatBoardingPassenger(passenger: BoardingPassenger): string {
  const full = [passenger.firstName, passenger.lastName].filter(Boolean).join(" ").trim();
  return full || "Passager";
}
