# Confirmação: onde cartId/sessionId vivem no frontend e alinhamento ao checkout público

**Data:** 2026-03-15  
**Modo:** Produção segura — inspeção real antes de qualquer alteração.

---

## 1. RAIO-X AGORA

| Fonte | cartId | sessionId | Uso no checkout público |
|-------|--------|-----------|--------------------------|
| **CartContext.tsx** | Não guardado. Estado: storeSlug, establishmentId, items, discount, deliveryFee, couponCode. Persistido em localStorage `cardapio-cart`. | Não guardado. | Checkout usa `items` do useCart(); não há cartId/sessionId no context. |
| **cart.store.ts** (Zustand) | Não guardado. Mesmo shape: storeSlug, establishmentId, items, discount, deliveryFee, couponCode. Em memória. | Não guardado. | Não usado pela página [storeSlug]/checkout (esta usa useCart do CartContext). |
| **cart.service.ts** | Usado como argumento: getCart(cartId), addCartItem(cartId, …). Rota **privada** `/carts` (não `/public/store/:slug/art/...`). | Opcional em createCart(establishmentId, sessionId?, customerId?). | Não usado pelo checkout público. |
| **store.service.ts** (fluxo público) | Não armazenado. Obtido no submit: getPublicCart(slug, sessionId) retorna objeto com **id** → usado como cartId. | **Guardado em sessionStorage** `cardapio-public-session-id` por **getOrCreateSessionId()**. | Checkout chama getOrCreateSessionId(), syncPublicCart(), getPublicCart() → cart.id, createPublicOrder(slug, { sessionId, cartId: cart.id, ... }). |
| **create-public-order.dto.ts** (backend) | **Obrigatório:** cartId: string. | **Obrigatório:** sessionId: string. | type obrigatório; customerName, customerPhone, deliveryAddress, notes, paymentMethod, tableId opcionais. |

Conclusão: no frontend, **cartId não é guardado em lugar nenhum** (CartContext/cart.store não têm esse campo). **sessionId** não existia no carrinho; foi introduzido no **store.service** via getOrCreateSessionId() em sessionStorage. O **cartId real** é obtido no momento do submit: sync itens → GET carrinho público → usar `cart.id`.

---

## 2. INSPEÇÃO REAL

### CartContext.tsx (1–306)

- **15:** `CART_STORAGE_KEY = 'cardapio-cart'`.
- **24–31:** CartState: storeSlug, establishmentId, items, discount, deliveryFee, couponCode. **Nenhum cartId nem sessionId.**
- **76–95:** loadFromStorage lê localStorage e restaura storeSlug, establishmentId, items, discount, deliveryFee, couponCode. **Nada de cartId/sessionId.**
- **98–105:** saveToStorage persiste o mesmo estado. **Nenhum cartId/sessionId.**

### cart.store.ts (1–190)

- **24–31:** CartState: storeSlug, establishmentId, items, discount, deliveryFee, couponCode + ações. **Sem cartId/sessionId.**
- Não persiste em localStorage; não chama API de carrinho público.

### cart.service.ts (1–55)

- **5:** `CARTS_PATH = '/carts'` → API **privada** (não pública).
- **7–16:** createCart(establishmentId, sessionId?, customerId?) → POST /carts.
- **19–20:** getCart(cartId) → GET /carts/:cartId.
- O checkout público **não** importa nem usa cart.service.

### create-public-order.dto.ts (backend, 1–46)

- **6–7:** sessionId: string (obrigatório).
- **9–11:** cartId: string (obrigatório).
- **13–15:** type: string, enum ['delivery','pickup','dine_in'] (obrigatório).
- **17–45:** paymentMethod?, notes?, customerName?, customerPhone?, deliveryAddress?, tableId? (opcionais).

### checkout/page.tsx e store.service.ts (estado atual)

- Checkout usa **useCart()** (CartContext) para items, subtotal, discount, deliveryFee, total, clearCart.
- **Não** usa useCheckout/order.service para submeter.
- handleSubmit: getOrCreateSessionId() → syncPublicCart(storeSlug, sessionId, items) → getPublicCart(storeSlug, sessionId) → createPublicOrder(storeSlug, { sessionId, cartId: cart.id, type, customerName, customerPhone, deliveryAddress, notes }).
- store.service: getOrCreateSessionId() lê/grava sessionStorage `cardapio-public-session-id`; getPublicCart retorna PublicCart com **id**; createPublicOrder faz POST `${PUBLIC_PREFIX}/${slug}/order` com o DTO alinhado ao backend.

---

## 3. DIAGNÓSTICO

1. **Onde cartId é “salvo” no frontend:** Em nenhum lugar. O carrinho público no backend é identificado por (tenantId, establishmentId, sessionId). O **cartId** é o `id` do registro Cart no banco; o frontend **obtém** esse id na hora do checkout com getPublicCart(slug, sessionId). Resposta: **cartId não é armazenado; é obtido no submit** via GET carrinho público.

2. **Onde sessionId é salvo no frontend:** Em **sessionStorage**, chave `cardapio-public-session-id`, pela função **getOrCreateSessionId()** em **frontend/src/services/store.service.ts**. Nenhum outro arquivo (CartContext, cart.store, cart.service) guarda sessionId.

3. **Checkout atual consegue acessar esses dados?** Sim. No submit: sessionId = getOrCreateSessionId(); cartId = (await getPublicCart(storeSlug, sessionId)).id. O checkout não precisa que cartId/sessionId estejam no CartContext; ele os obtém no momento da finalização.

