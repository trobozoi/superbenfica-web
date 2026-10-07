import { describe, expect, it, vi } from "vitest";
import { parsePublicEnv, parseServerEnv, trimTrailingSlash } from "@/lib/env";
import { cn } from "@/lib/utils/cn";
import { mediaSrc } from "@/lib/utils/media";
import { singleFlight } from "@/lib/utils/single-flight";

describe("env", () => {
  it("remove barras finais", () => {
    expect(trimTrailingSlash("http://api///")).toBe("http://api");
  });

  it("valida as variáveis públicas e do servidor", () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_WS_URL: "wss://api.x.com/" })).toEqual({
      NEXT_PUBLIC_WS_URL: "wss://api.x.com",
      NEXT_PUBLIC_APP_ENV: "development",
    });
    expect(parseServerEnv({ API_URL: "https://api.x.com/" }).API_URL).toBe("https://api.x.com");
  });

  it("falha com mensagem clara quando falta variável ou o protocolo é errado", () => {
    expect(() => parseServerEnv({})).toThrow(/API_URL/);
    expect(() => parsePublicEnv({ NEXT_PUBLIC_WS_URL: "http://x" })).toThrow(/NEXT_PUBLIC_WS_URL/);
  });
});

describe("mediaSrc", () => {
  it("converte a URL da API para a rota da loja", () => {
    expect(mediaSrc("http://127.0.0.1:8000/media/produtos/a.webp")).toBe(
      "/api/media/produtos/a.webp",
    );
    expect(mediaSrc("/media/produtos/b.webp?x=1")).toBe("/api/media/produtos/b.webp");
  });

  it("ignora valores vazios, inválidos ou fora de /media/", () => {
    expect(mediaSrc(null)).toBeNull();
    expect(mediaSrc("nao e url")).toBeNull();
    expect(mediaSrc("http://x.com/outro/a.webp")).toBeNull();
  });
});

describe("singleFlight", () => {
  it("compartilha a mesma promise entre chamadas simultâneas e libera depois", async () => {
    const task = vi.fn().mockResolvedValue("ok");
    const run = singleFlight(task);
    const [a, b] = await Promise.all([run(), run()]);
    expect([a, b]).toEqual(["ok", "ok"]);
    expect(task).toHaveBeenCalledTimes(1);
    await run();
    expect(task).toHaveBeenCalledTimes(2);
  });
});

describe("cn", () => {
  it("resolve conflitos de classes Tailwind", () => {
    expect(cn("px-2", { hidden: false }, "px-4")).toBe("px-4");
  });
});
