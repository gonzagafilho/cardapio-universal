# Mesa/comanda, mínimo delivery e produto indisponível

Implementação dos 3 blocos operacionais sem quebrar o que já existe.

---

## 1. Diagnóstico real (arquivos alterados/criados)

### Prisma / migration
| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Order: `tableId` (opcional), relação `table`. StoreSettings: `minimumOrderAmountDelivery`. Product: `isAvailable` (default true). Table: relação `orders`. |
| `prisma/migrations/20260310134858_add_table_minimum_delivery_product_available/migration.sql` | Migration incremental: ADD COLUMN em Order, StoreSettings, Product; índice e FK em Order.tableId. |

### Backend
| Arquivo | Ação |
|---------|------|
| `src/modules/orders/dto/create-order.dto.ts` | Campo opcional `tableId`. |
| `src/modules/orders/orders.service.ts` | create: valida mesa (tableId), valida mínimo delivery, valida produtos isAvailable; inclui `table` em findAll/findOne; resposta com `code` (orderNumber). |
| `src/modules/store-public/store-public.service.ts` | getSettings: retorna `minimumOrderDelivery`; produtos continuam visíveis (incl. esgotados), `isAvailable` na resposta. |
| `src/modules/settings/settings.service.ts` | updateStore e updateDelivery: tratam `minimumOrderDelivery` / `minimumOrderAmountDelivery`. |
| `src/modules/settings/dto/update-store-settings.dto.ts` | Campo opcional `minimumOrderDelivery`. |
| `src/modules/settings/settings.controller.ts` | Body de updateDelivery inclui `minimumOrderDelivery`. |
| `src/modules/products/dto/create-product.dto.ts` | Campo opcional `isAvailable`. |
| `src/modules/products/products.service.ts` | create: define `isAvailable` (default true). update: aceita isAvailable via DTO. |

### Admin
| Arquivo | Ação |
|---------|------|
| `admin/src/types/order.ts` | `code?`, `orderNumber?`, `tableId?`, `table?`. |
| `admin/src/components/orders/OrderDetailsCard.tsx` | Exibe mesa/comanda quando `order.table` existe; título usa `code ?? orderNumber`. |
| `admin/src/components/forms/SettingsForm.tsx` | Campo "Pedido mínimo só entrega (R$)" e state `minimumOrderDelivery`. |
| `admin/src/types/product.ts` | `isAvailable?` em Product e CreateProductDto. |
| `admin/src/components/forms/ProductForm.tsx` | Toggle "Disponível agora (desmarque = esgotado)". |

### App público (frontend)
| Arquivo | Ação |
|---------|------|
| `frontend/src/types/store.ts` | `minimumOrderDelivery?`. |
| `frontend/src/types/product.ts` | `isAvailable?`. |
| `frontend/src/services/order.service.ts` | CreateOrderDto: `tableId?`. |
| `frontend/src/components/store/CheckoutForm.tsx` | CheckoutFormData: `tableId?`. |
| `frontend/src/app/(public/)/[storeSlug]/checkout/page.tsx` | Usa `settings.minimumOrderDelivery`/minimumOrder; mostra aviso de mínimo entrega; envia `tableId` no submit. |
| `frontend/src/components/store/ProductCard.tsx` | Badge "Esgotado" e botão desabilitado quando `isAvailable === false`. |
| `frontend/src/components/store/ProductModal.tsx` | Mensagem de indisponível e botão desabilitado quando `isAvailable === false`. |

### Não alterados
- Nginx, PM2, billing, onboarding, planos SaaS, seed principal, lógica de QR/domínio.

---

## 2. Plano técnico (ordem da implementação)

1. Schema Prisma + migration incremental.
2. Backend: orders (tableId, validações, code), store-public (minimumOrderDelivery), settings (minimumOrderDelivery), products (isAvailable).
3. Admin: tipos e formulários (pedido mesa, settings mínimo entrega, produto disponível).
4. App público: tipos, checkout (mínimo e tableId), produto esgotado (card e modal).
5. Documentação e checklist.

---

## 3. Código — caminhos e pontos de inserção

