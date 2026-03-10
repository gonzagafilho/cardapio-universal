# RAIO-X FINAL DO NEXORA

Relatório técnico de auditoria do sistema (baseado na estrutura real do código).  
Sem alteração de código, Nginx, PM2 ou DNS.

---

## 1 — ARQUITETURA FINAL DO NEXORA

### Backend

- **Stack:** NestJS, Prisma, JWT, PostgreSQL (via `DATABASE_URL`).
- **Entrada:** API REST em `/api` (prefixo conforme proxy); guards globais: `JwtAuthGuard`, `ValidationPipe`, `AllExceptionsFilter`, `TransformInterceptor`.
- **Módulos confirmados no `app.module.ts`:**
  - Config, Prisma, Auth, Users, Tenants, Establishments, Categories, Products, ProductOptions, Carts, Orders, Payments, Customers, Coupons, DeliveryZones, Settings, Reports, Uploads, Audit, Health, **StorePublic**, **Plans**, **Billing**.
- **Controllers (rotas):**
  - `auth`: onboarding, login, refresh, logout, me
  - `tenants`: CRUD + listagem (Super Admin / tenant)
  - `establishments`: CRUD
  - `categories`, `products`, `product-options`: CRUD + reorder
  - `carts`: create, get, items, coupon, calculate
  - `orders`: CRUD + status (confirm, cancel, ready, out-for-delivery, delivered)
  - `payments`: create-intent, pix, card, webhook, status (pagamento de **pedido**)
  - `customers`, `coupons`, `delivery-zones`: CRUD
  - `settings`: store, hours, branding, payment-methods, delivery
  - `reports`: sales-summary, orders-by-day, top-products, payment-methods, customers, cancelled-orders, dashboard
  - `uploads`: image upload/delete
  - `audit`: list
  - `health`: ping, db
  - **`public/store`:** by-host (query `host=`), :slug, :slug/categories, :slug/products, :slug/products/:id, :slug/settings
  - **`billing`:** subscription (GET, PATCH plan), subscription/cancel, subscription/reactivate, invoices

### Frontend público (app cardápio)

- **Stack:** Next.js (App Router).
- **Rotas confirmadas:**
  - `/` — landing quando host = padrão; **cardápio por domínio custom** quando host ≠ `NEXT_PUBLIC_APP_HOST`
  - `/[storeSlug]` — cardápio por **slug** (home)
  - `/[storeSlug]/cart`, `/[storeSlug]/checkout`, `/[storeSlug]/success`, `/[storeSlug]/failure`, `/[storeSlug]/order/[id]`
  - `/cart`, `/checkout`, `/success`, `/failure`, `/order/[id]` — mesmas telas quando **domínio custom** (resolução por host)
- **Resolução da loja:** por **slug** (path) ou por **host** (API `GET /public/store/by-host?host=...`).

### Admin

- **Stack:** Next.js (App Router), autenticação JWT (tokens no storage).
- **Páginas confirmadas:**
  - `login`, `onboarding`
  - Dashboard: `dashboard`, `establishments` (lista, new, [id]), `categories` (lista, new, [id]), `products` (lista, new, [id]), `orders` (lista, [id]), `customers` (lista, [id]), `payments`, `coupons` (lista, new, [id]), `reports`, **`billing`**, `settings`, `users` (lista, new, [id])
  - **Platform (Super Admin):** `platform/tenants`, `platform/tenants/[id]`
- **Permissões:** Por role (SUPER_ADMIN, TENANT_OWNER, TENANT_ADMIN, MANAGER, etc.); `canAccessPlatform` só SUPER_ADMIN; `canAccessBilling` para assinatura; menu e `canAccessPath` por rota.

### Banco

- **Provider:** PostgreSQL.
- **ORM:** Prisma.
- **Models confirmados no schema:** Tenant, User, Establishment, Category, Product, OptionalGroup, OptionalItem, ProductOptionalGroup, EstablishmentWorkingHours, StoreSettings, Banner, Coupon, Customer, CustomerAddress, Order, OrderItem, OrderItemOption, Payment, Table, Cart, CartItem, DeliveryZone, AuditLog, **Subscription**, **SubscriptionInvoice**, **BillingEvent**.
- **Tenant:** plan (basic/pro/enterprise), status (active/suspended/cancelled), slug único.
- **Establishment:** slug (único por tenant), **customDomain** (opcional, único global).

### Infraestrutura (confirmada no contexto)

- **Ambiente:** Ubuntu Server, Nginx, PM2, SSL.
- **Domínios:** api.cardapio.nexoracloud.com.br, app.cardapio.nexoracloud.com.br, admin.cardapio.nexoracloud.com.br.
- **Não foi possível confirmar no repositório:** existência ou localização da pasta `prisma/migrations` (pode estar fora do repo ou não versionada).

---

## 2 — FEATURES CONFIRMADAS NO SISTEMA

Lista do que **existe no código** (sem inventar):

