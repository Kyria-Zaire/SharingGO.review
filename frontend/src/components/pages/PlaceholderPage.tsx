import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        title={`${title} — bientôt disponible`}
        description="Les tableaux, filtres et actions métier seront livrés dans les prochains tickets F3."
        icon={<Icon className="h-10 w-10" strokeWidth={1.5} />}
      />
    </>
  );
}
