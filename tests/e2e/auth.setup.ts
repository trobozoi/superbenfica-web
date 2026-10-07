import { test as setup } from "@playwright/test";
import { AUTH_STATE, credentials, loginAndWait } from "./fixtures";

/** Login único do cliente demo; os demais testes reaproveitam os cookies salvos. */
setup("login do cliente demo", async ({ page }) => {
  await loginAndWait(page, credentials.cliente());
  await page.context().storageState({ path: AUTH_STATE });
});