4. **Payload exato do DTO público:**  
   - Obrigatórios: sessionId (string), cartId (string), type ('delivery'|'pickup'|'dine_in').  
   - Opcionais: paymentMethod?, notes?, customerName?, customerPhone?, deliveryAddress?, tableId?.

5. **Menor ajuste para alinhar:** O ajuste mínimo **já está aplicado**: (a) sessionId estável em sessionStorage (getOrCreateSessionId); (b) no submit, sincronizar itens locais com o carrinho público (syncPublicCart), obter o carrinho (getPublicCart) para ter cart.id, e chamar createPublicOrder com sessionId, cartId e demais campos. Nenhuma alteração em CartContext ou cart.store; uso do endpoint público POST /api/public/store/:slug/order com dados reais.

---

## 4. DECISÃO: EDITA OU NÃO EDITA

**Não é necessário editar** para atingir o objetivo. O fluxo do checkout público já está alinhado ao backend público:

- sessionId: obtido/guardado em sessionStorage por getOrCreateSessionId().
- cartId: obtido no submit com syncPublicCart + getPublicCart → cart.id.
- createPublicOrder(slug, { sessionId, cartId, type, customerName, customerPhone, deliveryAddress, notes }) chama POST /api/public/store/:slug/order com o payload correto.

Não é preciso criar novo service de pedido público: já existe em store.service (getOrCreateSessionId, getPublicCart, addPublicCartItem, syncPublicCart, createPublicOrder). Não é preciso alterar CartContext nem cart.store para guardar cartId/sessionId.

Se em algum ambiente o checkout ainda estiver usando order.service/createOrder (POST /orders), isso seria outra página (ex.: CustomDomainCheckoutPage); a rota **[storeSlug]/checkout** está usando o fluxo público atual.

---

## 5. PATCH MÍNIMO EXATO

Nenhum patch adicional necessário para a página **src/app/(public)/[storeSlug]/checkout/page.tsx** e para o uso de cartId/sessionId reais. O patch mínimo já está em:

- **frontend/src/services/store.service.ts:** getOrCreateSessionId(), getPublicCart(), addPublicCartItem(), syncPublicCart(), createPublicOrder(), tipos PublicCart e CreatePublicOrderDto.
- **frontend/src/app/(public)/[storeSlug]/checkout/page.tsx:** handleSubmit que usa sessionId (getOrCreateSessionId), syncPublicCart, getPublicCart, cart.id como cartId, createPublicOrder com endpoint público.

---

## 6. VALIDAÇÃO FINAL

Comandos para validar o fluxo (substituir `<ID_PRODUTO_REAL>` por um id de GET .../bistro/products):

```bash
# 1) Criar/atualizar carrinho público (um item)
SESSION_ID="test-session-$(date +%s)"
curl -s -X POST "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/cart/item" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"productId\":\"<ID_PRODUTO_REAL>\",\"quantity\":2,\"notes\":\"\"}"

# 2) Consultar carrinho e capturar cartId (e sessionId já temos em $SESSION_ID)
curl -s "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/cart/$SESSION_ID"
# Na resposta, usar o campo "id" como CART_ID.

# 3) Finalizar pedido no endpoint público
CART_ID="<id retornado no passo 2>"
curl -s -X POST "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/order" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"cartId\":\"$CART_ID\",\"type\":\"pickup\",\"customerName\":\"Teste\",\"customerPhone\":\"11999999999\"}"

# 4) Confirmar resposta: JSON com "order" (id, code, etc.) e opcionalmente "payment".

# 5) Validar no admin/cozinha: pedido deve aparecer na listagem do estabelecimento.
```

Validação no browser: abrir loja /bistro, adicionar itens, ir ao checkout, preencher e finalizar; conferir redirecionamento para success e pedido no admin/cozinha.

---

## 7. TEXTO PRONTO PRO PRÓXIMO CHAT

**Contexto checkout público e cartId/sessionId:**

- Inspeção feita em CartContext, cart.store, cart.service e create-public-order.dto. **CartContext e cart.store não guardam cartId nem sessionId.** cart.service é API privada (/carts); não é usada pelo checkout público. **sessionId** no frontend fica em **sessionStorage** (chave `cardapio-public-session-id`) via **getOrCreateSessionId()** em **store.service.ts**. **cartId** não é armazenado; é obtido no submit com **getPublicCart(slug, sessionId)**, que retorna o objeto com **id** (cart.id).
- Contrato do DTO público: sessionId (obrigatório), cartId (obrigatório), type (obrigatório), customerName, customerPhone, deliveryAddress, notes, paymentMethod, tableId (opcionais).
- O checkout da rota **[storeSlug]/checkout** já está alinhado: usa getOrCreateSessionId(), syncPublicCart(), getPublicCart() → cart.id, createPublicOrder(slug, { sessionId, cartId: cart.id, ... }) → POST /api/public/store/:slug/order. Nenhuma alteração adicional foi necessária em CartContext, cart.store ou checkout para cartId/sessionId.
- Documento: **docs/CONFIRMACAO-CARTID-SESSIONID-CHECKOUT-PUBLICO.md**. Validação: curls do doc (criar carrinho, consultar carrinho, criar pedido) e teste manual no browser + conferência no admin/cozinha.

---

*Fim da confirmação.*
