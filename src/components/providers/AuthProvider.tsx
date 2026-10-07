"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { setSessionExpiredHandler } from "@/lib/api/client";
import { resetLocalState } from "@/lib/services/auth.service";
import { ROUTES } from "@/lib/utils/constants";
import { useUserStore } from "@/stores/userStore";
import type { SessionUser } from "@/types/api";

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, isAuthenticated: false });

interface AuthProviderProps {
  /** Sessão lida no servidor (cookie), evita um carregamento extra no cliente. */
  initialUser: SessionUser | null;
  children: ReactNode;
}

/**
 * Context API para a sessão (conforme a arquitetura) apoiado no userStore (Zustand),
 * que também é acessível fora de componentes (ex.: no logout).
 */
export function AuthProvider({ initialUser, children }: Readonly<AuthProviderProps>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  // Hidrata o store antes da primeira renderização dos filhos (inicializador roda uma vez).
  useState(() => {
    useUserStore.setState({ user: initialUser });
    return true;
  });

  useEffect(() => {
    useUserStore.getState().setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      resetLocalState(queryClient);
      router.replace(`${ROUTES.login}?expired=1`);
    });
  }, [queryClient, router]);

  const value = useMemo(() => ({ user, isAuthenticated: user !== null }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}
