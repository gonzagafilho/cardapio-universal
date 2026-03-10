# RAIO-X TÉCNICO COMPLETO — Cardápio Nexora

**Projeto:** SaaS de cardápio digital multi-tenant  
**Base:** análise exclusiva dos arquivos existentes no repositório. Nenhuma alteração foi feita.

---

## 1 — Arquitetura geral

| Camada | Tecnologia | Caminho no servidor |
|--------|------------|---------------------|
| **Backend** | NestJS 10, Prisma 5, PostgreSQL | `/home/servidor-dcnet/cardapio-universal` (raiz) |
| **Frontend (App)** | Next.js (App Router) | `/home/servidor-dcnet/cardapio-universal/frontend` |
| **Admin** | Next.js (App Router) | `/home/servidor-dcnet/cardapio-universal/admin` |
| **Infraestrutura** | Nginx, PM2, Ubuntu Server | Confirmado pelo contexto; configurações não lidas no repositório |

**Portas em produção (informadas):** 3020 (API), 3021 (App), 3022 (Admin).  
**Domínios (informados):** api.cardapio.nexoracloud.com.br, app.cardapio.nexoracloud.com.br, admin.cardapio.nexoracloud.com.br.

---

## 2 — Backend (NestJS)

### Módulos existentes (AppModule)

| Módulo | Arquivo |
|--------|---------|
| ConfigModule | global, load: databaseConfig, authConfig |
| PrismaModule | `src/prisma/prisma.module.ts` |
| AuthModule | `src/modules/auth/auth.module.ts` |
| UsersModule | `src/modules/users/users.module.ts` |
| TenantsModule | `src/modules/tenants/tenants.module.ts` |
| EstablishmentsModule | `src/modules/establishments/establishments.module.ts` |
| CategoriesModule | `src/modules/categories/categories.module.ts` |
| ProductsModule | `src/modules/products/products.module.ts` |
| ProductOptionsModule | `src/modules/product-options/product-options.module.ts` |
| CartsModule | `src/modules/carts/carts.module.ts` |
| OrdersModule | `src/modules/orders/orders.module.ts` |
| PaymentsModule | `src/modules/payments/payments.module.ts` |
| CustomersModule | `src/modules/customers/customers.module.ts` |
| CouponsModule | `src/modules/coupons/coupons.module.ts` |
| DeliveryZonesModule | `src/modules/delivery-zones/delivery-zones.module.ts` |
| SettingsModule | `src/modules/settings/settings.module.ts` |
| ReportsModule | `src/modules/reports/reports.module.ts` |
| UploadsModule | `src/modules/uploads/uploads.module.ts` |
| AuditModule | `src/modules/audit/audit.module.ts` |
| HealthModule | `src/modules/health/health.module.ts` |
| StorePublicModule | `src/modules/store-public/store-public.module.ts` |

### Providers globais (app.module.ts)

- **APP_GUARD:** `JwtAuthGuard` (protege todas as rotas; exceção: decorator `@Public()`)
- **APP_PIPE:** `ValidationPipe`
- **APP_FILTER:** `AllExceptionsFilter`
- **APP_INTERCEPTOR:** `TransformInterceptor`

### Controllers existentes

