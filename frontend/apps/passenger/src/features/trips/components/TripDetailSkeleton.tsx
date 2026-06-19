import { Card } from "@/components/ui/Card";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} aria-hidden />;
}

export function TripDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement du trajet">
      <SkeletonBlock className="mb-2 h-3 w-24" />
      <SkeletonBlock className="mb-4 h-8 w-full max-w-xs" />
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        <Card className="p-4">
          <SkeletonBlock className="mb-4 h-4 w-20" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
          </div>
        </Card>
        <Card className="p-4">
          <SkeletonBlock className="mb-4 h-4 w-16" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
          </div>
        </Card>
        <Card className="p-4">
          <SkeletonBlock className="h-12 w-16" />
        </Card>
        <Card className="p-4">
          <SkeletonBlock className="mb-2 h-4 w-24" />
          <SkeletonBlock className="h-8 w-full" />
        </Card>
      </div>
    </div>
  );
}
