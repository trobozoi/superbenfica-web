"use client";

import { useEffect, useState } from "react";

/** Atrasa a atualização de um valor (ex.: busca enquanto digita) para poupar requisições. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
