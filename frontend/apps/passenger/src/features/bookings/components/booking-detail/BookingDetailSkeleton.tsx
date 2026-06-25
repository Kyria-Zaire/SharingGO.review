export function BookingDetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement de la réservation">
      <div className="h-24 animate-pulse rounded-2xl bg-[#161616]" />
      <div className="h-48 animate-pulse rounded-2xl bg-[#161616] lg:h-56" />
      <div className="hidden h-52 animate-pulse rounded-2xl bg-[#161616] lg:block" />
      <div className="h-40 animate-pulse rounded-2xl bg-[#161616]" />
    </div>
  );
}
