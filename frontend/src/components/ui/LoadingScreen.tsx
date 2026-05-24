export function LoadingScreen({ message = "Chargement…" }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
