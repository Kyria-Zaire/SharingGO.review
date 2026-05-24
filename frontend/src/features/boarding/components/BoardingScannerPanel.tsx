import { Eraser, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export interface BoardingScannerPanelProps {
  tokenInput: string;
  onTokenChange: (value: string) => void;
  onValidate: () => void;
  onConsume: () => void;
  onClear: () => void;
  isValidating: boolean;
  isConsuming: boolean;
  disabled?: boolean;
}

export function BoardingScannerPanel({
  tokenInput,
  onTokenChange,
  onValidate,
  onConsume,
  onClear,
  isValidating,
  isConsuming,
  disabled,
}: BoardingScannerPanelProps) {
  const busy = isValidating || isConsuming || disabled;

  return (
    <Card className="border-primary/20">
      <div className="mb-4 flex items-center gap-2">
        <ScanLine className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Scanner V1 (JWT)</h3>
          <p className="text-sm text-muted-foreground">
            Collez le JWT du QR — simule scan mobile / chauffeur. Pas de caméra en V1.
          </p>
        </div>
      </div>

      <label htmlFor="boarding-jwt" className="sr-only">
        JWT boarding
      </label>
      <textarea
        id="boarding-jwt"
        rows={4}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
        className="mb-4 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        value={tokenInput}
        onChange={(e) => onTokenChange(e.target.value)}
        disabled={busy}
        spellCheck={false}
        autoComplete="off"
      />

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={onValidate}
          isLoading={isValidating}
          disabled={busy || !tokenInput.trim()}
        >
          Valider
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="min-w-[9rem] font-semibold shadow-md shadow-primary/20"
          onClick={onConsume}
          isLoading={isConsuming}
          disabled={busy || !tokenInput.trim()}
        >
          Consommer
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={busy}>
          <Eraser className="h-4 w-4" />
          Effacer le scan
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Valider</strong> = contrôle sans consommer · <strong>Consommer</strong> = embarquement
        terrain réel (action prioritaire).
      </p>
    </Card>
  );
}
