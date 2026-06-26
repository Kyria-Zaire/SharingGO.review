import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingOutlineButtonClass } from "@/features/home/lib/landing-layout";
import { PROFILE_EDIT_ACTIONS } from "@/features/profile/edit/constants/profile-edit-content";
import { ROUTES } from "@/types/routes";

const soonMessageClass =
  "rounded-xl border border-white/[0.08] bg-[#161616] px-4 py-3 text-sm text-muted-foreground";

export function ProfileEditActions({
  layout,
}: {
  layout: "desktop" | "mobile";
}) {
  if (layout === "desktop") {
    return (
      <div className="mt-8 hidden max-w-2xl lg:block">
        <p className={soonMessageClass} role="status">
          {PROFILE_EDIT_ACTIONS.saveSoonMessage}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button className="min-w-[12rem]" disabled title={PROFILE_EDIT_ACTIONS.saveSoonMessage}>
            {PROFILE_EDIT_ACTIONS.save}
          </Button>
          <Link to={ROUTES.profile} className={landingOutlineButtonClass}>
            {PROFILE_EDIT_ACTIONS.cancel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3 lg:hidden">
      <p className={soonMessageClass} role="status">
        {PROFILE_EDIT_ACTIONS.saveSoonMessage}
      </p>
      <Button className="w-full" disabled title={PROFILE_EDIT_ACTIONS.saveSoonMessage}>
        {PROFILE_EDIT_ACTIONS.save}
      </Button>
      <Link
        to={ROUTES.profile}
        className={cn(landingOutlineButtonClass, "w-full")}
      >
        {PROFILE_EDIT_ACTIONS.cancel}
      </Link>
      <Button variant="destructive" className="w-full" disabled>
        {PROFILE_EDIT_ACTIONS.deleteAccount}
      </Button>
    </div>
  );
}
