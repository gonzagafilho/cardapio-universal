# FECHAMENTO FINAL — RAIO-X REAL ANTES DAS ALTERAÇÕES

## 1. MAPA REAL DOS ARQUIVOS

| # | Ponto | Arquivo real | Observação |
|---|--------|--------------|------------|
| 1 | app.module | `src/app.module.ts` | ThrottlerModule.forRoot([{ name: 'short', ttl: 60_000, limit: 30 }]) |
| 2 | store-public.controller | `src/modules/store-public/store-public.controller.ts` | @UseGuards(ThrottlerGuard) em toda a classe |
| 3 | auth.controller | `src/modules/auth/auth.controller.ts` | @UseGuards(ThrottlerGuard) em toda a classe |
| 4 | orders.service | `src/modules/orders/orders.service.ts` | create em transação + claim cart |
| 5 | http-exception.filter | `src/common/filters/http-exception.filter.ts` | Loga method, url, status, requestId, tenantId; stack no log |
| 6 | nginx | `nginx-cardapio-nexora.conf` | api :3023, app :3021, admin :3022; Upgrade/Connection em todos; sem server para hosts custom |
| 7 | CartContext | `frontend/src/contexts/CartContext.tsx` | 306 linhas; persistência localStorage; clearCart |
| 8 | checkout slug | `frontend/src/app/(public)/[storeSlug]/checkout/page.tsx` | submitting, submitError, handleSubmit com try/catch |
| 9 | CustomDomainCheckoutPage | `frontend/src/components/store/CustomDomainCheckoutPage.tsx` | submitting, submitError; fluxo idêntico ao slug |
| 10 | env/example | `.env.example` (raiz), `frontend/.env.production.example` | Backend vars; frontend tem production.example |
| 11 | gateway | `src/modules/orders/orders.gateway.ts` | subscribe(establishmentId), emitToEstablishment |
| 12 | throttler/guard | `app.module.ts`, `store-public.controller.ts`, `auth.controller.ts`, `store-public.module.ts`, `auth.module.ts` | Um perfil único (30/60s) |

## 2. O QUE SERÁ ALTERADO

- **app.module.ts:** ThrottlerModule com vários perfis (publicRead, publicWrite, auth).
- **store-public.controller.ts:** Aplicar @Throttle por rota (leitura vs escrita).
- **auth.controller.ts:** Aplicar @Throttle mais restritivo em login/onboarding.
- **http-exception.filter.ts:** Duração da request, establishmentId, distinção 4xx/429/5xx.
- **request-id.middleware.ts:** Registrar startTime para cálculo de duração (ou interceptor).
- **checkout (slug):** Garantir botão desabilitado quando submitting; mensagem amigável para "Carrinho inválido ou já convertido".
- **CustomDomainCheckoutPage:** Idem; evitar reenvio se já submitting.
- **success (slug e custom):** Fallback quando orderId ausente na URL.
- **.env.example:** Completar Redis, CORS, frontend/admin URLs.
- **docs/OPERACAO-PRODUCAO.md:** Criar.
- **docs/LAUNCH-CHECKLIST.md:** Criar.
- **nginx:** Documentar; sugerir client_max_body_size e timeouts se necessário (sem alterar produção sem justificativa).

## 3. O QUE NÃO PRECISA ALTERAR

- **orders.service.ts:** Já com transação e idempotência.
- **orders.gateway.ts:** Comportamento correto; sem vazamento entre establishments.
- **CartContext.tsx:** Persistência e clearCart já corretos; sem mudança de contrato.
- **Contratos da API:** Nenhuma alteração em DTOs ou rotas públicas.
