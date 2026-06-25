export function BoardingPassSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement de votre billet">
      <div className="h-16 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-[28rem] animate-pulse rounded-2xl bg-muted" />
        <div className="hidden h-80 animate-pulse rounded-2xl bg-muted lg:block" />
      </div>
      <div className="h-32 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
