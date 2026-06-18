import { useEffect, useState } from "react";

export interface BoardingCountdownState {
  /** Millisecondes restantes (0 si expiré). */
  remainingMs: number;
  /** Affichage lisible pour l'utilisateur. */
  display: string;
  isExpired: boolean;
}

function computeRemainingMs(expiresAt: string, now: Date): number {
  const expiry = Date.parse(expiresAt);
  if (Number.isNaN(expiry)) {
    return 0;
  }
  return Math.max(0, expiry - now.getTime());
}

function formatBoardingCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const days = Math.floor(clamped / 86_400);
  const hours = Math.floor((clamped % 86_400) / 3_600);
  const minutes = Math.floor((clamped % 3_600) / 60);
  const seconds = clamped % 60;

  if (days > 0) {
    return `${days} j ${hours} h ${minutes} min`;
  }
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useBoardingCountdown(expiresAt: string | undefined): BoardingCountdownState {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 1_000);
    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  if (!expiresAt) {
    return { remainingMs: 0, display: "00:00", isExpired: true };
  }

  const remainingMs = computeRemainingMs(expiresAt, now);
  const remainingSeconds = Math.ceil(remainingMs / 1_000);

  return {
    remainingMs,
    display: formatBoardingCountdown(remainingSeconds),
    isExpired: remainingMs <= 0,
  };
}
