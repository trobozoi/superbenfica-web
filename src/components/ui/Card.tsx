import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: Readonly<ComponentProps<"div">>) {
  return (
    <div
      className={cn("rounded-xl border bg-card text-card-foreground shadow-xs", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: Readonly<ComponentProps<"div">>) {
  return <div className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, children, ...props }: Readonly<ComponentProps<"h2">>) {
  return (
    <h2 className={cn("text-lg leading-tight font-semibold", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({ className, ...props }: Readonly<ComponentProps<"p">>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: Readonly<ComponentProps<"div">>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: Readonly<ComponentProps<"div">>) {
  return <div className={cn("flex items-center gap-2 p-5 pt-0", className)} {...props} />;
}
