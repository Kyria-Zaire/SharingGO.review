import { useEffect, useState } from "react";
import { INCIDENTS_UPDATED_EVENT } from "@/features/incidents/constants/incidents-config";
import { readOpenIncidentCount } from "@/features/incidents/storage/incidents-storage";

/** Lightweight sidebar badge — reads localStorage + listens for same-tab updates. */
export function useOpenIncidentCount(): number {
  const [count, setCount] = useState(readOpenIncidentCount);

  useEffect(() => {
    function refresh() {
      setCount(readOpenIncidentCount());
    }

    window.addEventListener(INCIDENTS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(INCIDENTS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return count;
}
