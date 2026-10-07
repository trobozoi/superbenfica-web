import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/components/providers/AppProviders";
import { getServerSession } from "@/lib/server/session";
import "@/styles/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Super Benfica | Supermercado online", template: "%s | Super Benfica" },
  description:
    "Faça suas compras no Super Benfica pelo navegador e retire na loja mais perto de você.",
  applicationName: "Super Benfica",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#16181d" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Ler a sessão (cookie) torna o layout dinâmico: o Next aplica o nonce da CSP
  // gerado em src/proxy.ts aos próprios scripts.
  const user = await getServerSession();

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} flex min-h-dvh flex-col font-sans`}>
        <AppProviders initialUser={user}>
          <Header />
          <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
