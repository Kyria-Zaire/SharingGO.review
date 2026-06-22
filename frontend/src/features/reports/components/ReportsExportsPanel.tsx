import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { downloadReportCsv } from "@/api/admin-reports.api";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import {
  DashboardWidget,
} from "@/features/dashboard/components/DashboardWidget";
import type { ReportExportKey, ReportsPeriod } from "@/types/reports.types";

const EXPORT_ITEMS: { key: ReportExportKey; label: string; description: string }[] = [
  {
    key: "trips",
    label: "CSV Trajets",
    description: "Détail opérationnel par trajet sur la période active",
  },
  {
    key: "incidents",
    label: "CSV Incidents",
    description: "Liste des incidents survenus pendant la période",
  },
  {
    key: "payments",
    label: "CSV Paiements",
    description: "Paiements réussis créés pendant la période",
  },
  {
    key: "summary",
    label: "CSV Synthèse",
    description: "KPIs agrégés de la période (une feuille clé-valeur)",
  },
];

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

interface ReportsExportsPanelProps {
  period: ReportsPeriod;
  generatedAt?: string;
}

export function ReportsExportsPanel({ period, generatedAt }: ReportsExportsPanelProps) {
  const [activeKey, setActiveKey] = useState<ReportExportKey | null>(null);
  const [lastExport, setLastExport] = useState<{
    key: ReportExportKey;
    filename: string;
    at: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(key: ReportExportKey) {
    setActiveKey(key);
    setError(null);
    try {
      const { blob, filename } = await downloadReportCsv(key, period);
      triggerBrowserDownload(blob, filename);
      setLastExport({ key, filename, at: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec du téléchargement");
    } finally {
      setActiveKey(null);
    }
  }

  return (
    <DashboardWidget
      title="Exports"
      description="Téléchargement CSV UTF-8 (compatible Excel Windows)"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {EXPORT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-muted/15 p-4"
          >
            <div>
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit"
              disabled={activeKey != null}
              onClick={() => handleExport(item.key)}
            >
              {activeKey === item.key ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Télécharger
            </Button>
          </div>
        ))}
      </div>

      {generatedAt ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Données synthèse générées le{" "}
          {new Date(generatedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}
        </p>
      ) : null}

      {lastExport ? (
        <p className="mt-2 text-sm text-primary">
          Export « {lastExport.key} » téléchargé — {lastExport.filename} (
          {new Date(lastExport.at).toLocaleTimeString("fr-FR")})
        </p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </DashboardWidget>
  );
}