- **Order.tableId:** `prisma/schema.prisma` — em `model Order`, campo `tableId String?` e relação `table Table?`; em `model Table`, relação `orders Order[]`.
- **StoreSettings.minimumOrderAmountDelivery:** `prisma/schema.prisma` — em `model StoreSettings`, após `minimumOrderAmount`.
- **Product.isAvailable:** `prisma/schema.prisma` — em `model Product`, após `isActive`, `isAvailable Boolean @default(true)`.
- **CreateOrderDto.tableId:** `src/modules/orders/dto/create-order.dto.ts` — final do class, `@IsOptional() @IsString() tableId?: string`.
- **OrdersService:** `src/modules/orders/orders.service.ts` — em `create`: validação de produtos (isActive, isAvailable), validação de mínimo para DELIVERY, validação de tableId; em `create` data: `tableId: dto.tableId ?? undefined`; em findAll/findOne: `include: { table: true }`; método `toOrderResponse` e retorno mapeado com `code: order.orderNumber`.
- **Store public getSettings:** `src/modules/store-public/store-public.service.ts` — cálculo de `minimumOrderDelivery` e inclusão no objeto retornado.
- **Settings:** `src/modules/settings/settings.service.ts` — em updateStore e updateDelivery tratamento de `minimumOrderDelivery`; `src/modules/settings/dto/update-store-settings.dto.ts` — propriedade `minimumOrderDelivery?: number`.
- **Products create:** `src/modules/products/products.service.ts` — em create: `isAvailable: dto.isAvailable ?? true`; CreateProductDto com `isAvailable?: boolean`.
- **Admin OrderDetailsCard:** `admin/src/components/orders/OrderDetailsCard.tsx` — bloco condicional `{order.table && (...)}` com nome e número da mesa.
- **Admin SettingsForm:** `admin/src/components/forms/SettingsForm.tsx` — state e input "Pedido mínimo só entrega (R$)", envio em onSubmit.
- **Admin ProductForm:** `admin/src/components/forms/ProductForm.tsx` — state `isAvailable`, checkbox "Disponível agora", envio no onSubmit.
- **Frontend checkout:** `frontend/src/app/(public/)/[storeSlug]/checkout/page.tsx` — `minDelivery` a partir de settings; aviso de mínimo; `tableId: data.tableId` no submit.
- **Frontend ProductCard/ProductModal:** exibição "Esgotado" / "Indisponível" e desabilitar ação quando `product.isAvailable === false`.

---

## 4. Checklist final (testar sem quebrar produção)

### Antes de aplicar
- [ ] Backup do banco (ex.: `pg_dump`).
- [ ] Conferir que a migration incremental é a única pendente (`prisma migrate status`).

### Migration
- [ ] Rodar `npx prisma migrate deploy` (ou `migrate dev` em ambiente de dev).
- [ ] Rodar `npx prisma generate`.

### Bloco 1 — Mesa/comanda
- [ ] Pedido sem `tableId`: criar pedido normalmente; não deve exigir mesa.
- [ ] Pedido com `tableId`: enviar `tableId` válido do mesmo establishment; detalhe do pedido no admin deve mostrar mesa/comanda.
- [ ] Pedido com `tableId` inválido ou de outro establishment: backend deve retornar erro (400).
- [ ] Listagem e detalhe de pedidos no admin: coluna/detalhe de mesa quando existir; `code` exibido (orderNumber).

### Bloco 2 — Mínimo só para delivery
- [ ] StoreSettings: no admin, definir "Pedido mínimo só entrega" (ex.: 30) e salvar.
- [ ] Pedido tipo delivery com subtotal &lt; mínimo: backend deve rejeitar com mensagem clara.
- [ ] Pedido tipo pickup/dine_in: não deve aplicar mínimo de entrega.
- [ ] App público: na página de checkout, aviso "Pedido mínimo para entrega: R$ X" quando houver valor.

### Bloco 3 — Produto indisponível
- [ ] Admin: em um produto, desmarcar "Disponível agora" e salvar.
- [ ] App público: produto continua visível no cardápio com indicação "Esgotado"; botão desabilitado no card; no modal, mensagem de indisponível e botão "Indisponível" desabilitado.
- [ ] Tentativa de criar pedido com item esgotado no carrinho: backend deve rejeitar (400).
- [ ] Reativar "Disponível agora": produto volta a poder ser adicionado e pedido criado.

### Regressão
- [ ] Pedidos já existentes continuam listados e abrindo no admin.
- [ ] Cardápio público por slug e por domínio customizado funciona.
- [ ] Outros tenants e estabelecimentos não afetados.

---

## Rollback

1. **Código:** reverter commits dos arquivos listados no diagnóstico (schema, backend, admin, frontend).
2. **Banco:** reverter a migration:
   - Remover coluna e FK: `ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_tableId_fkey"; ALTER TABLE "Order" DROP COLUMN IF EXISTS "tableId";`
   - `ALTER TABLE "StoreSettings" DROP COLUMN IF EXISTS "minimumOrderAmountDelivery";`
   - `ALTER TABLE "Product" DROP COLUMN IF EXISTS "isAvailable";`
   - Ou restaurar backup do banco anterior à migration.
3. **Prisma:** após reverter o schema, rodar `npx prisma generate`.

Não é necessário alterar Nginx, PM2 ou billing.
