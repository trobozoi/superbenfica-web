# Arquitetura

## Visão geral

```
Navegador ──► Next.js (BFF: route handlers + proxy.ts) ──► API Django REST (/api/...)
    │                                                         │
    └──────────── WebSocket (wss://api/ws/notificacoes/) ◄────┘
```

- O navegador **nunca fala direto com a API REST**. Todas as chamadas vão para `/api/proxy/<recurso>` na própria loja; o servidor Next lê o token do cookie httpOnly, coloca no cabeçalho `Authorization` e repassa para a API (padrão _Backend for Frontend_).
- A única conexão direta com a API é o WebSocket, porque o Django Channels exige `?token=` na URL. O token de vida curta é entregue por `/api/auth/ws-token` (mesma origem) e nunca é guardado.

## Autenticação

1. `/entrar` envia e-mail e senha para `POST /api/auth/login` (BFF).
2. O BFF chama `POST /api/auth/token/` na API, confere se o perfil é `CLIENTE` (funcionários usam o painel) e grava `sbw_access` e `sbw_refresh` em **cookies httpOnly, SameSite=Lax** (e `Secure` em produção). O navegador recebe só os dados de exibição (nome, perfil, loja).
3. Em cada navegação, [src/proxy.ts](../src/proxy.ts) renova o access token expirado usando o refresh e redireciona para `/entrar?next=...` quem não tem sessão nas páginas protegidas.
4. No navegador, um 401 da API faz o interceptor do axios ([src/lib/api/client.ts](../src/lib/api/client.ts)) chamar `/api/auth/refresh` **uma única vez** (single-flight: a API rotaciona o refresh e invalida o anterior) e repetir a requisição.
5. Logout coloca o refresh na blacklist da API, apaga os cookies e limpa carrinho, notificações e cache local.

Cadastro: `/cadastro` chama `POST /api/auth/register` (BFF), que cria a conta em `POST /api/auth/registrar/` e já faz o login.

## Estado e cache

| Dado                        | Onde fica                           | Política                                  |
| --------------------------- | ----------------------------------- | ----------------------------------------- |
| Produtos                    | TanStack Query                      | `staleTime` 5 min, stale-while-revalidate |
| Lojas e formas de pagamento | TanStack Query                      | 10 min                                    |
| Pedidos                     | TanStack Query                      | 30 s + invalidação por WebSocket          |
| Carrinho                    | Zustand + localStorage (`sb_cart`)  | persistente no navegador                  |
| Sessão (exibição)           | Context API + Zustand (`userStore`) | vem do cookie, lido no servidor           |
| Notificações                | Zustand (memória)                   | últimas 30                                |

Erros: as consultas repetem até 3 vezes com backoff exponencial (1 s, 2 s, 4 s), exceto erros 4xx. Ao reconectar a rede, as consultas são refeitas. As mensagens do DRF são normalizadas em [src/lib/api/errors.ts](../src/lib/api/errors.ts) (incluindo erros por campo para os formulários).

## Tempo real

[src/lib/services/socket.service.ts](../src/lib/services/socket.service.ts) conecta em `/ws/notificacoes/`, envia `{"acao":"ping"}` a cada 25 s e reconecta com backoff exponencial (até 30 s). Eventos `pedido.criado` e `pedido.atualizado` invalidam o cache de pedidos (as telas se atualizam sozinhas), aparecem no sino do cabeçalho e geram um toast.

## O que difere do documento original e por quê

| Documento                                                | Implementado                                              | Motivo                                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Endpoints `/api/products/`, `/api/carts/`, `/api/me/`... | `/api/produtos/`, `/api/pedidos/`, `/api/usuarios/me/`... | São as rotas que existem na API (fonte: `/api/schema/`).                                      |
| Tokens no localStorage                                   | Cookies httpOnly via BFF                                  | localStorage é legível por qualquer script; um XSS roubaria a sessão.                         |
| Socket.io-client                                         | WebSocket nativo                                          | O Django Channels fala WebSocket puro; o Socket.io usa protocolo próprio e não conecta.       |
| Jest + Cypress                                           | Vitest + Playwright                                       | Mesma ferramenta do `superbenfica-admin`; mais rápidas e com suporte nativo a TypeScript/ESM. |
| `tailwind.config.js`                                     | Tokens em `src/styles/globals.css`                        | O Tailwind 4 configura o tema no CSS.                                                         |
| Código em `app/`, `components/`... na raiz               | Mesmas pastas dentro de `src/`                            | Separa o código das configurações.                                                            |
| Next.js 14 / React 18                                    | Next.js 16 / React 19                                     | Versões atuais, iguais às do painel administrativo.                                           |

## Pendências que dependem do backend

O frontend está pronto para estas funcionalidades, mas a API ainda não as oferece:

- **Catálogo público:** hoje `GET /api/produtos/`, `/api/lojas/` e `/api/formas-pagamento/` exigem login, então a loja só mostra produtos depois de entrar. Recomendação: permitir leitura anônima desses três recursos (AllowAny em `list`/`retrieve`).
- **Estoque para o cliente:** o perfil CLIENTE não lê `/api/estoques/`. A disponibilidade é validada na criação do pedido (409 em falta de estoque, já tratado no checkout).
- **Carrinho no servidor** (sincronização entre dispositivos): não existe `/api/carts/`. O carrinho fica no navegador.
- **Cupons, promoções, frete e gateway de pagamento:** sem endpoints. O pagamento é feito na retirada ou na entrega, e a entrega em domicílio não tem taxa. Quando houver gateway, os dados de cartão devem ir direto para o SDK dele (escopo PCI-DSS), nunca passar por este frontend.

## Roteiro (fases do documento)

- [x] Fase 1: Next.js + TypeScript + Tailwind, variáveis de ambiente, CI com SonarQube
- [x] Fase 2 (parcial): login, cadastro, perfil, endereços, rotas protegidas
- [x] Fase 3 (parcial): catálogo paginado, filtro por categoria, busca com autocomplete, detalhe
- [x] Fase 4 (parcial): carrinho persistente, checkout com retirada na loja ou entrega em domicílio (`tipo_entrega` + endereço do perfil, copiado para o pedido pela API)
- [x] Fase 6 (parcial): histórico, status em tempo real, cancelamento, pedir novamente
- [ ] Fases 5 e 7: pagamentos, cupons e promoções (dependem do backend)
- [ ] Fase 9: Sentry (ponto de integração em `src/app/error.tsx`), analytics, Storybook