| Controller | Caminho | Prefixo da rota |
|------------|---------|------------------|
| AuthController | `src/modules/auth/auth.controller.ts` | `auth` |
| UsersController | `src/modules/users/users.controller.ts` | `users` |
| TenantsController | `src/modules/tenants/tenants.controller.ts` | `tenants` |
| EstablishmentsController | `src/modules/establishments/establishments.controller.ts` | `establishments` |
| CategoriesController | `src/modules/categories/categories.controller.ts` | `categories` |
| ProductsController | `src/modules/products/products.controller.ts` | `products` |
| ProductOptionsController | `src/modules/product-options/product-options.controller.ts` | (sem prefixo próprio) |
| CartsController | `src/modules/carts/carts.controller.ts` | `carts` |
| OrdersController | `src/modules/orders/orders.controller.ts` | `orders` |
| PaymentsController | `src/modules/payments/payments.controller.ts` | `payments` |
| CustomersController | `src/modules/customers/customers.controller.ts` | `customers` |
| CouponsController | `src/modules/coupons/coupons.controller.ts` | `coupons` |
| DeliveryZonesController | `src/modules/delivery-zones/delivery-zones.controller.ts` | `delivery-zones` |
| SettingsController | `src/modules/settings/settings.controller.ts` | `settings` |
| ReportsController | `src/modules/reports/reports.controller.ts` | `reports` |
| UploadsController | `src/modules/uploads/uploads.controller.ts` | `uploads` |
| AuditController | `src/modules/audit/audit.controller.ts` | `audit` |
| HealthController | `src/modules/health/health.controller.ts` | `health` |
| StorePublicController | `src/modules/store-public/store-public.controller.ts` | `public/store` |

### Services existentes

Um service por módulo de domínio (auth, users, tenants, establishments, categories, products, product-options, carts, orders, payments, customers, coupons, delivery-zones, settings, reports, uploads, audit, store-public) + `PrismaService` em `src/prisma/prisma.service.ts`.

### Guards

| Guard | Arquivo |
|-------|---------|
| JwtAuthGuard | `src/common/guards/jwt-auth.guard.ts` |
| RolesGuard | `src/common/guards/roles.guard.ts` |
| TenantGuard | `src/common/guards/tenant.guard.ts` |

### Decorators

| Decorator | Arquivo |
|-----------|---------|
| CurrentUser | `src/common/decorators/current-user.decorator.ts` |
| TenantId | `src/common/decorators/tenant.decorator.ts` |
| Roles | `src/common/decorators/roles.decorator.ts` |
| Public | `src/common/decorators/public.decorator.ts` |

### Pipes e filtros

- **ValidationPipe** — `src/common/pipes/validation.pipe.ts`
- **AllExceptionsFilter** — `src/common/filters/http-exception.filter.ts`
- **TransformInterceptor** — `src/common/interceptors/transform.interceptor.ts`

### DTOs (pastas dto por módulo)

- **auth:** LoginDto, RefreshTokenDto
- **users:** CreateUserDto, UpdateUserDto
- **tenants:** CreateTenantDto, UpdateTenantDto
- **establishments:** CreateEstablishmentDto, UpdateEstablishmentDto
- **categories:** CreateCategoryDto, UpdateCategoryDto, ReorderCategoriesDto
- **products:** CreateProductDto, UpdateProductDto, ReorderProductsDto
- **product-options:** CreateOptionGroupDto, UpdateOptionGroupDto, CreateOptionItemDto, UpdateOptionItemDto
- **carts:** CreateCartDto, AddCartItemDto, UpdateCartItemDto, ApplyCouponDto
- **orders:** CreateOrderDto, UpdateOrderStatusDto
- **customers:** CreateCustomerDto, UpdateCustomerDto
- **coupons:** CreateCouponDto, UpdateCouponDto
- **delivery-zones:** CreateDeliveryZoneDto, UpdateDeliveryZoneDto
- **settings:** UpdateStoreSettingsDto

---

## 3 — Banco de dados (Prisma)

**Schema:** `prisma/schema.prisma`  
**Provider:** PostgreSQL.

### Models existentes

