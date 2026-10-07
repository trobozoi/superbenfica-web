"use client";

import { type ReactNode, useEffect } from "react";
import { Toaster } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import type { SessionUser } from "@/types/api";
import { AuthProvider } from "./AuthProvider";
import { QueryProvider } from "./QueryProvider";
import { RealtimeProvider } from "./RealtimeProvider";

interface AppProvidersProps {
  initialUser: SessionUser | null;
  children: ReactNode;
}

/** Carrega o carrinho do localStorage só no navegador, depois da hidratação do React. */
function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
  return null;
}

export function AppProviders({ initialUser, children }: Readonly<AppProvidersProps>) {
  return (
    <QueryProvider>
      <AuthProvider initialUser={initialUser}>
        <RealtimeProvider>
          <CartHydrator />
          {children}
          <Toaster richColors closeButton position="top-right" />
        </RealtimeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
