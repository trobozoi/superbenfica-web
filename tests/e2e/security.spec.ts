import { expect, test } from "@playwright/test";
import { CSRF } from "./fixtures";

test.describe("Configurações de segurança", () => {
  test("páginas trazem CSP com nonce e headers de proteção", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+'/);
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("proxy recusa recursos fora da lista permitida e path traversal", async ({ page }) => {
    await page.goto("/produtos");
    expect((await page.request.get("/api/proxy/relatorios/vendas")).status()).toBe(404);
    expect((await page.request.get("/api/proxy/estoques")).status()).toBe(404);
    expect((await page.request.get("/api/proxy/produtos/..%2F..%2Fadmin")).status()).toBe(404);
  });

  test("proxy exige o cabeçalho anti-CSRF em escritas", async ({ page }) => {
    await page.goto("/produtos");
    const semHeader = await page.request.post("/api/proxy/enderecos", { data: {} });
    expect(semHeader.status()).toBe(403);
    const outraOrigem = await page.request.post("/api/proxy/enderecos", {
      data: {},
      headers: { ...CSRF, Origin: "https://malicioso.example" },
    });
    expect(outraOrigem.status()).toBe(403);
  });

  test("proxy encaminha leituras permitidas com o token do cookie", async ({ page }) => {
    await page.goto("/produtos");
    const response = await page.request.get("/api/proxy/usuarios/me");
    expect(response.status()).toBe(200);
    expect((await response.json()).role).toBe("CLIENTE");
  });
});
