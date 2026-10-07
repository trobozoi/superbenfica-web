"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";

/**
 * Limite de erro das páginas. Mostra uma mensagem amigável sem detalhes técnicos.
 * Ponto de integração com o Sentry (Fase 9): Sentry.captureException(error).
 */
export default function ErrorPage({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      title="Algo deu errado"
      description="Não foi possível carregar esta página. Tente novamente em instantes."
      action={<Button onClick={reset}>Tentar novamente</Button>}
    />
  );
}
