import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { PROFILE_PREFERENCES } from "@/features/profile/constants/profile-content";

const CARD_CLASS = cn(
  landingCardClass,
  "mt-6 max-w-2xl border-white/[0.08] bg-[#121212] p-5 sm:p-8"
);

export function ProfilePreferencesTab() {
  return (
    <article className={CARD_CLASS} aria-label={PROFILE_PREFERENCES.title}>
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#161616] text-primary">
          <SlidersHorizontal className="h-7 w-7" aria-hidden />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-foreground">{PROFILE_PREFERENCES.title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {PROFILE_PREFERENCES.soonIntro}
        </p>

        <div className="mt-6 w-full rounded-xl border border-white/[0.06] bg-[#161616] p-5 text-left">
          <p className="text-sm font-medium text-foreground">{PROFILE_PREFERENCES.soonListTitle}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {PROFILE_PREFERENCES.soonItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
