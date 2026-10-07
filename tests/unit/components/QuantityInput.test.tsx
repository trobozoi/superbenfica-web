import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuantityInput } from "@/components/cart/QuantityInput";
import { OrderTimeline } from "@/components/orders/OrderStatus";

describe("QuantityInput", () => {
  it("aumenta e diminui pela interface acessível", async () => {
    const onChange = vi.fn();
    render(<QuantityInput label="Quantidade de Arroz" value={2} onChange={onChange} />);

    expect(screen.getByRole("group", { name: "Quantidade de Arroz" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Aumentar quantidade" }));
    await userEvent.click(screen.getByRole("button", { name: "Diminuir quantidade" }));
    expect(onChange.mock.calls).toEqual([[3], [1]]);
  });

  it("respeita o mínimo", () => {
    render(<QuantityInput label="Qtd" value={1} min={1} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Diminuir quantidade" })).toBeDisabled();
  });
});

describe("OrderTimeline", () => {
  it("marca a etapa atual para leitores de tela", () => {
    render(<OrderTimeline status="EM_SEPARACAO" tipoEntrega="RETIRADA" />);
    expect(screen.getByText("(etapa atual)").parentElement).toHaveTextContent("Em separação");
  });

  it("só a entrega em domicílio passa por saiu para entrega", () => {
    const { rerender } = render(<OrderTimeline status="SEPARADO" tipoEntrega="RETIRADA" />);
    expect(screen.getByText("(etapa atual)").parentElement).toHaveTextContent(
      "Pronto para retirada",
    );
    expect(screen.queryByText("Saiu para entrega")).not.toBeInTheDocument();

    rerender(<OrderTimeline status="SAIU_PARA_ENTREGA" tipoEntrega="DOMICILIO" />);
    expect(screen.getByText("Pronto para entrega")).toBeInTheDocument();
    expect(screen.getByText("(etapa atual)").parentElement).toHaveTextContent("Saiu para entrega");
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("mostra aviso em pedido cancelado", () => {
    render(<OrderTimeline status="CANCELADO" tipoEntrega="RETIRADA" />);
    expect(screen.getByText("Este pedido foi cancelado.")).toBeInTheDocument();
  });
});