| Feature | Onde está |
|--------|------------|
| Auth JWT | AuthModule: login, refresh, logout, me; guards e decorators |
| Multi-tenant | Tenant no schema; tenantId em recursos; TenantsModule; Super Admin |
| Onboarding automático | Auth: POST onboarding (cria Tenant + Establishment + User) |
| CRUD Estabelecimentos | EstablishmentsModule; PlansService.checkEstablishmentsLimit no create |
| CRUD Categorias | CategoriesModule |
| CRUD Produtos | ProductsModule; opcionais (ProductOptionsModule) |
| Carrinho | CartsModule (create, items, coupon, calculate) |
| Pedidos | OrdersModule (create, list, status) |
| Pagamentos (pedido) | PaymentsModule (create-intent, pix, card, webhook) — **não** billing SaaS |
| Clientes | CustomersModule |
| Cupons | CouponsModule |
| Zonas de entrega | DeliveryZonesModule |
| Configurações da loja | SettingsModule (store, hours, branding, delivery) |
| Relatórios | ReportsModule |
| Upload de imagens | UploadsModule |
| Auditoria | AuditModule |
| Health | HealthModule |
| **API pública do cardápio** | StorePublicModule: store por slug e por host (by-host) |
| **App público por slug** | Frontend: /[storeSlug] e subpáginas |
| **App público por domínio custom** | Frontend: /, /cart, etc. quando host ≠ APP_HOST; getStoreByHost |
| **QR Code do cardápio** | Admin: CardapioQRSection (APP_PUBLIC_URL + slug); página do establishment [id] |
| **Super Admin** | Platform: tenants lista e [id]; ativar/suspender; troca de plano por tenant |
| **Planos SaaS** | PlansModule; PLAN_LIMITS (basic/pro/enterprise); checkEstablishmentsLimit, checkUsersLimit |
| **Billing SaaS** | BillingModule; Subscription, SubscriptionInvoice, BillingEvent; getSubscription, changePlan, cancel, reactivate, invoices; tela Assinatura no admin |
| **Domínio personalizado** | Establishment.customDomain; validação; resolveStore(host, slug); GET by-host; admin: campo + instrução CNAME |

---

## 3 — CHECKLIST DE PRODUÇÃO

Validar cada item **antes de considerar produção pronta**:

| Item | O que validar |
|------|-------------------------------|
| **Prisma / migrations** | Migrations aplicadas no banco de produção (schema inclui Subscription, SubscriptionInvoice, BillingEvent, customDomain). Não foi possível confirmar pasta migrations no repo. |
| **Build backend** | `npm run build` na raiz (NestJS) sem erros. |
| **Build frontend** | `npm run build` no diretório do frontend (Next.js) sem erros. |
| **Build admin** | `npm run build` no diretório admin (Next.js) sem erros. |
| **Validação domínio custom** | DTO com formato hostname; conflito de domínio retorna 409. |
| **Fallback slug** | GET /public/store/:slug e app em app.../slug funcionando; lojas com customDomain acessíveis também por slug. |
| **QR Code** | Link gerado = APP_PUBLIC_URL + slug; abrir em nova aba e carregar cardápio. |
| **Onboarding** | Fluxo completo: criar tenant + establishment + user; login após onboarding. |
| **Super Admin** | Acesso à plataforma/tenants; ver/editar tenant; ativar/suspender; trocar plano. |
| **Planos** | Criar establishment/usuário até o limite do plano; acima do limite retornar 400 com mensagem comercial. |
| **Billing** | GET/PATCH subscription, cancel, reactivate, invoices; tela Assinatura no admin exibe dados e histórico. |

---

## 4 — DEPENDÊNCIAS DE INFRAESTRUTURA

Separação **aplicação vs externo** (conforme `docs/DOMINIO-PERSONALIZADO-INFRA.md`):

| Responsabilidade | Quem faz |
|------------------|----------|
| Resolver loja por slug ou host, salvar customDomain, exibir no admin | **Sistema** |
| Autenticação, limites de plano, billing (modelagem e endpoints) | **Sistema** |
| Apontar domínio para o servidor (CNAME ou A) | **Configuração externa (DNS)** |
| Atender vários hosts no mesmo app (proxy reverso) | **Nginx (ou equivalente)** |
| Certificado HTTPS (domínio principal e domínios custom) | **SSL (Let's Encrypt, wildcard, etc.)** |
| Processos (Node/Next) em produção | **PM2 (ou equivalente)** |

Não há automação de DNS, Nginx ou SSL no código; domínio personalizado exige configuração manual de DNS, Nginx e certificado.

---

## 5 — O QUE FALTA PARA O PRODUTO SER VENDÁVEL

Foco em **comercial e divulgação**, sem inventar features técnicas:

| Item | Descrição |
|------|------------|
| **Landing page** | Página de marketing do produto (ex.: nexoracloud.com.br ou cardapio.nexoracloud.com.br) para visitantes não logados. O app público hoje tem apenas landing mínima (“Cardápio Universal” + link exemplo). |
| **Página pública de planos** | Conteúdo estático ou dinâmico com planos (Basic, Pro, Enterprise), preços e benefícios, acessível sem login. |
| **Fluxo de compra** | Cadastro/contratação do plano (formulário, redirecionamento para pagamento, etc.). Billing no código não implementa cobrança real nem gateway; apenas modelo e endpoints administrativos. |
| **Demo comercial** | Ambiente ou tenant de demonstração (seed/dados de exemplo) para prospect testar o cardápio e o admin. |
| **Canal de suporte** | Contato, FAQ ou documentação para o cliente (fora do escopo do código auditado). |

---

## RESUMO DO RESULTADO

| Pergunta | Resposta |
|----------|----------|
| **Nexora está tecnicamente pronto?** | **Sim.** Backend, front público (slug + domínio custom), admin, planos, billing (base), domínio personalizado e integrações entre eles existem no código. |
| **Pronto para produção?** | **Depende da validação.** É necessário rodar o checklist (builds, migrations aplicadas, fluxos críticos e infra configurada). Migrations não foram localizadas no repo. |
| **Pronto para vender?** | **Não completo.** Falta landing, página de planos pública, fluxo de compra e, opcionalmente, demo e suporte documentado. O núcleo do produto (cardápio, pedidos, admin, planos, billing base) está implementado. |

---

*Documento gerado com base na estrutura real do repositório. Nenhuma alteração foi feita em Nginx, PM2 ou DNS.*
