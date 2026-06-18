import { cn } from "@/lib/cn";

export interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ id, title, description, className }: SectionHeadingProps) {
  return (
    <header className={cn("mb-5", className)}>
      {id ? (
        <h2 id={id} className="scroll-mt-20 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
      ) : (
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
      )}
      {description ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
