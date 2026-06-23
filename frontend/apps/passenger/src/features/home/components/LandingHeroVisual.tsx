import { cn } from "@/lib/cn";

export interface LandingHeroVisualProps {
  className?: string;
}

/**
 * Visuel hero temporaire — remplacer par photo officielle navette SharingGO avant prod terrain.
 */
export function LandingHeroVisual({ className }: LandingHeroVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/70 bg-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
        className
      )}
      role="img"
      aria-label="Navette SharingGO noire devant le terminal de Vatry de nuit"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#111827]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

      <svg
        viewBox="0 0 640 480"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        <rect x="0" y="280" width="640" height="200" fill="#1f2937" />
        <rect x="80" y="120" width="220" height="180" rx="8" fill="#111827" opacity="0.9" />
        <rect x="100" y="140" width="60" height="40" rx="4" fill="#22c55e" opacity="0.35" />
        <text x="130" y="168" fill="#22c55e" fontSize="22" fontWeight="700" textAnchor="middle">
          GO
        </text>
        <rect x="300" y="220" width="280" height="110" rx="16" fill="#0f0f0f" stroke="#333" strokeWidth="2" />
        <rect x="320" y="240" width="200" height="50" rx="6" fill="#171717" />
        <text x="420" y="272" fill="#22c55e" fontSize="18" fontWeight="700" textAnchor="middle">
          SharingGO
        </text>
        <circle cx="340" cy="330" r="22" fill="#1a1a1a" stroke="#333" strokeWidth="3" />
        <circle cx="540" cy="330" r="22" fill="#1a1a1a" stroke="#333" strokeWidth="3" />
        <rect x="0" y="0" width="640" height="280" fill="url(#sky)" opacity="0.5" />
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-1.5" aria-hidden>
        <span className="h-1.5 w-6 rounded-full bg-foreground" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      </div>
    </div>
  );
}
