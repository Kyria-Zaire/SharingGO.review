import { useEffect, useState } from "react";

export interface PendingCountdownState {
  /** Secondes restantes (0 si expiré). */
  remainingSeconds: number;
  /** Affichage MM:SS. */
  display: string;
  isExpired: boolean;
}

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function computeRemainingSeconds(expiresAt: string, now: Date): number {
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) {
    return 0;
  }
  return Math.max(0, Math.ceil((expiry - now.getTime()) / 1000));
}

export function usePendingCountdown(expiresAt: string | undefined): PendingCountdownState {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  if (!expiresAt) {
    return { remainingSeconds: 0, display: "00:00", isExpired: true };
  }

  const remainingSeconds = computeRemainingSeconds(expiresAt, now);
  return {
    remainingSeconds,
    display: formatCountdown(remainingSeconds),
    isExpired: remainingSeconds <= 0,
  };
}
