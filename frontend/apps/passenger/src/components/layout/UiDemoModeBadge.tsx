import { shouldShowUiDemoBadge } from "@/lib/ui-demo-trips";

export function UiDemoModeBadge() {
  if (!shouldShowUiDemoBadge()) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-center backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber-200/90">
        Mode démonstration UI
      </p>
      <p className="mt-0.5 text-[0.5625rem] font-medium normal-case tracking-normal text-amber-200/70">
        Retirer avant PROD — voir WEB-DEMO-DATA-01
      </p>
    </div>
  );
}
