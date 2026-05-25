import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  DEFAULT_COMPANY_SETTINGS,
  loadCompanySettings,
  saveCompanySettings,
  type CompanySettings,
} from "@/features/settings/storage/settings-storage";

export function CompanySettingsTab() {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadCompanySettings());
  }, []);

  function handleSave() {
    saveCompanySettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-xs text-warning">
        Local V1 — backend CompanySettings futur. Ces données ne sont pas synchronisées serveur.
      </p>

      <Input
        placeholder="Nom de l'organisation"
        value={settings.companyName}
        onChange={(event) =>
          setSettings((current) => ({ ...current, companyName: event.target.value }))
        }
      />
      <Input
        type="email"
        placeholder="Email de contact"
        value={settings.contactEmail}
        onChange={(event) =>
          setSettings((current) => ({ ...current, contactEmail: event.target.value }))
        }
      />
      <Input
        placeholder="Téléphone"
        value={settings.phone}
        onChange={(event) =>
          setSettings((current) => ({ ...current, phone: event.target.value }))
        }
      />
      <Input
        placeholder="Adresse"
        value={settings.address}
        onChange={(event) =>
          setSettings((current) => ({ ...current, address: event.target.value }))
        }
      />
      <Input
        placeholder="URL logo (placeholder)"
        value={settings.logoUrl}
        onChange={(event) =>
          setSettings((current) => ({ ...current, logoUrl: event.target.value }))
        }
      />

      <Button onClick={handleSave}>Enregistrer</Button>
      {saved ? <p className="text-sm text-primary">Informations société enregistrées.</p> : null}
    </div>
  );
}
