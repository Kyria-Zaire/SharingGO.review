import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminPaymentFilters, PaymentStatus, PaymentType } from "@/types/payments.types";

const STATUS_OPTIONS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "SUCCEEDED", label: "Réussi" },
  { value: "PENDING", label: "En attente" },
  { value: "FAILED", label: "Échoué" },
  { value: "REFUNDED", label: "Remboursé" },
];

const TYPE_OPTIONS: { value: PaymentType | ""; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "TICKET", label: "Ticket" },
  { value: "SUBSCRIPTION", label: "Abonnement" },
  { value: "SUBSCRIPTION_ACCESS", label: "Accès abonnement" },
];

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export interface PaymentsFiltersProps {
  filters: AdminPaymentFilters;
  onChange: (filters: AdminPaymentFilters) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  hasNextPage?: boolean;
}

export function PaymentsFilters({
  filters,
  onChange,
  onRefresh,
  isRefreshing,
  onPrevPage,
  onNextPage,
  hasNextPage,
}: PaymentsFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="pay-status" className="text-sm font-medium text-foreground">
            Statut
          </label>
          <select
            id="pay-status"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.status ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                status: (e.target.value || undefined) as PaymentStatus | undefined,
                offset: 0,
              })
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pay-type" className="text-sm font-medium text-foreground">
            Type
          </label>
          <select
            id="pay-type"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.type ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                type: (e.target.value || undefined) as PaymentType | undefined,
                offset: 0,
              })
            }
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pay-from" className="text-sm font-medium text-foreground">
            Créé après
          </label>
          <input
            id="pay-from"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={toDatetimeLocalValue(filters.from)}
            onChange={(e) =>
              onChange({ ...filters, from: fromDatetimeLocalValue(e.target.value), offset: 0 })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pay-to" className="text-sm font-medium text-foreground">
            Créé avant
          </label>
          <input
            id="pay-to"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={toDatetimeLocalValue(filters.to)}
            onChange={(e) =>
              onChange({ ...filters, to: fromDatetimeLocalValue(e.target.value), offset: 0 })
            }
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="pay-limit" className="text-sm font-medium text-foreground">
            Limite
          </label>
          <input
            id="pay-limit"
            type="number"
            min={1}
            max={100}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filters.limit ?? 50}
            onChange={(e) =>
              onChange({ ...filters, limit: Number(e.target.value) || 50, offset: 0 })
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Offset : {filters.offset ?? 0}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onPrevPage}
            disabled={(filters.offset ?? 0) <= 0}
          >
            Page préc.
          </Button>
          <Button variant="secondary" size="sm" onClick={onNextPage} disabled={!hasNextPage}>
            Page suiv.
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={onRefresh} isLoading={isRefreshing}>
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>
    </div>
  );
}
