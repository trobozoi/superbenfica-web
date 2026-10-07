import { create } from "zustand";
import type { SessionUser } from "@/types/api";

interface UserState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  clear: () => void;
}

/**
 * Usuário logado (somente dados de exibição). Os tokens NÃO ficam aqui:
 * estão em cookies httpOnly gerenciados pelo servidor Next.
 */
export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
