import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { PROFILE_INFORMATION } from "@/features/profile/constants/profile-content";
import type { PassengerUser } from "@/types/auth";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

const inputClass =
  "mt-1.5 w-full cursor-default rounded-lg border border-white/[0.1] bg-[#161616] px-4 py-3 text-sm text-foreground opacity-90 focus-visible:outline-none";

const soonMessageClass =
  "mt-6 rounded-xl border border-white/[0.08] bg-[#161616] px-4 py-3 text-sm text-muted-foreground";

export function ProfileInformationTab({ user }: { user: PassengerUser }) {
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const email = user.email;

  return (
    <article className={cn(CARD_CLASS, "mt-6 max-w-2xl")} aria-label={PROFILE_INFORMATION.title}>
      <h2 className="text-lg font-semibold text-foreground">{PROFILE_INFORMATION.title}</h2>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="profile-first-name" className="text-sm font-medium text-foreground">
            {PROFILE_INFORMATION.firstName}
          </label>
          <input
            id="profile-first-name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            readOnly
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="profile-last-name" className="text-sm font-medium text-foreground">
            {PROFILE_INFORMATION.lastName}
          </label>
          <input
            id="profile-last-name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            readOnly
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="text-sm font-medium text-foreground">
            {PROFILE_INFORMATION.email}
          </label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={email}
            readOnly
            className={inputClass}
          />
        </div>

        <p className={soonMessageClass} role="status">
          {PROFILE_INFORMATION.editSoonMessage}
        </p>
      </div>
    </article>
  );
}
