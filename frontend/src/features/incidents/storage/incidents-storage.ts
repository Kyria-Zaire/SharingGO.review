import { INCIDENTS_STORAGE_KEY } from "@/features/incidents/constants/incidents-config";

/** Legacy localStorage payload (F3-T9 V1) — used only for import banner */
export function loadLegacyLocalIncidentsRaw(): unknown[] {
  try {
    const raw = localStorage.getItem(INCIDENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearLegacyLocalIncidents(): void {
  localStorage.removeItem(INCIDENTS_STORAGE_KEY);
}

/** @deprecated After import, local incidents are cleared */
export function saveIncidentsToStorage(incidents: unknown[]): void {
  localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
}
