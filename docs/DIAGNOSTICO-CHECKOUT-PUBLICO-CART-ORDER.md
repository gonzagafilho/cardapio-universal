# Diagnóstico: fluxo loja pública → carrinho → checkout → pedido

**Data:** 2026-03-15  
**Modo:** Produção segura — inspeção real antes de patch.

---

## 1. RAIO-X AGORA

| Componente | Evidência (arquivos reais) |
|------------|----------------------------|
| **Checkout chama hoje** | `useCheckout` → `createOrder(dto)` de `@/services/order.service` → `apiPost(ORDERS_PATH, dto)` com `ORDERS_PATH = '/orders'`. Ou seja: **POST /api/orders** (rota **privada**). |
| **Exige autenticação?** | `order.service.ts` não envia Authorization; a rota `/orders` no backend está sob guard (JWT). Usuário público não tem token → **401 ou 403**. |
| **cartId hoje** | Checkout page passa `cartId: ''` em `handleSubmit` → **sempre vazio**. |
| **Backend público** | `POST /api/public/store/:slug/order` com `CreatePublicOrderDto`: **sessionId** e **cartId** obrigatórios. Backend busca cart por `id`, `tenantId`, `establishmentId`, `sessionId`, `status: 'open'`. Se não achar → BadRequestException. |
| **Carrinho no frontend** | `CartContext` guarda tudo em **localStorage** (`cardapio-cart`). addItem/removeItem/updateQuantity são só estado local. **Nenhuma** chamada a POST/GET carrinho público. Não existe sessionId nem cartId do backend. |
| **Conclusão** | Checkout usa endpoint **privado** com cartId **vazio**; carrinho nunca é sincronizado com o backend público; fluxo público está **quebrado**. |

---

## 2. INSPEÇÃO REAL

### Passo 1 — Arquivos numerados

- **useCheckout.ts (1–42):** Usa `createOrder` de `order.service`; não recebe slug; não chama endpoint público.
- **order.service.ts (1–26):** `ORDERS_PATH = '/orders'`; `createOrder(dto)` → `apiPost(ORDERS_PATH, dto)`; comentário: "Requer cartId válido no banco e autenticação."
- **cart/page.tsx (1–136):** Usa `useCart()` (items, subtotal, etc.); não exibe nem usa cartId ou sessionId; não chama API de carrinho.
- **store-public.service.ts (388–620):** `upsertCartItem(slug, dto)` usa `dto.sessionId` e `getOrCreateOpenCart(..., dto.sessionId)`; `getPublicCart(slug, sessionId)` retorna `mapPublicCart(fullCart)` com `...cart` → **cart.id** está no retorno; `createPublicOrder(slug, dto)` exige `dto.cartId` e `dto.sessionId` e busca cart; se não achar → BadRequest.

### Passo 2 — Desalinhamento provado

- **Qual endpoint o checkout chama hoje:** POST **/orders** (base: `API_BASE_URL` = NEXT_PUBLIC_API_URL, ex.: `https://api..../api` → POST `https://api..../api/orders`).
- **É privado?** Sim. Rota de orders no backend é protegida por guard; frontend não envia token.
- **Backend público exige cartId válido?** Sim. `createPublicOrder` faz `findFirst` com `id: dto.cartId`, `sessionId: dto.sessionId`, etc. Cart inexistente ou já convertido → BadRequest.
- **Frontend tem cartId real?** Não. Carrinho é só localStorage; não há chamada a GET `/public/store/:slug/cart/:sessionId`; não há sessionId persistido.
- **Fluxo quebrado por cartId vazio?** Sim. Mesmo que o frontend chamasse o endpoint público, enviaria cartId ''; o backend não encontraria o carrinho.
- **Mismatch DTO?** Sim. Frontend envia `CreateOrderDto` (privado) com cartId; backend público espera `CreatePublicOrderDto` com **sessionId** + cartId + type + customerName, etc.

---

## 3. DIAGNÓSTICO

1. O checkout público usa **serviço de pedido privado** (`order.service.createOrder`) e rota **POST /orders**.
2. O carrinho é apenas **local** (localStorage); não há sync com POST/GET do carrinho público, logo não há **sessionId** nem **cartId** do backend.
3. O backend público de pedido **depende** de um cart criado/obtido via carrinho público (sessionId + cartId).
4. **Patch mínimo:** No frontend: (a) obter/criar um **sessionId** estável; (b) no submit do checkout, **sincronizar** os itens do carrinho local com o carrinho público (POST cart/item por produto agregado); (c) **GET** carrinho público para obter **cart.id**; (d) chamar **POST /api/public/store/:slug/order** com sessionId, cartId, tipo e dados do cliente. Não alterar backend; não alterar admin; não refatorar uso do carrinho local além do necessário para esse fluxo.

---

## 4. DECISÃO: EDITA OU NÃO EDITA

**Edita.** O problema está no frontend (endpoint errado e ausência de sessionId/cartId). Patch restrito a:

