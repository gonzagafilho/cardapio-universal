# BLOCO 1 — AUDITORIA FINAL ANTES DAS ALTERAÇÕES

## 1. MAPA REAL DOS ARQUIVOS ENCONTRADOS

### Backend (NestJS) — raiz `src/`

| # | Ponto | Arquivo real | Linhas |
|---|--------|--------------|--------|
| 1 | app.module | `src/app.module.ts` | 114 |
| 2 | orders.service | `src/modules/orders/orders.service.ts` | 247 |
| 3 | orders.controller | `src/modules/orders/orders.controller.ts` | 146 |
| 4 | store-public.service | `src/modules/store-public/store-public.service.ts` | 659 |
| 5 | store-public.controller | `src/modules/store-public/store-public.controller.ts` | 130 |
| 6 | auth.controller | `src/modules/auth/auth.controller.ts` | 59 |
| 7 | auth.module | `src/modules/auth/auth.module.ts` | 28 |
| 8 | schema | `prisma/schema.prisma` | 814 |
| 9 | nginx | `nginx-cardapio-nexora.conf` | ~128 |
| 10 | gateway/socket cozinha | `src/modules/orders/orders.gateway.ts` | 61 |
| 11 | cache | `src/modules/cache/cache.service.ts`, `cache.module.ts` | 58, 12 |
| 12 | filtro exceção + logs | `src/common/filters/http-exception.filter.ts` | 52 |
| 13 | middleware requestId | `src/common/middleware/request-id.middleware.ts` | 16 |
| 14 | products/categories/settings/establishments | `src/modules/products/products.controller.ts`, `categories.controller.ts`, `settings.controller.ts`, `establishments.controller.ts` | vários |

### Frontend (Next.js) — raiz `frontend/src/`

| # | Ponto | Arquivo real |
|---|--------|--------------|
| 15 | useCart / CartContext | `frontend/src/contexts/CartContext.tsx`, `hooks/useCart.ts` |
| 16 | checkout/success slug | `frontend/src/app/(public)/[storeSlug]/checkout/page.tsx`, `.../success/page.tsx` |
| 16 | checkout/success custom domain | `frontend/src/app/checkout/page.tsx`, `app/success/page.tsx` |
| 17 | WebSocket/polling admin/cozinha | `admin/src/app/(dashboard)/cozinha/page.tsx`, `admin/src/lib/constants.ts` (WS_ORIGIN) |

### Controllers de domínio (existência)

- `src/modules/products/products.controller.ts`
- `src/modules/categories/categories.controller.ts`
- `src/modules/settings/settings.controller.ts`
- `src/modules/establishments/establishments.controller.ts`

---

## 2. RISCOS CONFIRMADOS (estado atual)

- **Concorrência de pedido:** create() não usa transação; duas requisições podem ler carrinho `open` e ambas criar pedido (retry de orderNumber não evita dois pedidos para o mesmo cart).
- **Atomicidade:** order + orderItems + cart.update não estão em uma única transação; falha após create pode deixar order sem items ou cart ainda open.
- **Cache store-public:** chaves `store:slug:*`, `store:host:*`, `store:{establishmentId}:categories|products|settings`. Não há invalidação ao atualizar produto/categoria/settings no admin; CacheService não expõe `del()`.
- **Rate limit:** um único perfil (30/60s) para todo Throttler; sem perfis por rota (leitura vs POST order vs login).
- **Logs:** filter já usa requestId e tenantId; não loga duração nem status HTTP de forma estruturada; stack trace pode ir para logs (não para resposta).

---

## 3. O QUE SERÁ ALTERADO (por bloco)

| Bloco | Arquivos a alterar | O que não alterar |
|-------|--------------------|--------------------|
| 2 Concorrência | `orders.service.ts`, opcional `store-public.service.ts` | Controllers, DTOs, frontend |
| 3 Segurança | Revisão; possivelmente guards/decorators pontuais | Estrutura de rotas |
| 4 Rate limit | `app.module.ts`, `store-public.controller.ts`, `auth.controller.ts` | Lógica de negócio |
| 5 Paginação/performance | `orders.service.ts` (já paginado), `reports`, schema índices | Frontend admin |
| 6 Cache | `cache.service.ts` (del), `store-public.service.ts` (invalidate), products/categories/settings services | Contratos públicos |
| 7 WebSocket | `orders.gateway.ts` (revisão/documentação) | Contrato do cliente |
| 8 Observabilidade | `http-exception.filter.ts` | Rotas |
| 9 Infra | `nginx-cardapio-nexora.conf` (revisão), docs .env | PM2/processos |
| 10 Experiência | Revisão apenas | Fluxos atuais |
| 11 Frontend | `CartContext`, checkout/success (mínimo: loading/duplo clique) | Rotas e contratos |
| 12 Testes | Checklist em doc | Não criar suíte grande |

