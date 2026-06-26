import { FileText } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  LEGAL_DOCUMENT_META_LABELS,
  type LegalDocumentMeta,
} from "@/features/legal/constants/legal-document-meta";

export function LegalDocumentMetaCard({ meta }: { meta: LegalDocumentMeta }) {
  return (
    <aside
      className={cn(landingCardClass, "bg-[#121212] p-4")}
      aria-label="Informations sur le document"
    >
      <div className="flex items-center gap-2 px-1">
        <FileText className="h-4 w-4 text-primary" aria-hidden />
        <span className="text-sm font-semibold text-foreground">Document</span>
      </div>

      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {LEGAL_DOCUMENT_META_LABELS.readingTime}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">{meta.readingTime}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {LEGAL_DOCUMENT_META_LABELS.version}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">{meta.version}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {LEGAL_DOCUMENT_META_LABELS.effectiveDate}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            <time dateTime={meta.effectiveDateIso}>{meta.effectiveDate}</time>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {LEGAL_DOCUMENT_META_LABELS.lastUpdated}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            <time dateTime={meta.lastUpdatedIso}>{meta.lastUpdatedDate}</time>
          </dd>
        </div>
      </dl>
    </aside>
  );
}
