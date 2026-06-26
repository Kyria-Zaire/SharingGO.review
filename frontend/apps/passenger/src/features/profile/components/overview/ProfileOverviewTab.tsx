import type { PassengerUser } from "@/types/auth";
import type { SubscriptionMeResponse } from "@/types/subscriptions.types";
import type { UserReservationListItem } from "@/types/reservations";
import type { ProfileStats } from "@/features/profile/hooks/useProfileStats";
import { ProfileIdentityCard } from "@/features/profile/components/overview/ProfileIdentityCard";
import { ProfileSubscriptionCard } from "@/features/profile/components/overview/ProfileSubscriptionCard";
import { ProfileStatsCard } from "@/features/profile/components/overview/ProfileStatsCard";
import { ProfileLoyaltyCard } from "@/features/profile/components/overview/ProfileLoyaltyCard";
import { ProfileRecentActivitySection } from "@/features/profile/components/overview/ProfileRecentActivitySection";

export function ProfileOverviewTab({
  user,
  me,
  stats,
  recentReservations,
}: {
  user: PassengerUser;
  me: SubscriptionMeResponse | undefined;
  stats: ProfileStats | undefined;
  recentReservations: UserReservationListItem[];
}) {
  const tripsCompleted = stats?.tripsCompleted ?? 0;

  return (
    <div className="space-y-6 pt-6">
      <div className="grid gap-5 md:grid-cols-2">
        <ProfileIdentityCard user={user} />
        <ProfileSubscriptionCard me={me} />
      </div>

      <ProfileStatsCard stats={stats} hasActiveSubscription={Boolean(me?.isActive)} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileLoyaltyCard tripsCompleted={tripsCompleted} />
        </div>
        <div className="lg:col-span-2">
          <ProfileRecentActivitySection reservations={recentReservations} />
        </div>
      </div>
    </div>
  );
}
