"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Modal sobre o elemento nativo <dialog> (showModal): o navegador já cuida do foco preso
 * dentro do modal, da tecla Esc e do conteúdo de fundo inerte. Sem dependências extras.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: Readonly<ModalProps>) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border bg-card p-0 text-card-foreground shadow-lg backdrop:bg-black/50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
          <X />
        </Button>
      </div>
      <div className="px-5 pb-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t p-4">{footer}</div>}
    </dialog>
  );
}
