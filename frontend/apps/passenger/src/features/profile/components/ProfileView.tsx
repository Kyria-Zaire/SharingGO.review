import { useState } from "react";
import { cn } from "@/lib/cn";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { ProfileErrorCard } from "@/features/profile/components/ProfileErrorCard";
import { ProfileFilterTabs } from "@/features/profile/components/ProfileFilterTabs";
import { ProfileHeroSection } from "@/features/profile/components/ProfileHeroSection";
import { ProfileInformationTab } from "@/features/profile/components/information/ProfileInformationTab";
import { ProfileOverviewTab } from "@/features/profile/components/overview/ProfileOverviewTab";
import { ProfilePaymentTab } from "@/features/profile/components/payment/ProfilePaymentTab";
import { ProfilePreferencesTab } from "@/features/profile/components/preferences/ProfilePreferencesTab";
import { ProfileSecurityTab } from "@/features/profile/components/security/ProfileSecurityTab";
import { ProfileSkeleton } from "@/features/profile/components/ProfileSkeleton";
import { useProfileRecentReservations } from "@/features/profile/hooks/useProfileRecentReservations";
import { useProfileStats } from "@/features/profile/hooks/useProfileStats";
import type { ProfileTab } from "@/features/profile/lib/profile-tabs";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionMe } from "@/hooks/useSubscriptionMe";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";

export function ProfileView() {
  const [tab, setTab] = useState<ProfileTab>("overview");
  const { user, logout } = useAuth();
  const meQuery = useSubscriptionMe();
  const statsQuery = useProfileStats();
  const recentQuery = useProfileRecentReservations();

  if (!user) {
    return null;
  }

  const isLoading = meQuery.isPending || statsQuery.isPending || recentQuery.isPending;
  const isError = meQuery.isError || statsQuery.isError || recentQuery.isError;
  const errorMessage = formatUserFacingError(
    meQuery.error ?? statsQuery.error ?? recentQuery.error,
    USER_MESSAGES.profileLoad
  );

  const handleRetry = () => {
    void meQuery.refetch();
    void statsQuery.refetch();
    void recentQuery.refetch();
  };

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="w-full">
      <ProfileHeroSection onLogout={handleLogout} />

      <div className={landingContainerClass}>
        <div className={cn("relative z-20 -mt-4 sm:-mt-10 lg:-mt-12", "pb-8 pt-0 lg:pb-12")}>
          <ProfileFilterTabs value={tab} onChange={setTab} />

          {isLoading ? <ProfileSkeleton /> : null}

          {isError && !isLoading ? (
            <div className="pt-6">
              <ProfileErrorCard message={errorMessage} onRetry={handleRetry} />
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <>
              {tab === "overview" ? (
                <ProfileOverviewTab
                  user={user}
                  me={meQuery.data}
                  stats={statsQuery.data}
                  recentReservations={recentQuery.data?.reservations ?? []}
                />
              ) : null}

              {tab === "information" ? <ProfileInformationTab user={user} /> : null}
              {tab === "payment" ? <ProfilePaymentTab /> : null}
              {tab === "preferences" ? <ProfilePreferencesTab /> : null}
              {tab === "security" ? <ProfileSecurityTab /> : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
