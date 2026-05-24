import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export type BadgeVariant = "default" | "success" | "warning" | "destructive" | "muted";

export interface PagePlaceholderProps {
  title: string;
  description: string;
  children?: ReactNode;
}
