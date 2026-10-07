import axios from "axios";
import { BFF_ROUTES } from "@/lib/utils/constants";
import type { LoginInput, RegistroInput, SessionUser } from "@/types/api";
import { CSRF_HEADER, refreshSession } from "./client";

/**
 * Autenticação via BFF: os tokens ficam em cookies httpOnly definidos pelo servidor Next.
 * As respostas trazem só os dados de exibição do usuário (SessionUser).
 */
export const authApi = {
  async login(input: LoginInput): Promise<SessionUser> {
    const { data } = await axios.post<{ user: SessionUser }>(BFF_ROUTES.login, input, {
      headers: CSRF_HEADER,
    });
    return data.user;
  },

  /** Cria a conta (POST /api/auth/registrar/) e já abre a sessão. */
  async register(input: RegistroInput): Promise<SessionUser> {
    const { data } = await axios.post<{ user: SessionUser }>(BFF_ROUTES.register, input, {
      headers: CSRF_HEADER,
    });
    return data.user;
  },

  async logout(): Promise<void> {
    await axios.post(BFF_ROUTES.logout, null, { headers: CSRF_HEADER }).catch(() => undefined);
  },

  /** Access token para o WebSocket. Renova a sessão uma vez se estiver expirada. */
  async getRealtimeToken(): Promise<string | null> {
    const fetchToken = async () =>
      (await axios.get<{ token: string }>(BFF_ROUTES.wsToken)).data.token;
    try {
      return await fetchToken();
    } catch {
      if (!(await refreshSession())) return null;
      return fetchToken().catch(() => null);
    }
  },
};