---

## 4. ARQUIVOS QUE NÃO PRECISAM ALTERAR (apenas inspeção)

- `prisma/schema.prisma` — índices já adequados para slug, establishmentId, orderNumber; eventual índice extra documentado.
- `auth.module.ts` — já com ThrottlerModule.
- `orders.gateway.ts` — subscribe por establishmentId, emit to room; sem vazamento entre establishments.
- `request-id.middleware.ts` — já aplicado em todas as rotas.
- Frontend: páginas de success/checkout por slug e custom domain — contrato já validado; apenas endurecimento mínimo se aplicável.

---

## 5. PATCHES APLICADOS (HARDENING)

### Bloco 2 — Concorrência e integridade de pedidos
- **orders.service.ts:** `create()` passou a rodar em uma única `prisma.$transaction`: (1) `cart.updateMany` com `where: { id, tenantId, establishmentId, status: 'open' }` e `data: { status: 'converted' }`; (2) se `count === 0`, lança `BadRequestException` (idempotente: carrinho já convertido); (3) `generateOrderCode(tenantId, establishmentId, tx)` usando cliente da transação; (4) `order.create`; (5) `orderItem.createMany`. Retry por P2002 mantido fora da transação. Emissão WebSocket e `findOne` após a transação.
- **Efeito:** Um único request “ganha” o carrinho; duplo clique ou retry de rede recebe “Carrinho inválido ou já convertido”. Order + itens + cart sempre consistentes.

### Bloco 6 — Cache e invalidação
- **cache.service.ts:** Método `del(key: string): Promise<void>` para remover chave (sem efeito se Redis desabilitado).
- **products.service.ts:** Injeção de `CacheService`; após create/update/remove/updateStatus/reorder chama `invalidateStoreProductCache(establishmentId, categoryId?, productId?)` — remove `store:${establishmentId}:products`, `store:${establishmentId}:products:${categoryId}`, `store:${establishmentId}:product:${productId}` quando aplicável.
- **categories.service.ts:** Injeção de `CacheService`; após create/update/remove/reorder chama `invalidateStoreCategoryCache(establishmentId)` — remove `store:${establishmentId}:categories` e `store:${establishmentId}:products`.
- **settings.service.ts:** Injeção de `CacheService`; após updateStore, updatePaymentMethods e updateDelivery chama `cache.del(\`store:${establishmentId}:settings\`)`.
- **establishments.service.ts:** Injeção de `CacheService`; após update invalida `store:slug:${slug}` e `store:host:${normalized}` para o estabelecimento atual e o atualizado (antes e depois).

---

## 6. CHECKLIST DE TESTES MANUAIS (pós-hardening)

1. **Loja por slug:** GET /bistro, produtos, carrinho, checkout, finalizar → success com orderId; carrinho limpo.
2. **Loja por domínio custom:** Host custom → adicionar item → /checkout → finalizar → /success; pedido no admin.
3. **Idempotência:** Dois cliques rápidos em “Finalizar” ou retry de rede → apenas um pedido; segundo retorno “Carrinho inválido ou já convertido”.
4. **Cache:** Alterar produto/categoria/settings no admin → loja pública reflete alteração (sem esperar TTL).
5. **Pedidos admin/cozinha:** Listagem, detalhe, mudança de status; WebSocket atualiza cozinha.
6. **Isolamento:** Usuário de um establishment não acessa pedido de outro (403).
7. **Paginação:** GET /orders?page=1&limit=20; segunda página.
8. **Rate limit:** Muitas requisições seguidas em rota pública → 429.
9. **Onboarding:** Cadastro novo tenant/loja; slug único.
10. **Socket/realtime:** Cozinha recebe evento ao criar pedido e ao mudar status.
