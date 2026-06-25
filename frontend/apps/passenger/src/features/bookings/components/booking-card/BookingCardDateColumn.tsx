import { cn } from "@/lib/cn";
import { formatBookingCardDateParts } from "@/features/bookings/lib/booking-card-format";

export function BookingCardDateColumn({
  departureTime,
  highlightTime = true,
  dense = false,
  className,
}: {
  departureTime: string;
  highlightTime?: boolean;
  dense?: boolean;
  className?: string;
}) {
  const parts = formatBookingCardDateParts(departureTime);

  return (
    <div className={cn("flex shrink-0 flex-col items-center text-center", className)}>
      <span className="text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {parts.weekday}
      </span>
      <span
        className={cn(
          "mt-0.5 font-bold leading-none text-foreground",
          dense
            ? "text-[1.75rem] lg:text-[1.5rem]"
            : "text-[1.75rem] lg:text-[2rem]"
        )}
      >
        {parts.day}
      </span>
      <span className="mt-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {parts.month}
      </span>
      <span
        className={cn(
          "text-sm font-bold",
          dense ? "mt-2 lg:mt-2" : "mt-3 lg:mt-4",
          highlightTime ? "text-primary" : "text-foreground"
        )}
      >
        {parts.time}
      </span>
    </div>
  );
}
