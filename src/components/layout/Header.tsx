"use client";

import { LogOut, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { CartDropdown } from "@/components/cart/CartDropdown";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { ROUTES } from "@/lib/utils/constants";
import { Navigation } from "./Navigation";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          href={isAuthenticated ? ROUTES.produtos : ROUTES.home}
          className="flex items-center gap-2 font-bold text-primary"
        >
          <ShoppingBasket className="size-6" aria-hidden="true" />
          <span>Super Benfica</span>
        </Link>

        {isAuthenticated && <Navigation className="hidden md:block" />}

        <div className="ml-auto flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted-foreground lg:inline">
                Olá, {user?.nome.split(" ")[0]}
              </span>
              <NotificationBell />
              <CartDropdown />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sair"
                title="Sair"
                onClick={() => logout.mutate()}
                loading={logout.isPending}
                data-testid="logout"
              >
                {!logout.isPending && <LogOut />}
              </Button>
            </>
          ) : (
            <>
              <Link href={ROUTES.login} className={buttonVariants({ variant: "ghost" })}>
                Entrar
              </Link>
              <Link href={ROUTES.register} className={buttonVariants()}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
      {isAuthenticated && <Navigation className="overflow-x-auto border-t px-2 md:hidden" />}
    </header>
  );
}
