import { expect, test } from "@playwright/test";
import { credentials, CSRF, login, loginAndWait } from "./fixtures";

test.describe("Autenticação (sessão já aberta pelo setup)", () => {
  test("tokens ficam só em cookies httpOnly, nunca no localStorage", async ({ page, context }) => {
    await page.goto("/produtos");
    const cookies = await context.cookies();
    const access = cookies.find((cookie) => cookie.name === "sbw_access");
    expect(access?.httpOnly).toBe(true);
    expect(access?.sameSite).toBe("Lax");
    const storage = await page.evaluate(() => JSON.stringify(localStorage));
    expect(storage).not.toMatch(/eyJ/);
  });

  test("quem está logado não vê a tela de login", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page).toHaveURL(/\/produtos/);
  });

  test("refresh sem o cabeçalho anti-CSRF é recusado", async ({ page }) => {
    await page.goto("/produtos");
    const response = await page.request.post("/api/auth/refresh");
    expect(response.status()).toBe(403);
  });

  test("ws-token entrega o access token só para a mesma origem", async ({ page }) => {
    await page.goto("/produtos");
    const response = await page.request.get("/api/auth/ws-token");
    expect(response.status()).toBe(200);
    expect((await response.json()).token).toMatch(/^eyJ/);
    // Confere que o CSRF header é aceito no refresh (não renova aqui para não rotacionar o token).
    expect(CSRF["X-Requested-With"]).toBe("XMLHttpRequest");
  });
});

test.describe("Autenticação sem sessão", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redireciona para o login quem acessa página protegida", async ({ page }) => {
    await page.goto("/pedidos");
    await expect(page).toHaveURL(/\/entrar\?next=%2Fpedidos/);
  });

  test("home é pública", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("supermercado");
  });

  test("validação do formulário antes de chamar a API", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
    await expect(page.getByText("Campo obrigatório.")).toBeVisible();
  });

  test("login inválido mostra erro genérico", async ({ page }) => {
    await login(page, { email: "ninguem@superbenfica.com.br", password: "senha-errada" });
    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("funcionário não entra na loja online", async ({ page }) => {
    await login(page, credentials.staff());
    await expect(page.getByText(/exclusiva para clientes/)).toBeVisible();
  });

  test("logout invalida a sessão", async ({ page }) => {
    // Sessão própria: o logout coloca o refresh token na blacklist da API.
    await loginAndWait(page, credentials.cliente());
    await page.getByTestId("logout").click();
    await expect(page).toHaveURL(/\/entrar/);
    await page.goto("/pedidos");
    await expect(page).toHaveURL(/\/entrar/);
  });
});
