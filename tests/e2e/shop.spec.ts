import { expect, test } from "@playwright/test";

test.describe("Fluxo de compra contra a API real", () => {
  test("catálogo lista produtos reais e filtra por categoria", async ({ page }) => {
    await page.goto("/produtos");
    await expect(page.getByText(/produto\(s\) encontrado\(s\)/)).toBeVisible();
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.getByRole("button", { name: "Bebidas" }).click();
    await expect(page).toHaveURL(/categoria=BEBIDAS/);
    await expect(page.getByRole("article").first()).toContainText("Bebidas");
  });

  test("busca com autocomplete abre o produto", async ({ page }) => {
    await page.goto("/produtos");
    await page.getByRole("combobox", { name: "Buscar produtos" }).fill("água");
    const option = page.getByRole("option").first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(page).toHaveURL(/\/produtos\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/água/i);
  });

  test("carrinho persiste ao recarregar a página", async ({ page }) => {
    await page.goto("/produtos");
    await page
      .getByRole("button", { name: /^Adicionar .* ao carrinho$/ })
      .first()
      .click();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await page.reload();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
  });

  test("cria um pedido real, acompanha e cancela", async ({ page }) => {
    await page.goto("/produtos?categoria=BEBIDAS");
    await page
      .getByRole("button", { name: /^Adicionar .* ao carrinho$/ })
      .first()
      .click();

    await page.goto("/carrinho");
    await page.getByRole("button", { name: "Aumentar quantidade" }).first().click();
    await page.getByRole("link", { name: "Continuar para o pagamento" }).click();

    await expect(page).toHaveURL(/\/checkout/);
    await page.getByLabel("Loja para retirada").selectOption({ label: "Super Benfica Centro" });
    await page.getByText("Pix", { exact: true }).click();
    await page.getByLabel("Observações (opcional)").fill("Pedido de teste E2E (será cancelado)");
    await page.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(page).toHaveURL(/\/pedidos\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Pedido PED-");
    await expect(page.getByText("Pendente").first()).toBeVisible();

    // Limpa o dado criado: o cliente pode cancelar enquanto o pedido está PENDENTE.
    await page.getByRole("button", { name: "Cancelar pedido" }).click();
    await page.getByRole("button", { name: "Sim, cancelar" }).click();
    await expect(page.getByText("Este pedido foi cancelado.")).toBeVisible();

    await page.goto("/pedidos");
    await expect(page.getByRole("link", { name: /PED-/ }).first()).toBeVisible();
  });

  test("entrega em domicílio com endereço preenchido pelo CEP", async ({ page }) => {
    // Número único para achar (e depois excluir) o endereço criado por este teste.
    const numero = `E2E-${Date.now() % 1_000_000}`;

    await page.goto("/perfil");
    await page.getByLabel("CEP").fill("60060170");
    await expect(page.getByLabel("Logradouro")).toHaveValue("Rua São José");
    await expect(page.getByLabel("Bairro")).toHaveValue("Centro");
    await expect(page.getByLabel("Cidade")).toHaveValue("Fortaleza");
    await expect(page.getByLabel("UF")).toHaveValue("CE");
    await page.getByLabel("Número").fill(numero);
    await page.getByRole("button", { name: "Salvar endereço" }).click();
    const excluirEndereco = page.getByRole("button", {
      name: `Excluir endereço Rua São José, ${numero}`,
    });
    await expect(excluirEndereco).toBeVisible();

    await page.goto("/produtos?categoria=BEBIDAS");
    await page
      .getByRole("button", { name: /^Adicionar .* ao carrinho$/ })
      .first()
      .click();
    await page.goto("/checkout");
    await page.getByText("Entrega em domicílio", { exact: true }).click();
    await page.getByText(`Rua São José, ${numero}`).click();
    await page
      .getByLabel("Loja que fará a entrega")
      .selectOption({ label: "Super Benfica Centro" });
    await page.getByText("Pix", { exact: true }).click();
    await page.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(page).toHaveURL(/\/pedidos\/\d+$/);
    await expect(page.getByText(/Entrega em domicílio por Super Benfica Centro/)).toBeVisible();
    // A linha do tempo da entrega inclui a etapa "Saiu para entrega" (a da retirada, não).
    await expect(
      page.getByRole("list", { name: "Andamento do pedido" }).getByText("Saiu para entrega"),
    ).toBeVisible();
    await expect(page.getByText(`Rua São José, ${numero} - Centro, Fortaleza/CE`)).toBeVisible();

    // Limpa os dados criados: cancela o pedido e exclui o endereço.
    await page.getByRole("button", { name: "Cancelar pedido" }).click();
    await page.getByRole("button", { name: "Sim, cancelar" }).click();
    await expect(page.getByText("Este pedido foi cancelado.")).toBeVisible();
    await page.goto("/perfil");
    await excluirEndereco.click();
    await expect(excluirEndereco).toBeHidden();
  });

  test("perfil mostra os dados do cliente", async ({ page }) => {
    await page.goto("/perfil");
    await expect(page.getByText(process.env.E2E_CLIENTE_EMAIL ?? "")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Endereços" })).toBeVisible();
  });
});
