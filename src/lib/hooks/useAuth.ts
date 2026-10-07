"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { authApi } from "@/lib/api/auth";
import { logout as logoutService } from "@/lib/services/auth.service";
import { ROUTES } from "@/lib/utils/constants";
import { useUserStore } from "@/stores/userStore";
import type { LoginInput, RegistroInput } from "@/types/api";

/** Sessão atual + ações de login, cadastro e logout. */
export function useAuth() {
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  const login = useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (sessionUser) => useUserStore.getState().setUser(sessionUser),
  });

  const register = useMutation({
    mutationFn: (input: RegistroInput) => authApi.register(input),
    onSuccess: (sessionUser) => useUserStore.getState().setUser(sessionUser),
  });

  const logout = useMutation({
    mutationFn: () => logoutService(queryClient),
    onSettled: () => {
      router.replace(ROUTES.login);
      router.refresh();
    },
  });

  return { user, isAuthenticated, login, register, logout };
}
