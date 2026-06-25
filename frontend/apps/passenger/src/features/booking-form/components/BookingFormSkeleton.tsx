export function BookingFormSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement du formulaire">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          <div className="h-56 animate-pulse rounded-2xl bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="hidden h-80 animate-pulse rounded-2xl bg-muted lg:block" />
      </div>
    </div>
  );
}
