"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { type ReactNode, useState } from "react";

const MAX_RETRIES = 3;

/** Não repete erros do cliente (4xx): repetir não muda o resultado. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < MAX_RETRIES;
}

/** Backoff exponencial entre tentativas: 1s, 2s, 4s... (máximo 10s). */
function retryDelay(attempt: number): number {
  return Math.min(10_000, 1_000 * 2 ** attempt);
}

export function QueryProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // stale-while-revalidate: mostra o cache e atualiza em segundo plano.
            staleTime: 30_000,
            retry: shouldRetry,
            retryDelay,
            refetchOnWindowFocus: true,
            // Ao voltar a conexão, refaz as consultas pendentes.
            refetchOnReconnect: true,
          },
          mutations: { retry: false },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
