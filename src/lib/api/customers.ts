import { ENDPOINTS } from "@/lib/utils/constants";
import type { EnderecoInput, Paginated } from "@/types/api";
import type { Cliente, EnderecoCliente, Usuario } from "@/types/entities";
import { http } from "./client";

export const customersApi = {
  async me(): Promise<Usuario> {
    const { data } = await http.get<Usuario>(ENDPOINTS.usuarioMe);
    return data;
  },

  /** Para CLIENTE, GET /api/clientes/ devolve apenas o próprio cadastro. */
  async myProfile(): Promise<Cliente | null> {
    const { data } = await http.get<Paginated<Cliente>>(ENDPOINTS.clientes);
    return data.results[0] ?? null;
  },

  async updateProfile(
    id: number,
    input: Partial<Pick<Cliente, "nome" | "telefone" | "loja">>,
  ): Promise<Cliente> {
    const { data } = await http.patch<Cliente>(ENDPOINTS.cliente(id), input);
    return data;
  },

  async addresses(): Promise<EnderecoCliente[]> {
    const { data } = await http.get<Paginated<EnderecoCliente>>(ENDPOINTS.enderecos);
    return data.results;
  },

  async createAddress(input: EnderecoInput): Promise<EnderecoCliente> {
    const { data } = await http.post<EnderecoCliente>(ENDPOINTS.enderecos, input);
    return data;
  },

  async deleteAddress(id: number): Promise<void> {
    await http.delete(ENDPOINTS.endereco(id));
  },
};
