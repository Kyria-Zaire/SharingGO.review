import { useState } from "react";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompanySettingsTab } from "@/features/settings/components/CompanySettingsTab";
import { GeneralSettingsTab } from "@/features/settings/components/GeneralSettingsTab";
import { SecuritySettingsTab } from "@/features/settings/components/SecuritySettingsTab";
import { SystemSettingsTab } from "@/features/settings/components/SystemSettingsTab";
import { TeamSettingsTab } from "@/features/settings/components/TeamSettingsTab";

const TABS = [
  { id: "team", label: "Équipe" },
  { id: "general", label: "Général" },
  { id: "company", label: "Société" },
  { id: "security", label: "Sécurité" },
  { id: "system", label: "Système" },
] as const;

type SettingsTabId = (typeof TABS)[number]["id"];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("team");

  return (
    <>
      <PageHeader
        title="Settings"
        description="Gestion de l'équipe, préférences cockpit et configuration opérationnelle V1"
      />

      <nav
        className="mb-6 -mx-1 flex gap-2 overflow-x-auto border-b border-border pb-2 px-1"
        aria-label="Onglets paramètres"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "team" ? <TeamSettingsTab /> : null}
      {activeTab === "general" ? <GeneralSettingsTab /> : null}
      {activeTab === "company" ? <CompanySettingsTab /> : null}
      {activeTab === "security" ? <SecuritySettingsTab /> : null}
      {activeTab === "system" ? <SystemSettingsTab /> : null}
    </>
  );
}
