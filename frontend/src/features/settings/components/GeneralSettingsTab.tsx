import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_GENERAL_SETTINGS,
  loadGeneralSettings,
  saveGeneralSettings,
  type GeneralSettings,
} from "@/features/settings/storage/settings-storage";

export function GeneralSettingsTab() {
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_GENERAL_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadGeneralSettings());
  }, []);

  function handleSave() {
    saveGeneralSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">
        Préférences cockpit V1 — stockage local uniquement (pas de backend).
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.compactMode}
          onChange={(event) =>
            setSettings((current) => ({ ...current, compactMode: event.target.checked }))
          }
          className="accent-primary"
        />
        Mode compact
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.relativeTimestamps}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              relativeTimestamps: event.target.checked,
            }))
          }
          className="accent-primary"
        />
        Horodatages relatifs par défaut
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.autoRefreshEnabled}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              autoRefreshEnabled: event.target.checked,
            }))
          }
          className="accent-primary"
        />
        Auto-refresh activé (pages polling)
      </label>

      <label className="block text-sm text-muted-foreground">
        Taille de page par défaut
        <select
          className="mt-1 flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          value={settings.defaultPageSize}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              defaultPageSize: Number(event.target.value),
            }))
          }
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>

      <Button onClick={handleSave}>Enregistrer les préférences</Button>
      {saved ? <p className="text-sm text-primary">Préférences enregistrées.</p> : null}
    </div>
  );
}
