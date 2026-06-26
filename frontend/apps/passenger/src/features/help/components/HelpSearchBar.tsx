import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { HELP_SEARCH } from "@/features/help/constants/help-content";

export function HelpSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={cn(landingCardClass, "bg-[#121212] p-2")}>
      <label htmlFor="help-search" className="sr-only">
        {HELP_SEARCH.label}
      </label>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <input
          id="help-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={HELP_SEARCH.placeholder}
          autoComplete="off"
          className={cn(
            "min-h-touch w-full rounded-xl border border-transparent bg-transparent py-3 pl-11 pr-11 text-sm text-foreground",
            "placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          )}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
