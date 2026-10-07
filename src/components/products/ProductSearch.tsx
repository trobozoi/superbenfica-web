"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useId, useState } from "react";
import { Input } from "@/components/ui/Input";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useProductSuggestions } from "@/lib/hooks/useProducts";
import { ROUTES } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/format";

interface ProductSearchProps {
  initialValue?: string;
  /** Busca confirmada (Enter / botão): filtra o catálogo. */
  onSearch: (term: string) => void;
}

/**
 * Busca com autocomplete no padrão ARIA "combobox": setas navegam pelas sugestões,
 * Enter abre o produto destacado (ou busca o termo), Esc fecha a lista.
 */
export function ProductSearch({ initialValue = "", onSearch }: Readonly<ProductSearchProps>) {
  const router = useRouter();
  const listId = useId();
  const [term, setTerm] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebouncedValue(term, 250);
  const { data: suggestions = [] } = useProductSuggestions(debounced);
  const showList = open && suggestions.length > 0 && term.trim().length >= 2;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const chosen = active >= 0 ? suggestions[active] : undefined;
    setOpen(false);
    if (chosen) router.push(ROUTES.produto(chosen.id));
    else onSearch(term.trim());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, -1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Buscar produtos
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        placeholder="Buscar por nome, marca ou código de barras"
        autoComplete="off"
        maxLength={100}
        value={term}
        onChange={(event) => {
          setTerm(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="pl-9"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sugestões"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border bg-card shadow-lg"
        >
          {suggestions.map((produto, index) => (
            <li
              key={produto.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className="flex cursor-pointer justify-between gap-2 px-3 py-2 text-sm aria-selected:bg-accent"
              onMouseDown={(event) => {
                event.preventDefault();
                router.push(ROUTES.produto(produto.id));
              }}
              onMouseEnter={() => setActive(index)}
            >
              <span className="truncate">{produto.nome}</span>
              <span className="shrink-0 font-medium">{formatCurrency(produto.preco)}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
