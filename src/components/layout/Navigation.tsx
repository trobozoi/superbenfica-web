"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: ROUTES.produtos, label: "Produtos" },
  { href: ROUTES.pedidos, label: "Meus pedidos" },
  { href: ROUTES.perfil, label: "Minha conta" },
] as const;

export function Navigation({ className }: Readonly<{ className?: string }>) {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className={className}>
      <ul className="flex items-center gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
