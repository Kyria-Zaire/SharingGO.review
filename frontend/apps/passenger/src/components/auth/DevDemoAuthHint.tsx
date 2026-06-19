const DEMO_EMAIL = "passenger15@sharinggo.demo";
const DEMO_PASSWORD = "DemoPassword123!";

interface DevDemoAuthHintProps {
  onUseDemo: (email: string, password: string) => void;
}

/** Compte seed — visible uniquement en développement local. */
export function DevDemoAuthHint({ onUseDemo }: DevDemoAuthHintProps) {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="mt-4 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
      <p className="font-medium text-foreground">Compte demo (dev)</p>
      <p className="mt-1 font-mono">{DEMO_EMAIL}</p>
      <p className="font-mono">{DEMO_PASSWORD}</p>
      <button
        type="button"
        className="mt-2 font-medium text-primary underline-offset-2 hover:underline"
        onClick={() => onUseDemo(DEMO_EMAIL, DEMO_PASSWORD)}
      >
        Remplir le formulaire
      </button>
    </div>
  );
}
