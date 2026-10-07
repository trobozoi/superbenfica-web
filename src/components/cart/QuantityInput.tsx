import { Minus, Plus } from "lucide-react";
import { MAX_ITEM_QUANTITY } from "@/lib/utils/constants";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  /** Permite chegar a 0 (remove o item). No detalhe do produto o mínimo é 1. */
  min?: number;
}

export function QuantityInput({ value, onChange, label, min = 0 }: Readonly<QuantityInputProps>) {
  const button =
    "inline-flex size-9 items-center justify-center rounded-md hover:bg-accent disabled:opacity-40 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-md border">
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_ITEM_QUANTITY}
        aria-label="Aumentar quantidade"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
