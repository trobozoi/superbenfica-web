import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  backoffDelay,
  parseRealtimeMessage,
  RealtimeClient,
  WS_CLOSE_CODES,
} from "@/lib/services/socket.service";
import type { ConnectionStatus } from "@/types/realtime";

/** WebSocket falso: os testes disparam open/message/close manualmente. */
class FakeSocket {
  static readonly OPEN = 1;
  readyState = 0;
  sent: string[] = [];
  closedWith: number | null = null;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;

  constructor(readonly url: string) {}

  send(data: string) {
    this.sent.push(data);
  }
  close(code: number) {
    this.closedWith = code;
  }
  open() {
    this.readyState = FakeSocket.OPEN;
    this.onopen?.();
  }
}

describe("socket.service", () => {
  let sockets: FakeSocket[];
  let statuses: ConnectionStatus[];

  const createClient = (getToken = vi.fn().mockResolvedValue("tok en")) => {
    const onMessage = vi.fn();
    const client = new RealtimeClient({
      url: "ws://api/ws/notificacoes/",
      getToken,
      onMessage,
      onStatusChange: (status) => statuses.push(status),
      createSocket: (url) => {
        const socket = new FakeSocket(url);
        sockets.push(socket);
        return socket as unknown as WebSocket;
      },
      heartbeatMs: 1_000,
      baseDelayMs: 100,
      maxDelayMs: 1_000,
    });
    return { client, onMessage, getToken };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", FakeSocket);
    sockets = [];
    statuses = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("calcula backoff exponencial limitado", () => {
    expect([0, 1, 2, 10].map((n) => backoffDelay(n, 100, 1_000))).toEqual([100, 200, 400, 1_000]);
    expect(backoffDelay(-1, 100, 1_000)).toBe(100);
  });

  it("aceita só mensagens JSON com eventos conhecidos", () => {
    const valid =
      '{"evento":"pedido.atualizado","dados":{"pedido_id":1,"codigo":"PED-1","status":"SEPARADO","tipo_entrega":"RETIRADA"}}';
    expect(parseRealtimeMessage(valid)?.evento).toBe("pedido.atualizado");
    expect(parseRealtimeMessage('{"evento":"desconhecido"}')).toBeNull();
    expect(parseRealtimeMessage("não é json")).toBeNull();
    expect(parseRealtimeMessage("null")).toBeNull();
    expect(parseRealtimeMessage(42)).toBeNull();
  });

  it("conecta com o token na URL, repassa eventos e envia ping", async () => {
    const { client, onMessage } = createClient();
    await client.connect();
    const socket = sockets[0];
    expect(socket?.url).toBe("ws://api/ws/notificacoes/?token=tok%20en");

    socket?.open();
    expect(statuses).toEqual(["connecting", "open"]);

    socket?.onmessage?.({ data: '{"evento":"pong","dados":{}}' });
    socket?.onmessage?.({
      data: '{"evento":"pedido.criado","dados":{"pedido_id":2,"codigo":"PED-2","status":"PENDENTE"}}',
    });
    expect(onMessage).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1_000);
    expect(socket?.sent).toEqual(['{"acao":"ping"}']);
    client.disconnect();
    expect(socket?.closedWith).toBe(WS_CLOSE_CODES.normal);
    expect(statuses.at(-1)).toBe("closed");
  });

  it("reconecta com backoff após queda e quando o token expira (4401)", async () => {
    const { client, getToken } = createClient();
    await client.connect();
    sockets[0]?.onclose?.({ code: 1006 });
    expect(statuses.at(-1)).toBe("reconnecting");

    await vi.advanceTimersByTimeAsync(100);
    expect(getToken).toHaveBeenCalledTimes(2);
    sockets[1]?.onclose?.({ code: WS_CLOSE_CODES.unauthenticated });
    await vi.advanceTimersByTimeAsync(200);
    expect(sockets).toHaveLength(3);
    client.disconnect();
  });

  it("não reconecta em fechamento normal ou sem permissão (4403)", async () => {
    const { client } = createClient();
    await client.connect();
    sockets[0]?.onclose?.({ code: WS_CLOSE_CODES.forbidden });
    await vi.advanceTimersByTimeAsync(5_000);
    expect(sockets).toHaveLength(1);
    expect(statuses.at(-1)).toBe("closed");
    client.disconnect();
  });

  it("fica fechado quando não há sessão", async () => {
    const { client } = createClient(vi.fn().mockResolvedValue(null));
    await client.connect();
    expect(sockets).toHaveLength(0);
    expect(statuses.at(-1)).toBe("closed");
  });

  it("não abre socket se for desconectado enquanto busca o token", async () => {
    const pending: { resolve?: (value: string) => void } = {};
    const { client } = createClient(
      vi.fn(
        () =>
          new Promise<string>((resolve) => {
            pending.resolve = resolve;
          }),
      ),
    );
    const connecting = client.connect();
    client.disconnect();
    pending.resolve?.("tok");
    await connecting;
    expect(sockets).toHaveLength(0);
  });
});
