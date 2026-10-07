import { create } from "zustand";
import type { ConnectionStatus } from "@/types/realtime";

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  /** Rota interna para abrir ao clicar (ex.: /pedidos/12). */
  href?: string;
  createdAt: number;
  read: boolean;
}

const MAX_NOTIFICATIONS = 30;

interface NotificationState {
  items: AppNotification[];
  connection: ConnectionStatus;
  push: (notification: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  setConnection: (status: ConnectionStatus) => void;
  clear: () => void;
}

/** Notificações em tempo real (eventos do WebSocket), mantidas só em memória. */
export const useNotificationStore = create<NotificationState>()((set) => ({
  items: [],
  connection: "idle",
  push: (notification) =>
    set((state) => ({
      items: [
        { ...notification, id: crypto.randomUUID(), createdAt: Date.now(), read: false },
        ...state.items,
      ].slice(0, MAX_NOTIFICATIONS),
    })),
  markAllRead: () =>
    set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) })),
  setConnection: (connection) => set({ connection }),
  clear: () => set({ items: [], connection: "idle" }),
}));

export function unreadCount(items: readonly AppNotification[]): number {
  return items.filter((item) => !item.read).length;
}
