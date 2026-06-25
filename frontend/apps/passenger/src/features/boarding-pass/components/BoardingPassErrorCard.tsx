import { TimerOff } from "lucide-react";
import { Link } from "react-router-dom";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

export function BoardingPassErrorCard({
  title,
  message,
  backLabel,
  backTo,
}: {
  title: string;
  message: string;
  backLabel: string;
  backTo: string;
}) {
  return (
    <div className={CARD_CLASS}>
      <TimerOff className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Link
        to={backTo}
        className="mt-5 inline-flex min-h-touch items-center justify-center text-sm font-medium text-primary"
      >
        {backLabel}
      </Link>
    </div>
  );
}
