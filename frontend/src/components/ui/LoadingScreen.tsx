import { BrandLogo } from "@/components/brand/BrandLogo";

export function LoadingScreen({
  message = "Chargement de la session…",
}: {
  message?: string;
}) {
  return (
    <div
      className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">Admin cockpit</p>
      </div>

      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-hidden
      />

      <p className="max-w-xs text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
