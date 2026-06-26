import { cn } from "@/lib/cn";

export function ProfileEditToggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-[#161616] p-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition-colors",
          checked
            ? "justify-end border-primary bg-primary"
            : "justify-start border-white/15 bg-white/10"
        )}
      >
        <span
          className="h-5 w-5 shrink-0 rounded-full bg-white shadow-sm"
          aria-hidden
        />
      </button>
    </div>
  );
}
