import { AlertTriangle, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { OPS_RUNBOOKS, OPS_RUNBOOKS_REPO_BLOB_BASE } from "@/features/monitoring/constants/ops-runbooks";

export function OpsRunbooksCard() {
  const critical = OPS_RUNBOOKS.filter((r) => r.criticalBilling);
  const others = OPS_RUNBOOKS.filter((r) => !r.criticalBilling);

  return (
    <Card className="border-border">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Runbooks ops</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Documentation d’exploitation — accessible même si le monitoring API est indisponible.
      </p>

      <div className="space-y-3">
        {critical.map((runbook) => (
          <a
            key={runbook.id}
            href={`${OPS_RUNBOOKS_REPO_BLOB_BASE}/${runbook.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border-2 border-warning/50 bg-warning/10 p-4 transition-colors hover:bg-warning/15"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-semibold text-foreground">{runbook.title}</span>
              <Badge variant="warning">critical billing</Badge>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">{runbook.description}</p>
            <p className="flex items-center gap-1 font-mono text-xs text-foreground">
              {runbook.path}
              <ExternalLink className="h-3 w-3" />
            </p>
          </a>
        ))}

        {others.map((runbook) => (
          <a
            key={runbook.id}
            href={`${OPS_RUNBOOKS_REPO_BLOB_BASE}/${runbook.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <p className="font-medium text-foreground">{runbook.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{runbook.description}</p>
            <p className="mt-2 flex items-center gap-1 font-mono text-xs text-muted-foreground">
              {runbook.path}
              <ExternalLink className="h-3 w-3" />
            </p>
          </a>
        ))}
      </div>
    </Card>
  );
}
