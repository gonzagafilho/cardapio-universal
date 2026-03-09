# Cardápio Universal - Frontend Público

Frontend Next.js (App Router) do cardápio digital multi-empresa. O cliente final acessa pelo link da loja (`/[storeSlug]`).

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (carrinho)
- clsx + tailwind-merge

## Scripts

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm run start
```

## Variáveis de ambiente

Crie `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Estrutura

- `src/app` – rotas (page, layout)
- `src/components/store` – componentes da loja (header, banner, produto, carrinho, checkout, etc.)
- `src/components/ui` – componentes base (button, input, modal, drawer)
- `src/hooks` – useStoreData, useCart, useCheckout, useOrderTracking
- `src/services` – api, store, cart, order, payment
- `src/stores` – cart.store (Zustand)
- `src/types` – tipos TypeScript
- `src/lib` – currency, format, constants, cn

## Rotas públicas

| Rota | Descrição |
|------|-----------|
| `/[storeSlug]` | Cardápio da loja |
| `/[storeSlug]/cart` | Carrinho |
| `/[storeSlug]/checkout` | Checkout |
| `/[storeSlug]/success` | Pedido criado com sucesso |
| `/[storeSlug]/failure` | Erro no pedido/pagamento |
| `/[storeSlug]/order/[id]` | Acompanhamento do pedido |

## Integração com o backend

- **API base:** `NEXT_PUBLIC_API_URL` (ex.: `http://localhost:3000/api`).
- **Loja:** `GET /public/store/:slug`, `/categories`, `/products`, `/settings` já chamados pelos services.
- **Carrinho:** Hoje o carrinho é 100% local (Zustand). Para persistir no backend: criar carrinho via `POST /carts`, enviar `cartId` no checkout e sincronizar itens com `POST /carts/:id/items`.
- **Pedido:** `POST /orders` com `establishmentId`, `cartId`, tipo, pagamento, cliente e endereço. O backend pode exigir JWT; nesse caso será preciso login ou token anônimo.
- **Acompanhamento:** `GET /orders/:id` hoje exige autenticação. Opção: no backend criar `GET /public/orders/:code` (por código do pedido) para uso sem login.

## O que já está pronto

- Páginas e layout do fluxo (cardápio → carrinho → checkout → sucesso/falha → acompanhamento).
- Componentes de loja e UI.
- Store do carrinho (adicionar, remover, quantidade, totais).
- Hooks e services preparados para a API.
- Tipos alinhados ao backend.
- Responsivo e mobile-first.

## Próximos passos

1. Configurar `NEXT_PUBLIC_API_URL` e testar contra o backend.
2. Implementar criação de carrinho na API e enviar `cartId` no checkout.
3. Ajustar autenticação (se necessário) ou criar rota pública de acompanhamento por código.
4. Aplicar cores da loja (CSS vars) a partir de `settings.primaryColor` etc.
5. Cupom: campo no carrinho e chamada à API de validação/aplicação.
