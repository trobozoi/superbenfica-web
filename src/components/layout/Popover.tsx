"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface PopoverProps {
  /** Conteúdo do botão que abre o painel. */
  trigger: ReactNode;
  triggerLabel: string;
  children: (close: () => void) => ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

/** Painel suspenso simples e acessível: fecha com Esc, clique fora ou ao navegar. */
export function Popover({
  trigger,
  triggerLabel,
  children,
  className,
  onOpenChange,
}: Readonly<PopoverProps>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const toggle = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => toggle(!open)}
        className="relative inline-flex size-10 items-center justify-center rounded-md transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {trigger}
      </button>
      {open && (
        <div
          id={panelId}
          className={cn(
            "absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border bg-card p-4 text-card-foreground shadow-lg",
            className,
          )}
        >
          {children(() => toggle(false))}
        </div>
      )}
    </div>
  );
}
