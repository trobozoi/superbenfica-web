# Segurança e SonarQube

## Controles implementados

| Risco                         | Controle                                                                                                                     | Onde                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Roubo de sessão por XSS       | Tokens só em cookies `httpOnly`; o JavaScript da página nunca vê o refresh token                                             | [src/lib/server/auth-cookies.ts](../src/lib/server/auth-cookies.ts)                 |
| XSS                           | CSP com nonce por requisição e `strict-dynamic`; React escapa o conteúdo; `react/no-danger` proíbe `dangerouslySetInnerHTML` | [src/proxy.ts](../src/proxy.ts), [eslint.config.mjs](../eslint.config.mjs)          |
| CSRF                          | `SameSite=Lax` + checagem de `Origin` + cabeçalho `X-Requested-With` obrigatório em escritas                                 | [src/lib/server/csrf.ts](../src/lib/server/csrf.ts)                                 |
| Clickjacking                  | `X-Frame-Options: DENY` e `frame-ancestors 'none'`                                                                           | [next.config.ts](../next.config.ts)                                                 |
| Proxy aberto / path traversal | O BFF só encaminha recursos de uma lista permitida e segmentos `[\w-]+`; corpo limitado a 256 KB                             | [src/app/api/proxy/[...path]/route.ts](../src/app/api/proxy/[...path]/route.ts)     |
| Open redirect                 | `?next=` aceita só caminhos internos                                                                                         | `safeRedirectPath` em [src/lib/utils/validation.ts](../src/lib/utils/validation.ts) |
| Enumeração de contas          | Mensagem genérica "E-mail ou senha incorretos."                                                                              | [src/components/auth/LoginForm.tsx](../src/components/auth/LoginForm.tsx)           |
| Vazamento de erros internos   | Erros 5xx da API viram mensagem genérica (502)                                                                               | `upstreamError` em [src/lib/server/django.ts](../src/lib/server/django.ts)          |
| Força bruta                   | Rate limit da API (login 5/min, cadastro 10/h); o 429 é exibido ao usuário                                                   | API + [src/lib/api/errors.ts](../src/lib/api/errors.ts)                             |
| Transporte                    | HSTS e `upgrade-insecure-requests` em produção; cookies `Secure`                                                             | [next.config.ts](../next.config.ts), [src/proxy.ts](../src/proxy.ts)                |
| Segredos no repositório       | `.env*` ignorados no git; só `.env.example` (sem segredos) é versionado; URL da API só no servidor                           | [.gitignore](../.gitignore)                                                         |
| LGPD                          | Logout apaga carrinho, notificações e cache; nenhum dado pessoal no localStorage além do carrinho                            | [src/lib/services/auth.service.ts](../src/lib/services/auth.service.ts)             |
| Autorização                   | O JWT é só decodificado para a interface; quem autoriza é a API a cada requisição                                            | [src/lib/utils/jwt.ts](../src/lib/utils/jwt.ts)                                     |

## SonarQube

As regras do perfil **Sonar way** rodam antes do código chegar ao SonarQube:

- **No editor e no commit:** `eslint-plugin-sonarjs` (as mesmas regras do analisador JS/TS do Sonar) + `typescript-eslint` strict + `jsx-a11y`. Ajustes: complexidade cognitiva máxima 15, sem `any`, sem non-null assertion, `eqeqeq`, sem `console.log`.
- **No CI:** [.github/workflows/ci.yml](../.github/workflows/ci.yml) roda typecheck, lint, Prettier, testes com cobertura e build, depois envia para o SonarQube Cloud e **falha se o Quality Gate não passar**. Configure o secret `SONAR_TOKEN` no repositório.
- **Configuração:** [sonar-project.properties](../sonar-project.properties) (organização `trobozoi`, projeto `trobozoi_superbenfica-web`).
- **Cobertura:** limite mínimo de 80% em linhas, funções e statements e 75% em branches, para a lógica (`src/lib`, `src/stores`). Páginas, componentes visuais e código só de servidor são cobertos pelos testes E2E, que não geram lcov, por isso estão em `sonar.coverage.exclusions`.

### Security Hotspots para revisão manual

| Hotspot                                     | Por que é seguro                                                                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `style-src 'unsafe-inline'` na CSP          | Bibliotecas (sonner) aplicam atributo `style`, que não aceita nonce. Scripts continuam restritos por nonce.                                          |
| `'unsafe-eval'` e `ws:` na CSP              | Só em desenvolvimento (React DevTools e extensões do editor); removidos quando `NEXT_PUBLIC_APP_ENV=production`.                                     |
| `https://viacep.com.br` no `connect-src`    | Consulta de CEP feita pelo navegador. Só leitura de dados públicos: nenhum cookie ou token é enviado, e a resposta só preenche campos do formulário. |
| `/api/auth/ws-token` devolve o access token | Exigência do Django Channels (`?token=`). Só responde à mesma origem, com `Cache-Control: no-store`, e o token expira em 15 minutos.                 |
| Cookies sem `Secure` em desenvolvimento     | `Secure` é ativado automaticamente em produção (`isProduction`).                                                                                     |