| Model | Descrição |
|-------|-----------|
| Tenant | Empresa/tenant; slug único; plan, status, primaryColor, secondaryColor |
| User | Usuário do painel; tenantId, role, establishmentId opcional |
| Establishment | Estabelecimento/loja; slug único por tenant |
| Category | Categoria de produtos por estabelecimento |
| Product | Produto do cardápio; slug único por establishment; price, compareAtPrice |
| OptionalGroup | Grupo de opcionais (ex.: Extras) |
| OptionalItem | Item do grupo (ex.: Bacon, Queijo Extra) |
| ProductOptionalGroup | N:N Product ↔ OptionalGroup |
| EstablishmentWorkingHours | Horário por dia da semana |
| StoreSettings | Configuração por estabelecimento (deliveryFee, minimumOrderAmount, etc.) |
| Banner | Banner promocional por estabelecimento |
| Coupon | Cupom de desconto |
| Customer | Cliente final (tenant) |
| CustomerAddress | Endereço do cliente |
| Order | Pedido (orderNumber, type, status, paymentMethod, paymentStatus) |
| OrderItem | Item do pedido (productNameSnapshot, unitPrice, quantity) |
| OrderItemOption | Opcional escolhido no pedido (snapshot) |
| Payment | Transação de pagamento |
| Table | Mesa/comanda (estrutura para uso futuro) |
| Cart | Carrinho |
| CartItem | Item do carrinho |
| DeliveryZone | Zona de entrega (taxa, tempo) |
| AuditLog | Auditoria de ações no painel |

### Enums

Role, OrderType, OrderStatus, PaymentMethod, PaymentStatus, DiscountType, Weekday.

### Relações principais

- Tenant → establishments, users, categories, products, orders, carts, customers, coupons, storeSettings, workingHours, banners, deliveryZones, auditLogs, etc.
- Establishment → categories, products, orders, storeSettings, workingHours, carts, etc.
- Category → products
- Product → category, optionalGroups (N:N), cartItems, orderItems
- Order → orderItems, payments, customer, coupon
- User → tenant, establishment (opcional)

### Migrations

Não foi possível confirmar com base na estrutura encontrada. No repositório não há pasta `prisma/migrations` com arquivos listados (a busca retornou 0 arquivos em `prisma/migrations/**`). O schema existe e está completo.

---

## 4 — Autenticação

| Item | Confirmado |
|------|------------|
| **Login** | Sim — `POST /auth/login` (LoginDto); rota `@Public()` |
| **JWT** | Sim — JwtAuthGuard global; exceção para rotas com `@Public()` |
| **Refresh token** | Sim — `POST /auth/refresh` (RefreshTokenDto); rota `@Public()` |
| **Logout** | Sim — `POST /auth/logout` (invalidação no cliente) |
| **Me** | Sim — `GET /auth/me` (usuário autenticado via CurrentUser) |
| **Guards** | JwtAuthGuard (global), RolesGuard, TenantGuard |
| **Decorators** | @Public(), @CurrentUser(), @TenantId(), @Roles() |

Variáveis de ambiente usadas (nomes): JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN (conforme `.env.example`). Carregamento em `authConfig` (config/auth).

---

## 5 — API

**Prefixo global:** `api` (env: API_PREFIX).  
**Porta da aplicação:** `env.port` (default 3000; produção informada: 3020).  
**Swagger:** `${apiPrefix}/docs` → `/api/docs`.

### Endpoints principais (prefixo `/api` implícito)

