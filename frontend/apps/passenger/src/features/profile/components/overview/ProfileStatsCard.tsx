import { BarChart3, CalendarCheck, Ticket } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { PROFILE_STATS } from "@/features/profile/constants/profile-content";
import type { ProfileStats } from "@/features/profile/hooks/useProfileStats";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ticket;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#161616] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ProfileStatsCard({
  stats,
  hasActiveSubscription,
}: {
  stats: ProfileStats | undefined;
  hasActiveSubscription: boolean;
}) {
  return (
    <article className={CARD_CLASS} aria-label={PROFILE_STATS.title}>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-base font-semibold text-foreground">{PROFILE_STATS.title}</h2>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatItem
          icon={Ticket}
          label={PROFILE_STATS.tripsCompleted}
          value={String(stats?.tripsCompleted ?? 0)}
        />
        <StatItem
          icon={CalendarCheck}
          label={PROFILE_STATS.reservations}
          value={String(stats?.reservationsCount ?? 0)}
        />
        <StatItem
          icon={BarChart3}
          label={PROFILE_STATS.activeSubscription}
          value={hasActiveSubscription ? PROFILE_STATS.yes : PROFILE_STATS.no}
        />
      </div>
    </article>
  );
}
