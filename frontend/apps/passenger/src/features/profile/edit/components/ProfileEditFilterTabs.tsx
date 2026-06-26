import { Bell, CreditCard, Shield, UserCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { PROFILE_EDIT_TAB_LABELS } from "@/features/profile/edit/constants/profile-edit-content";
import {
  PROFILE_EDIT_TABS,
  type ProfileEditTab,
} from "@/features/profile/edit/lib/profile-edit-tabs";

const TAB_ICONS = {
  information: UserCircle,
  payment: CreditCard,
  preferences: Bell,
  security: Shield,
} as const;

export function ProfileEditFilterTabs({
  value,
  onChange,
}: {
  value: ProfileEditTab;
  onChange: (tab: ProfileEditTab) => void;
}) {
  return (
    <div
      className="flex gap-6 overflow-x-auto border-b border-white/[0.08] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Sections d'édition du profil"
    >
      {PROFILE_EDIT_TABS.map((tab) => {
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
            {PROFILE_EDIT_TAB_LABELS[tab]}
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
