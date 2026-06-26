import { Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { PROFILE_PREFERENCES } from "@/features/profile/constants/profile-content";

const CARD_CLASS = cn(
  landingCardClass,
  "mt-6 max-w-2xl border-white/[0.08] bg-[#121212] p-5 sm:p-6"
);

export function ProfilePreferencesTab() {
  return (
    <article className={CARD_CLASS} aria-label={PROFILE_PREFERENCES.title}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <Settings2 className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{PROFILE_PREFERENCES.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {PROFILE_PREFERENCES.comingSoonIntro}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#161616] p-5">
        <p className="text-sm font-medium text-foreground">
          {PROFILE_PREFERENCES.comingSoonListTitle}
        </p>
        <ul className="mt-3 space-y-2">
          {PROFILE_PREFERENCES.comingSoonItems.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary" aria-hidden>
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
