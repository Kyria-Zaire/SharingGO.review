import { Button } from "@/components/ui/Button";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
  loadedCount: number;
  total?: number;
}

export function LoadMoreButton({
  onClick,
  isLoading,
  hasMore,
  loadedCount,
  total,
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <Button variant="secondary" onClick={onClick} isLoading={isLoading} disabled={isLoading}>
        Charger plus
      </Button>
      {total !== undefined ? (
        <p className="text-xs text-muted-foreground">
          {loadedCount} / {total} événements affichés
        </p>
      ) : null}
    </div>
  );
}
