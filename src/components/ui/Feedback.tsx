import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Placeholder animado enquanto os dados carregam. */
export function Skeleton({ className, ...props }: Readonly<ComponentProps<"div">>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: Readonly<EmptyStateProps>) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      {icon && <div className="text-muted-foreground [&_svg]:size-10">{icon}</div>}
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorMessage({ message }: Readonly<{ message: string }>) {
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "bg-muted text-foreground",
  info: "bg-info/15 text-info",
  warning: "bg-warning/20 text-foreground",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/15 text-destructive",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: Readonly<ComponentProps<"span"> & { tone?: BadgeTone }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        BADGE_TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
