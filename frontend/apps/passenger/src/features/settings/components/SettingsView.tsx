import { useState } from "react";
import { cn } from "@/lib/cn";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { SettingsAboutTab } from "@/features/settings/components/SettingsAboutTab";
import { SettingsAccountCard } from "@/features/settings/components/SettingsAccountCard";
import { SettingsActions } from "@/features/settings/components/SettingsActions";
import { SettingsDangerZone } from "@/features/settings/components/SettingsDangerZone";
import { SettingsGeneralTab } from "@/features/settings/components/SettingsGeneralTab";
import { SettingsHeroSection } from "@/features/settings/components/SettingsHeroSection";
import { SettingsNotificationsTab } from "@/features/settings/components/SettingsNotificationsTab";
import { SettingsPrivacyTab } from "@/features/settings/components/SettingsPrivacyTab";
import { SettingsSecurityTab } from "@/features/settings/components/SettingsSecurityTab";
import { SettingsSkeleton } from "@/features/settings/components/SettingsSkeleton";
import { SettingsTabs } from "@/features/settings/components/SettingsTabs";
import type { SettingsTab } from "@/features/settings/lib/settings-tabs";
import { useAuth } from "@/hooks/useAuth";

export function SettingsView() {
  const [tab, setTab] = useState<SettingsTab>("general");
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full">
        <div className={landingContainerClass}>
          <SettingsSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="w-full">
      <SettingsHeroSection onLogout={handleLogout} />

      <div className={landingContainerClass}>
        <div className={cn("relative z-20 -mt-4 sm:-mt-8 lg:-mt-10", "pb-8 pt-6 lg:pb-12")}>
          <SettingsAccountCard user={user} />

          <div className="mt-6">
            <SettingsTabs value={tab} onChange={setTab} />
          </div>

          {tab === "general" ? <SettingsGeneralTab /> : null}
          {tab === "notifications" ? <SettingsNotificationsTab /> : null}
          {tab === "privacy" ? <SettingsPrivacyTab /> : null}
          {tab === "security" ? <SettingsSecurityTab /> : null}
          {tab === "about" ? <SettingsAboutTab /> : null}

          <SettingsDangerZone />

          <SettingsActions layout="desktop" />
          <SettingsActions layout="mobile" />
        </div>
      </div>
    </div>
  );
}
