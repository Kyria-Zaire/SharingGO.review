import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ScanNetworkErrorProps {
  context: "validate" | "consume";
  onRetry: () => void;
  onCancel: () => void;
}

export function ScanNetworkError({ context, onRetry, onCancel }: ScanNetworkErrorProps) {
  const detail =
    context === "validate"
      ? "La vérification du billet a échoué. Le billet n'a pas été refusé — c'est une erreur réseau."
      : "L'enregistrement de l'embarquement a échoué. Aucune place n'a été consommée.";

  return (
    <div className="min-w-0 rounded-lg border border-warning/40 bg-warning/5 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <WifiOff className="mt-0.5 h-7 w-7 shrink-0 text-warning" />
        <div>
          <p className="text-base font-bold text-foreground">⚠️ Connexion impossible — réessayez</p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          className="flex-1 font-semibold"
          onClick={onRetry}
        >
          Réessayer
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={onCancel}
        >
          Annuler — rescanner
        </Button>
      </div>
    </div>
  );
}
