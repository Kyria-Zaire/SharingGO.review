import { cn } from "@/lib/cn";

export interface LandingSubscriptionVisualProps {
  className?: string;
}

/**
 * Visuel abonnements temporaire — remplacer par photo intérieur navette SharingGO avant prod terrain.
 */
export function LandingSubscriptionVisual({ className }: LandingSubscriptionVisualProps) {
  return (
    <div
      className={cn(
        "relative min-h-[12rem] w-full overflow-hidden rounded-xl border border-border/60 bg-[#0a0a0a] sm:min-h-[16rem] lg:min-h-full lg:min-w-0",
        className
      )}
      role="img"
      aria-label="Intérieur premium de la navette SharingGO avec sièges en cuir et éclairage vert"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#14532d]/30 via-[#0a0a0a] to-black" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-transparent to-transparent" />

      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x="40" y="80" width="320" height="160" rx="12" fill="#111" stroke="#262626" />
        {[0, 1, 2].map((row) =>
          [0, 1].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={70 + col * 140}
              y={100 + row * 45}
              width="100"
              height="32"
              rx="8"
              fill="#1a1a1a"
              stroke="#333"
            />
          ))
        )}
        <rect x="0" y="200" width="400" height="100" fill="#22c55e" opacity="0.08" />
        <ellipse cx="200" cy="260" rx="160" ry="30" fill="#22c55e" opacity="0.15" />
      </svg>
    </div>
  );
}
