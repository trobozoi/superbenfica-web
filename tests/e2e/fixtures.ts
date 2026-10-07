import { expect, type Page } from "@playwright/test";

/**
 * Credenciais da carga inicial da API (python manage.py carga_inicial), lidas de
 * .env.test.local. Nada aqui é versionado com valores reais.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} em .env.test.local (veja .env.test.example).`);
  return value;
}

export interface Credentials {
  email: string;
  password: string;
}

export const credentials = {
  cliente: (): Credentials => ({
    email: required("E2E_CLIENTE_EMAIL"),
    password: required("E2E_CLIENTE_PASSWORD"),
  }),
  staff: (): Credentials => ({
    email: required("E2E_STAFF_EMAIL"),
    password: required("E2E_STAFF_PASSWORD"),
  }),
};

export const AUTH_STATE = "tests/e2e/.auth/cliente.json";
export const CSRF = { "X-Requested-With": "XMLHttpRequest" };

/** Preenche e envia o formulário de login. Cada chamada conta no limite de 5/min da API. */
export async function login(page: Page, { email, password }: Credentials) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

export async function loginAndWait(page: Page, user: Credentials) {
  await login(page, user);
  await expect(page).toHaveURL(/\/produtos/);
  await expect(page.getByRole("heading", { name: "Produtos", level: 1 })).toBeVisible();
}
