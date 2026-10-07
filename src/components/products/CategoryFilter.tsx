import { CATEGORIA_LABELS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { CATEGORIAS, type Categoria } from "@/types/entities";

interface CategoryFilterProps {
  value: Categoria | undefined;
  onChange: (categoria: Categoria | undefined) => void;
}

const chip =
  "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function CategoryFilter({ value, onChange }: Readonly<CategoryFilterProps>) {
  const options: { key: string; label: string; categoria: Categoria | undefined }[] = [
    { key: "todas", label: "Todas", categoria: undefined },
    ...CATEGORIAS.map((categoria) => ({
      key: categoria,
      label: CATEGORIA_LABELS[categoria],
      categoria,
    })),
  ];
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Filtrar por categoria</legend>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((option) => {
          const selected = option.categoria === value;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.categoria)}
              className={cn(
                chip,
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-accent",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