- `frontend/src/services/store.service.ts`: adicionar sessionId, getPublicCart, addPublicCartItem, createPublicOrder (e helper de sync).
- `frontend/src/app/(public)/[storeSlug]/checkout/page.tsx`: no submit, sync → get cart → createPublicOrder com slug; tratar retorno (order.id, code, total).

Não mexe em useCheckout/order.service para outras telas; não mexe em CartContext além do necessário; não mexe em backend nem admin.

---

## 5. PATCH MÍNIMO EXATO

- **Arquivo 1:** `frontend/src/services/store.service.ts`  
  - Importar `apiPost`.  
  - Adicionar `getOrCreateSessionId()` (ler/gravar em sessionStorage `cardapio-public-session-id`).  
  - Adicionar `getPublicCart(slug, sessionId)` → GET `${PUBLIC_PREFIX}/${slug}/cart/${sessionId}`.  
  - Adicionar `addPublicCartItem(slug, { sessionId, productId, quantity, notes? })` → POST `${PUBLIC_PREFIX}/${slug}/cart/item`.  
  - Adicionar `createPublicOrder(slug, dto)` → POST `${PUBLIC_PREFIX}/${slug}/order` com dto (sessionId, cartId, type, customerName, customerPhone, deliveryAddress, notes).  
  - Adicionar `syncPublicCart(slug, sessionId, items)` que agrupa por productId, soma quantidade, e chama addPublicCartItem para cada grupo (uma linha por productId; opcionais não são enviados pelo DTO atual do backend).

- **Arquivo 2:** `frontend/src/app/(public)/[storeSlug]/checkout/page.tsx`  
  - Em `handleSubmit`: obter `sessionId = getOrCreateSessionId()`; chamar `syncPublicCart(storeSlug, sessionId, items)`; `cart = await getPublicCart(storeSlug, sessionId)`; `result = await createPublicOrder(storeSlug, { sessionId, cartId: cart.id, type: data.orderType, customerName, customerPhone, deliveryAddress: data.orderType === 'delivery' ? data.deliveryAddress : undefined, notes: data.notes?.trim() || undefined })`.  
  - Tratar `result.order` (e opcionalmente result.payment); chamar `goToSuccess(result.order.id, result.order.code, result.order.totalAmount ?? result.order.total)`.  
  - Manter uso de useCheckout apenas para loading/error local se desejado, ou usar estado local (submitting, submitError) e não chamar `submitOrder` do useCheckout para esse fluxo.

---

## 6. VALIDAÇÃO FINAL

Comandos para validar após o patch:

1. **Criar/atualizar carrinho público (por item):**
   ```bash
   SESSION_ID="test-session-$(date +%s)"
   curl -s -X POST "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/cart/item" \
     -H "Content-Type: application/json" \
     -d "{\"sessionId\":\"$SESSION_ID\",\"productId\":\"<ID_PRODUTO_REAL>\",\"quantity\":2,\"notes\":\"\"}"
   ```

2. **Consultar carrinho:**
   ```bash
   curl -s "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/cart/$SESSION_ID"
   ```
   (Resposta deve trazer `id` do carrinho.)

3. **Finalizar pedido (endpoint público):**
   ```bash
   CART_ID="<id retornado no passo 2>"
   curl -s -X POST "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/order" \
     -H "Content-Type: application/json" \
     -d "{\"sessionId\":\"$SESSION_ID\",\"cartId\":\"$CART_ID\",\"type\":\"pickup\",\"customerName\":\"Teste\",\"customerPhone\":\"11999999999\"}"
   ```

4. **Validar retorno:** JSON com `order` (id, code, etc.) e opcionalmente `payment`.

5. **Validar no admin/cozinha:** Pedido deve aparecer na listagem do estabelecimento.

---

## 7. TEXTO PRONTO PRO PRÓXIMO CHAT

**Contexto checkout público (cart/order):**

- Diagnóstico feito: checkout usava POST **/orders** (privado) com **cartId vazio**; carrinho só em localStorage, sem sessionId/cartId do backend. Backend público exige POST `/api/public/store/:slug/order` com **sessionId** e **cartId** válidos (carrinho criado via POST cart/item e GET cart).
- Documento: `docs/DIAGNOSTICO-CHECKOUT-PUBLICO-CART-ORDER.md`.
- **Patch mínimo aplicado (frontend):** Em `store.service.ts` foram adicionados getOrCreateSessionId, getPublicCart, addPublicCartItem, createPublicOrder e syncPublicCart. Em `checkout/page.tsx` o handleSubmit passou a: obter sessionId, syncPublicCart(items), getPublicCart, createPublicOrder(slug, { sessionId, cartId: cart.id, ... }), goToSuccess com result.order. Nenhuma alteração em backend nem admin.
- **Validar:** Incluir no fluxo de testes: adicionar itens na loja pública, ir ao checkout, preencher dados e finalizar; conferir pedido no admin/cozinha e usar os curls do doc para validar API de cart/order público.

---

*Fim do diagnóstico.*
