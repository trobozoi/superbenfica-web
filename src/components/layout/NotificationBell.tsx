"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { formatDateTime } from "@/lib/utils/format";
import { unreadCount, useNotificationStore } from "@/stores/notificationStore";
import { Popover } from "./Popover";

/** Sino com as atualizações de pedidos recebidas pelo WebSocket. */
export function NotificationBell() {
  const items = useNotificationStore((state) => state.items);
  const connection = useNotificationStore((state) => state.connection);
  const unread = unreadCount(items);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) useNotificationStore.getState().markAllRead();
  }, []);

  return (
    <Popover
      triggerLabel={unread > 0 ? `Notificações (${unread} novas)` : "Notificações"}
      onOpenChange={handleOpenChange}
      trigger={
        <>
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          )}
        </>
      }
    >
      {(close) => (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Notificações</h2>
            <span className="text-xs text-muted-foreground">
              {connection === "open" ? "Tempo real ativo" : "Reconectando…"}
            </span>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              As atualizações dos seus pedidos aparecem aqui.
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href ?? "#"}
                    onClick={close}
                    className="block rounded-md p-2 text-sm hover:bg-accent"
                  >
                    <span className={item.read ? "" : "font-semibold"}>{item.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDateTime(new Date(item.createdAt).toISOString())}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Popover>
  );
}
