import { useEffect, useRef, useState } from "react";

/**
 * Keeps loading visible for at least `minDurationMs` to avoid dropdown flicker.
 */
export function useStabilizedLoading(isLoading: boolean, minDurationMs: number): boolean {
  const [visible, setVisible] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      startedAtRef.current = Date.now();
      setVisible(true);
      return;
    }

    if (startedAtRef.current === null) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = minDurationMs - elapsed;

    if (remaining <= 0) {
      startedAtRef.current = null;
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      startedAtRef.current = null;
      setVisible(false);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [isLoading, minDurationMs]);

  return visible;
}
