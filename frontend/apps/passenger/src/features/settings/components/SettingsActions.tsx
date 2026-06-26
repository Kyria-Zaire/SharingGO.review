import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingOutlineButtonClass } from "@/features/home/lib/landing-layout";
import { SETTINGS_ACTIONS } from "@/features/settings/constants/settings-content";
import { settingsSoonMessageClass } from "@/features/settings/lib/settings-form";
import { ROUTES } from "@/types/routes";

export function SettingsActions({ layout }: { layout: "desktop" | "mobile" }) {
  if (layout === "desktop") {
    return (
      <div className="mt-8 hidden lg:block">
        <p className={settingsSoonMessageClass} role="status">
          {SETTINGS_ACTIONS.saveSoonMessage}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to={ROUTES.home} className={landingOutlineButtonClass}>
            {SETTINGS_ACTIONS.cancel}
          </Link>
          <Button disabled title={SETTINGS_ACTIONS.saveSoonMessage}>
            {SETTINGS_ACTIONS.save}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3 lg:hidden">
      <p className={settingsSoonMessageClass} role="status">
        {SETTINGS_ACTIONS.saveSoonMessage}
      </p>
      <Button className="w-full" disabled title={SETTINGS_ACTIONS.saveSoonMessage}>
        {SETTINGS_ACTIONS.save}
      </Button>
      <Link to={ROUTES.home} className={cn(landingOutlineButtonClass, "w-full")}>
        {SETTINGS_ACTIONS.cancel}
      </Link>
    </div>
  );
}
