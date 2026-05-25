import { Button } from "@/components/ui/Button";
import { loadLegacyLocalIncidentsRaw } from "@/features/incidents/storage/incidents-storage";
import { parseLegacyLocalIncidents, toImportPayload } from "@/features/incidents/utils/map-local-import";

export function LocalIncidentsImportBanner({
  onImport,
  isImporting,
}: {
  onImport: (payload: ReturnType<typeof toImportPayload>) => void;
  isImporting: boolean;
}) {
  const legacy = parseLegacyLocalIncidents(loadLegacyLocalIncidentsRaw());
  if (legacy.length === 0) return null;

  return (
    <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
      <p className="text-sm text-foreground">
        {legacy.length} incident(s) local(aux) détecté(s) dans ce navigateur. Les importer en base
        pour les partager avec l&apos;équipe ?
      </p>
      <Button
        size="sm"
        className="mt-2"
        isLoading={isImporting}
        onClick={() => onImport(toImportPayload(legacy))}
      >
        Importer
      </Button>
    </div>
  );
}
