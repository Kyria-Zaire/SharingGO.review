import { useState } from "react";
import { cn } from "@/lib/cn";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { ProfileEditActions } from "@/features/profile/edit/components/ProfileEditActions";
import { ProfileEditFilterTabs } from "@/features/profile/edit/components/ProfileEditFilterTabs";
import { ProfileEditHeroSection } from "@/features/profile/edit/components/ProfileEditHeroSection";
import { ProfileEditInfoBanner } from "@/features/profile/edit/components/ProfileEditInfoBanner";
import { ProfileEditSyncStatus } from "@/features/profile/edit/components/ProfileEditSyncStatus";
import { ProfileEditSkeleton } from "@/features/profile/edit/components/ProfileEditSkeleton";
import { ProfileEditInformationTab } from "@/features/profile/edit/components/tabs/ProfileEditInformationTab";
import { ProfileEditPaymentTab } from "@/features/profile/edit/components/tabs/ProfileEditPaymentTab";
import { ProfileEditPreferencesTab } from "@/features/profile/edit/components/tabs/ProfileEditPreferencesTab";
import { ProfileEditSecurityTab } from "@/features/profile/edit/components/tabs/ProfileEditSecurityTab";
import type { ProfileEditTab } from "@/features/profile/edit/lib/profile-edit-tabs";
import { useAuth } from "@/hooks/useAuth";

export function ProfileEditView() {
  const [tab, setTab] = useState<ProfileEditTab>("information");
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full">
        <div className={landingContainerClass}>
          <ProfileEditSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      <ProfileEditHeroSection user={user} />

      <div className={landingContainerClass}>
        <div className={cn("relative z-20 pb-8 pt-6 lg:pb-12")}>
          <ProfileEditSyncStatus />

          <div className="mt-4">
            <ProfileEditInfoBanner />
          </div>

          <div className="mt-6">
            <ProfileEditFilterTabs value={tab} onChange={setTab} />
          </div>

          {tab === "information" ? <ProfileEditInformationTab user={user} /> : null}
          {tab === "payment" ? <ProfileEditPaymentTab /> : null}
          {tab === "preferences" ? <ProfileEditPreferencesTab /> : null}
          {tab === "security" ? <ProfileEditSecurityTab /> : null}

          <ProfileEditActions layout="desktop" />
          <ProfileEditActions layout="mobile" />
        </div>
      </div>
    </div>
  );
}