| Método | Rota | Controller | Observação |
|--------|------|------------|------------|
| POST | /auth/login | Auth | @Public() |
| POST | /auth/refresh | Auth | @Public() |
| POST | /auth/logout | Auth | |
| GET | /auth/me | Auth | |
| GET | /health | Health | @Public() |
| GET | /health/db | Health | @Public() |
| GET | /public/store/:slug | StorePublic | @Public() |
| GET | /public/store/:slug/categories | StorePublic | @Public() |
| GET | /public/store/:slug/products | StorePublic | @Public() |
| GET | /public/store/:slug/products/:id | StorePublic | @Public() |
| GET | /public/store/:slug/settings | StorePublic | @Public() |
| POST | /tenants | Tenants | |
| GET | /tenants | Tenants | |
| GET | /tenants/:id | Tenants | |
| PATCH | /tenants/:id | Tenants | |
| DELETE | /tenants/:id | Tenants | |
| POST | /users | Users | |
| GET | /users | Users | |
| GET | /users/:id | Users | |
| PATCH | /users/:id | Users | |
| DELETE | /users/:id | Users | |
| POST | /establishments | Establishments | |
| GET | /establishments | Establishments | |
| GET | /establishments/:id | Establishments | |
| PATCH | /establishments/:id | Establishments | |
| DELETE | /establishments/:id | Establishments | |
| POST | /categories | Categories | |
| GET | /categories | Categories | |
| PATCH | /categories/reorder | Categories | |
| GET | /categories/:id | Categories | |
| PATCH | /categories/:id | Categories | |
| DELETE | /categories/:id | Categories | |
| POST | /products | Products | |
| GET | /products | Products | |
| PATCH | /products/reorder | Products | |
| GET | /products/:id | Products | |
| PATCH | /products/:id | Products | |
| PATCH | /products/:id/status | Products | |
| DELETE | /products/:id | Products | |
| GET | /products/:productId/options | ProductOptions | |
| POST | /products/:productId/options | ProductOptions | |
| PATCH | /product-options/groups/:id | ProductOptions | |
| DELETE | /product-options/groups/:id | ProductOptions | |
| POST | /product-options/groups/:groupId/items | ProductOptions | |
| PATCH | /product-options/items/:id | ProductOptions | |
| DELETE | /product-options/items/:id | ProductOptions | |
| POST | /carts | Carts | |
| GET | /carts/:id | Carts | |
| POST | /carts/:id/items | Carts | |
| PATCH | /carts/:id/items/:itemId | Carts | |
| DELETE | /carts/:id/items/:itemId | Carts | |
| POST | /carts/:id/apply-coupon | Carts | |
| POST | /carts/:id/remove-coupon | Carts | |
| POST | /carts/:id/calculate | Carts | |
| POST | /orders | Orders | |
| GET | /orders | Orders | |
| GET | /orders/:id | Orders | |
| PATCH | /orders/:id/status | Orders | |
| PATCH | /orders/:id/cancel | Orders | |
| PATCH | /orders/:id/confirm | Orders | |
| PATCH | /orders/:id/ready | Orders | |
| PATCH | /orders/:id/out-for-delivery | Orders | |
| PATCH | /orders/:id/delivered | Orders | |
| POST | /payments/create-intent | Payments | |
| POST | /payments/pix | Payments | |
| POST | /payments/card | Payments | |
| POST | /payments/webhook | Payments | |
| GET | /payments/:id/status | Payments | |
| POST | /customers | Customers | |
| GET | /customers | Customers | |
| GET | /customers/:id | Customers | |
| GET | /customers/:id/orders | Customers | |
| PATCH | /customers/:id | Customers | |
| POST | /coupons | Coupons | |
| GET | /coupons | Coupons | |
| GET | /coupons/:id | Coupons | |
| PATCH | /coupons/:id | Coupons | |
| DELETE | /coupons/:id | Coupons | |
| POST | /delivery-zones | DeliveryZones | |
| GET | /delivery-zones | DeliveryZones | |
| GET | /delivery-zones/:id | DeliveryZones | |
| PATCH | /delivery-zones/:id | DeliveryZones | |
| DELETE | /delivery-zones/:id | DeliveryZones | |
| GET | /settings/store | Settings | |
| PATCH | /settings/store | Settings | |
| PATCH | /settings/hours | Settings | |
| PATCH | /settings/branding | Settings | |
| PATCH | /settings/payment-methods | Settings | |
| PATCH | /settings/delivery | Settings | |
| GET | /reports/sales-summary | Reports | |
| GET | /reports/orders-by-day | Reports | |
| GET | /reports/top-products | Reports | |
| GET | /reports/payment-methods | Reports | |
| GET | /reports/customers | Reports | |
| GET | /reports/cancelled-orders | Reports | |
| GET | /reports/dashboard | Reports | |
| GET | /audit | Audit | |
| POST | /uploads/image | Uploads | |
| DELETE | /uploads/image/:id | Uploads | |

---

## 6 — Frontend (App)

**Framework:** Next.js (App Router).  
**Caminho:** `frontend/src/app`.

### Páginas detectadas

