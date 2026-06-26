import {
  Bell,
  Info,
  Lock,
  Settings2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { SETTINGS_TAB_LABELS } from "@/features/settings/constants/settings-content";
import { SETTINGS_TABS, type SettingsTab } from "@/features/settings/lib/settings-tabs";

const TAB_ICONS = {
  general: Settings2,
  notifications: Bell,
  privacy: Shield,
  security: Lock,
  about: Info,
} as const;

export function SettingsTabs({
  value,
  onChange,
}: {
  value: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  return (
    <div
      className="flex gap-6 overflow-x-auto border-b border-white/[0.08] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Sections des paramètres"
    >
      {SETTINGS_TABS.map((tab) => {
        const isActive = value === tab;
        const Icon = TAB_ICONS[tab];

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative flex min-h-touch shrink-0 items-center gap-2 pb-3 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(tab)}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {SETTINGS_TAB_LABELS[tab]}
            {isActive ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