| Rota | Arquivo | Função |
|------|---------|--------|
| / | `page.tsx` | Página inicial |
| /[storeSlug] | `(public)/[storeSlug]/page.tsx` | Cardápio da loja (slug público) |
| /[storeSlug]/cart | `(public)/[storeSlug]/cart/page.tsx` | Carrinho |
| /[storeSlug]/checkout | `(public)/[storeSlug]/checkout/page.tsx` | Checkout |
| /[storeSlug]/order/[id] | `(public)/[storeSlug]/order/[id]/page.tsx` | Detalhe do pedido |
| /[storeSlug]/success | `(public)/[storeSlug]/success/page.tsx` | Sucesso (pós-pedido) |
| /[storeSlug]/failure | `(public)/[storeSlug]/failure/page.tsx` | Falha (pós-pedido) |

Consumo da API: serviços em `frontend/src/services/` (store.service, cart.service, order.service, payment.service, api); base URL via `NEXT_PUBLIC_API_URL` (constantes em `frontend/src/lib/constants.ts`).

---

## 7 — Admin

**Framework:** Next.js (App Router).  
**Caminho:** `admin/src/app`.  
**Scripts:** `dev` e `start` com `-p 3001` (produção informada: porta 3022).

### Telas detectadas

| Rota | Arquivo |
|------|---------|
| /login | `login/page.tsx` |
| /dashboard | `(dashboard)/dashboard/page.tsx` |
| /users | `(dashboard)/users/page.tsx` |
| /users/new | `(dashboard)/users/new/page.tsx` |
| /users/[id] | `(dashboard)/users/[id]/page.tsx` |
| /establishments | `(dashboard)/establishments/page.tsx` |
| /establishments/new | `(dashboard)/establishments/new/page.tsx` |
| /establishments/[id] | `(dashboard)/establishments/[id]/page.tsx` |
| /categories | `(dashboard)/categories/page.tsx` |
| /categories/new | `(dashboard)/categories/new/page.tsx` |
| /categories/[id] | `(dashboard)/categories/[id]/page.tsx` |
| /products | `(dashboard)/products/page.tsx` |
| /products/new | `(dashboard)/products/new/page.tsx` |
| /products/[id] | `(dashboard)/products/[id]/page.tsx` |
| /orders | `(dashboard)/orders/page.tsx` |
| /orders/[id] | `(dashboard)/orders/[id]/page.tsx` |
| /customers | `(dashboard)/customers/page.tsx` |
| /customers/[id] | `(dashboard)/customers/[id]/page.tsx` |
| /coupons | `(dashboard)/coupons/page.tsx` |
| /coupons/new | `(dashboard)/coupons/new/page.tsx` |
| /coupons/[id] | `(dashboard)/coupons/[id]/page.tsx` |
| /settings | `(dashboard)/settings/page.tsx` |
| /payments | `(dashboard)/payments/page.tsx` |
| /reports | `(dashboard)/reports/page.tsx` |

---

## 8 — Infraestrutura

| Item | Confirmado |
|------|------------|
| **Nginx** | Informado como ativo; arquivos de configuração não estão no repositório. Não foi possível confirmar com base na estrutura encontrada. |
| **PM2** | Informado para API, App e Admin; nenhum arquivo ecosystem no repositório listado. Não foi possível confirmar com base na estrutura encontrada. |
| **SSL** | Domínios HTTPS informados. Não foi possível confirmar certificados no repositório. |
| **Domínios** | api., app., admin.cardapio.nexoracloud.com.br (informados). |
| **Portas** | 3020 (API), 3021 (App), 3022 (Admin) (informadas). |

### Scripts e configuração (repositório)

- **Backend (raiz):** `npm run start` → nest start; `start:prod` → node dist/main; porta via `process.env.PORT` (default 3000). Prefixo da API: `process.env.API_PREFIX` (default `api`).
- **Frontend:** `npm run dev` (next dev), `build`, `start` — sem `-p` no package.json; porta padrão Next.js em dev é 3000.
- **Admin:** `npm run dev` (next dev -p 3001), `start` (next start -p 3001).
- **Variáveis de ambiente (nomes):** NODE_ENV, PORT, API_PREFIX, CORS_ORIGINS, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, UPLOAD_MAX_FILE_SIZE, UPLOAD_ALLOWED_MIME_TYPES (`.env.example`).

---

## 9 — O que já está funcional (confirmado na base de código)

- Autenticação (login, refresh, logout, me) e JWT global com @Public() para rotas públicas  
- CRUD de tenants, users, establishments, categories, products (incl. reorder e status)  
- Opcionais de produtos (grupos e itens) e vínculo N:N com produtos  
- Carrinho (criar, itens, cupom, calcular)  
- Pedidos (criar, listar, por id, atualizar status: confirm, ready, out-for-delivery, delivered, cancel)  
- Pagamentos (create-intent, pix, card, webhook, status)  
- Clientes e cupons (CRUD)  
- Zonas de entrega (CRUD)  
- Configurações da loja (store, hours, branding, payment-methods, delivery)  
- Relatórios (sales-summary, orders-by-day, top-products, payment-methods, customers, cancelled-orders, dashboard)  
- Auditoria (GET /audit)  
- Upload de imagens (POST/DELETE)  
- Health (GET /health, /health/db)  
- API pública do cardápio: loja por slug, categorias, produtos, produto por id, settings (sem auth)  
- Swagger em /api/docs  
- App público: cardápio por slug, carrinho, checkout, ordem, success/failure  
- Admin: login, dashboard, usuários, estabelecimentos, categorias, produtos, pedidos, clientes, cupons, configurações, pagamentos, relatórios  
- Slug público do cardápio: `/[storeSlug]` no App e `GET /api/public/store/:slug` na API  
- Seeds: `prisma/seed.ts` e `prisma/seed-demo-comercial.ts`; script `prisma:seed:demo` no package.json  

---

## 10 — O que aparenta estar incompleto (confirmável no código)

- **Super Admin / painel plataforma:** não existe módulo ou telas para gerenciar todos os tenants (apenas escopo por tenant no admin).  
- **Planos SaaS:** campo `Tenant.plan` existe no schema; não há validação de limites (ex.: número de estabelecimentos por plano) nem tela de planos.  
- **Billing / cobrança recorrente:** não há módulo de assinatura ou integração com gateway de pagamento recorrente.  
- **Onboarding automático:** não há fluxo de cadastro que crie tenant + establishment + usuário em uma única etapa.  
- **QR Code:** não há geração automática de QR no código; o link do cardápio é fixo por slug.  
- **Domínio personalizado por tenant:** não há campo ou lógica para domínio próprio (ex.: cardapio.restaurante.com.br).  
- **Pasta prisma/migrations:** não foi encontrada pasta com migrations no repositório; o estado real do banco em produção não foi confirmado.

---

# Resumo técnico — Estado atual do Cardápio Nexora

O sistema é um SaaS multi-tenant com:

- **Backend NestJS** com 20 módulos, 19 controllers, auth JWT (login, refresh, me), guard global e rotas públicas para o cardápio (`/api/public/store/:slug` e derivadas).  
- **Prisma** com 24 models (Tenant, User, Establishment, Category, Product, Order, Cart, Customer, Coupon, Payment, etc.) e enums para roles, status de pedido e pagamento.  
- **App Next.js** com cardápio por slug (`/[storeSlug]`), carrinho, checkout e páginas de sucesso/falha e detalhe do pedido.  
- **Admin Next.js** com gestão de usuários, estabelecimentos, categorias, produtos, pedidos, clientes, cupons, configurações, pagamentos e relatórios.  
- **Infraestrutura** (Nginx, PM2, SSL, portas 3020/3021/3022) informada como em uso; detalhes de configuração não estão no repositório analisado.

Este documento serve como **base oficial do projeto** para as próximas etapas de desenvolvimento.
