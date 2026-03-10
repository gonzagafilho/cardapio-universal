# RAIO-X E PLANO DE EVOLUÇÃO — Cardápio Nexora

**Fonte:** análise da base de código do repositório (`/home/servidor-dcnet/cardapio-universal`).  
**Contexto informado:** portas 3020 (API), 3021 (APP), 3022 (ADMIN); domínios api/app/admin.cardapio.nexoracloud.com.br.

**Importante:** As saídas dos BLOCOs A (Nginx), B (Prisma), C (PM2 logs), D (PM2 ecosystem) e E (estrutura) não foram fornecidas. Tudo o que depende delas está marcado com *[Requer saída do BLOCO X]*.

---

# RAIO-X

## Arquitetura (confirmado na base de código)

| Camada | Tecnologia | Caminho / Observação |
|--------|------------|----------------------|
| Backend | NestJS 10, Prisma 5 | `/home/servidor-dcnet/cardapio-universal` (raiz) |
| API prefix | `api` (env: API_PREFIX) | `src/config/env/env.ts`, `src/main.ts` |
| Frontend (App) | Next.js (App Router) | `/home/servidor-dcnet/cardapio-universal/frontend` |
| Admin | Next.js (App Router) | `/home/servidor-dcnet/cardapio-universal/admin` |
| Banco | PostgreSQL (Prisma) | DATABASE_URL no .env |
| Auth | JWT (passport-jwt) | APP_GUARD JwtAuthGuard global; rotas @Public() |
| Doc API | Swagger | `${apiPrefix}/docs` (ex.: /api/docs) |

**Rota pública do cardápio (slug):** já existe. API: `GET /api/public/store/:slug` (e categorias, produtos, settings). App: `/[storeSlug]` (ex.: `/restaurante-demo`, `/pizzaria-bella-massa`). *Não foi possível confirmar se Nginx/PM2 estão servindo corretamente sem BLOCO A/C.* [Requer saída BLOCO A/C]

---

## Infraestrutura

| Item | Status | Fonte |
|------|--------|--------|
| Portas | 3020 API, 3021 APP, 3022 ADMIN | Informado pelo usuário |
| Nginx | *Não confirmado* | [Requer BLOCO A — saída de `sudo sed -n '1,220p' /etc/nginx/sites-available/cardapio-nexora`] |
| SSL | Domínios HTTPS informados | Certificados/expiração não verificados sem comando openssl |
| PM2 | Nomes nexora-api, nexora-app, nexora-admin informados | Estado e logs não confirmados. [Requer BLOCO C e D] |

---

## Backend (confirmado na base de código)

- **Arquivo de entrada:** `src/main.ts` — escuta `env.port` (PORT), prefixo global `env.apiPrefix`, CORS via `env.corsOrigins`, Swagger em `api/docs`.
- **Módulos carregados (AppModule):** Auth, Users, Tenants, Establishments, Categories, Products, ProductOptions, Carts, Orders, Payments, Customers, Coupons, DeliveryZones, Settings, Reports, Uploads, Audit, Health, **StorePublic**.
- **Controllers existentes (19):** auth, users, tenants, establishments, categories, products, product-options, carts, orders, payments, customers, coupons, delivery-zones, settings, reports, uploads, audit, health, **store-public**.
- **Store público:** `StorePublicController` em `public/store` — `GET :slug`, `:slug/categories`, `:slug/products`, `:slug/products/:id`, `:slug/settings`; todos @Public().
- **Variáveis de ambiente usadas (código):** NODE_ENV, PORT, API_PREFIX, CORS_ORIGINS, DATABASE_URL, JWT_*, UPLOAD_* (ver `.env.example`). *Valores em produção não verificados.* [Requer BLOCO env]

---

## Frontend — App público (confirmado na base de código)

- **Rotas (App Router):**
  - `/` — página inicial (`frontend/src/app/page.tsx`)
  - `/[storeSlug]` — cardápio da loja (`(public)/[storeSlug]/page.tsx`)
  - `/[storeSlug]/cart` — carrinho
  - `/[storeSlug]/checkout` — checkout
  - `/[storeSlug]/order/[id]` — detalhe do pedido
  - `/[storeSlug]/success` — sucesso
  - `/[storeSlug]/failure` — falha
- **Consumo:** `getStoreBySlug`, `getStoreCategories`, `getStoreProducts`, `getStoreSettings` em `frontend/src/services/store.service.ts`; base URL via `NEXT_PUBLIC_API_URL` (default `http://localhost:3000/api`).
- **Slug público:** implementado. URL do cardápio = `https://app.cardapio.nexoracloud.com.br/{slug}` (ex.: `restaurante-demo`, `pizzaria-bella-massa`).

---

## Admin (confirmado na base de código)

- **Rotas (App Router):** login (`/login`); dashboard e CRUD sob `(dashboard)/`: dashboard, users, establishments, categories, products, orders, customers, coupons, settings, payments, reports.
- **Arquivos de página:** `admin/src/app/(dashboard)/**/page.tsx` (dashboard, users, establishments, categories, products, orders, customers, coupons, settings, payments, reports; new/edit por recurso).
- **API base:** `NEXT_PUBLIC_API_URL` (mesmo padrão que o app).

---

## Banco de dados (confirmado na base de código)

- **Schema:** `prisma/schema.prisma` — Tenant, Establishment, Category, Product, OptionalGroup, OptionalItem, StoreSettings, EstablishmentWorkingHours, Order, OrderItem, Cart, Customer, Coupon, Payment, etc.
- **Migrations:** existem em `prisma/migrations`. *Status real (pending/applied) não confirmado.* [Requer BLOCO B — `npx prisma migrate status`]
- **Seeds:** `prisma/seed.ts` (tenant cardapio-demo, establishment restaurante-demo); `prisma/seed-demo-comercial.ts` (Pizzaria Bella Massa, slug `pizzaria-bella-massa`). *Não foi possível confirmar se já foram executados em produção.* [Requer BLOCO B ou confirmação manual]

---

## Deploy

- **Caminhos informados:** API = `/home/servidor-dcnet/cardapio-universal`, APP = `.../frontend`, ADMIN = `.../admin`.
- **PM2:** nomes informados (nexora-api, nexora-app, nexora-admin). Config (ecosystem) e health *não confirmados.* [Requer BLOCO D e C]

---

# ETAPA 3 — O QUE JÁ ESTÁ PRONTO (confirmado na base de código)

- **API:** NestJS com prefixo `/api`, módulos de tenant, establishment, category, product, cart, order, auth, store-public, health, Swagger.
- **Prisma:** schema multi-tenant completo; repositório com pasta `prisma/migrations` e `schema.prisma` válido (validação possível com `npx prisma validate`).
- **Auth:** JWT global (JwtAuthGuard); decorator @Public() para rotas públicas; store-public sem auth.
- **Frontend (App):** cardápio por slug (`/[storeSlug]`), carrinho, checkout, sucesso/falha, ordem; serviços chamando API pública.
- **Admin:** estrutura de páginas para dashboard, usuários, estabelecimentos, categorias, produtos, pedidos, clientes, cupons, configurações, pagamentos, relatórios.
- **Slug público:** implementado (API `public/store/:slug` e App `/[storeSlug]`).
- **Seed comercial:** arquivo `prisma/seed-demo-comercial.ts` (Pizzaria Bella Massa) e doc em `docs/DEMO-COMERCIAL-RESTAURANTE.md`.

*Não confirmado sem saídas:* infraestrutura (Nginx, SSL, PM2), estado real do banco (migrations aplicadas, seeds rodados), erros em produção (logs). [Requer BLOCOs A, B, C]

---

# ETAPA 4 — PROBLEMAS OU LACUNAS

**Confirmados na base de código (possíveis lacunas):**

1. **StoreSettings vs Tenant:** cores (primaryColor, secondaryColor) estão no Tenant; frontend espera em settings — a API pública já foi ajustada para devolver isso em getSettings. Nenhuma alteração pendente necessária nesse ponto.
2. **Super Admin / multi-tenant global:** não existe módulo “super admin” (plataforma) para gerenciar todos os tenants; apenas escopo por tenant no admin.
3. **Planos / billing:** schema tem `Tenant.plan` (string basic/pro/enterprise) e `status`; não há módulo de assinatura, cobrança ou limites por plano.
4. **QR Code:** não há geração automática de QR no código; link do cardápio é fixo `/{slug}`; QR pode ser externo.
5. **Domínio personalizado:** não há suporte a domínio próprio por tenant (ex.: cardapio.restaurante.com.br).
6. **Onboarding:** não há fluxo automatizado de criação de tenant + establishment + primeiro usuário após signup.

*Não foi possível confirmar com as informações fornecidas:* erros nos logs PM2, migrations pendentes, configuração incompleta do Nginx, riscos atuais de produção. [Requer BLOCOs A, B, C]

---

# ETAPA 5 — O QUE FALTA PARA SER VENDÁVEL

| Bloco | Situação atual | O que falta |
|-------|----------------|-------------|
| **Seed comercial** | Arquivo e doc existem | Garantir execução em produção (e opcionalmente link na landing); validar dados no app. |
| **Demo restaurant** | Seed Pizzaria Bella Massa e slug `pizzaria-bella-massa` | Confirmar seed rodada e cardápio acessível em `https://app.../pizzaria-bella-massa`. |
| **QR Code** | Link fixo por slug | Opcional: endpoint ou página que devolva URL do cardápio + instrução para gerar QR (ou integração com gerador). |
| **Slug público** | Implementado (`/[storeSlug]`, API `public/store/:slug`) | Nenhum; eventualmente alias `/menu/:slug` se desejar URL alternativa. |
| **Super Admin SaaS** | Inexistente | Área (ou app) para: listar tenants, criar/suspender tenant, ver métricas globais, suporte. |
| **Planos SaaS** | Apenas campo `plan` no Tenant | Definir planos (limites de estabelecimentos, produtos, etc.) e aplicar limites no backend/admin. |
| **Billing** | Inexistente | Integração com gateway (Stripe, Mercado Pago, etc.) para assinatura/cobrança recorrente. |
| **Onboarding automático** | Inexistente | Fluxo: cadastro → criar tenant + establishment + usuário owner → redirecionar ao admin. |
| **Domínios customizados** | Inexistente | Permitir CNAME por tenant e rotear no Nginx ou no app (complexo). |

---

# ETAPA 6 — ORDEM EXATA DE DESENVOLVIMENTO

Prioridade: valor comercial, baixo risco, velocidade.

1. **Validar produção atual** — Rodar comandos dos BLOCOs A–E; corrigir erros de logs/migrations/Nginx se houver. *Sem alterar código.*  
2. **Garantir demo vendável** — Executar `npm run prisma:seed:demo` em produção (após backup do banco); validar `https://app.../pizzaria-bella-massa` e documentar link/QR para comerciais.  
3. **Super Admin mínimo** — Listar tenants, criar tenant, suspender/ativar; rota protegida por role SUPER_ADMIN; sem alterar Nginx/infra.  
4. **Planos e limites** — Definir planos (ex.: basic = 1 establishment, pro = 3); validar no backend ao criar establishment; exibir plano no admin.  
5. **Onboarding automático** — Página de cadastro (ou fluxo no admin) que crie tenant + establishment + user owner em uma transação; redirecionar para login.  
6. **QR Code (opcional)** — Página ou API que retorne URL do cardápio + texto para gerar QR (ou link para ferramenta externa).  
7. **Billing (fase 2)** — Integrar gateway de pagamento e amarrar ao plano/tenant.  
8. **Domínio personalizado (fase 3)** — Após estável; exige decisão de infra (Nginx wildcard ou proxy por tenant).

---

# ETAPA 7 — PROMPTS PARA CONTINUAR NO CURSOR

Cada prompt deve ser usado no Cursor com o projeto aberto em `/home/servidor-dcnet/cardapio-universal`. Manter modo produção segura (backup, alteração mínima, validação, rollback).

---

## PROMPT 12 — Criar seed comercial com restaurante demo

**Contexto técnico:** Já existe `prisma/seed-demo-comercial.ts` (Pizzaria Bella Massa, slug `pizzaria-bella-massa`) e `docs/DEMO-COMERCIAL-RESTAURANTE.md`. API pública mapeia produtos (promotionalPrice, optionGroups) e settings (primaryColor, openHours).

**Arquivos relevantes:**  
`/home/servidor-dcnet/cardapio-universal/prisma/seed-demo-comercial.ts`,  
`/home/servidor-dcnet/cardapio-universal/package.json` (script `prisma:seed:demo`),  
`/home/servidor-dcnet/cardapio-universal/docs/DEMO-COMERCIAL-RESTAURANTE.md`.

**O que fazer:**  
Garantir que a seed seja idempotente e documentar o comando de execução e rollback. Não alterar schema nem Nginx. Antes de rodar em produção: backup do banco (pg_dump). Comando de teste: abrir `https://app.cardapio.nexoracloud.com.br/pizzaria-bella-massa` após a seed.

**Anti-alucinação:** Só alterar os arquivos listados; não inventar novos seeds nem tabelas.

---

## PROMPT 13 — Criar slug público /menu/{slug}

**Contexto técnico:** O slug público já existe: App em `/[storeSlug]` e API em `GET /api/public/store/:slug`. Ou seja, o cardápio é acessado por `https://app.../restaurante-demo` ou `https://app.../pizzaria-bella-massa`. Não é necessário recriar; apenas confirmar rotas.

**Se quiser alias `/menu/:slug`:**  
Adicionar em `frontend/src/app/` uma rota `menu/[slug]/page.tsx` que redirecione (redirect 308) para `/${params.slug}` (ou reutilizar o mesmo componente da `(public)/[storeSlug]/page.tsx`).

**Arquivos a alterar (apenas se criar alias):**  
`/home/servidor-dcnet/cardapio-universal/frontend/src/app/menu/[slug]/page.tsx` (novo) ou redirecionamento em `next.config.*`.

**Modo produção segura:** Não alterar API nem Nginx; só frontend. Testar em dev antes.

**Anti-alucinação:** Não inventar rotas na API; a API já expõe `public/store/:slug`.

---

## PROMPT 14 — Gerar QR Code automático

**Contexto técnico:** Não há geração de QR no repositório. O link do cardápio é `https://app.cardapio.nexoracloud.com.br/{establishmentSlug}`. Opções: (A) endpoint ou página que retorne a URL + link para gerador externo; (B) biblioteca no frontend/admin para gerar imagem QR da URL.

**Arquivos a considerar:**  
Backend: novo endpoint em `store-public` ou `establishments` (ex.: `GET /api/public/store/:slug/qr-url` retornando `{ url }`).  
Frontend/Admin: página ou componente que use a URL e exiba QR (ex.: lib `qrcode` ou `react-qr-code`).  
Não alterar: Nginx, Prisma schema, migrations.

**Estrutura esperada:**  
- Dado o slug, URL = `process.env.NEXT_PUBLIC_APP_URL` ou base + `/${slug}`.  
- Opção simples: no admin, na tela do estabelecimento, mostrar "Link do cardápio: https://..." e botão "Gerar QR" que abra ferramenta externa ou renderize QR no cliente.

**Modo produção segura:** Apenas adição de rota ou componente; sem alterar rotas críticas nem banco.

**Anti-alucinação:** Não inventar tabela QR no banco; URL é derivada do slug.

---

## PROMPT 15 — Criar Super Admin SaaS

**Contexto técnico:** Existe role `SUPER_ADMIN` no schema (`prisma/schema.prisma`, enum Role). Admin atual é por tenant (JWT com tenantId). Super Admin precisa: (1) listar todos os tenants; (2) criar tenant; (3) suspender/ativar tenant; (4) talvez ver usuários/estabelecimentos por tenant. Backend já tem `TenantsModule` e `TenantsService`; possivelmente restringir algumas rotas a SUPER_ADMIN e criar endpoints ou expandir existentes.

**Arquivos a analisar/alterar:**  
`/home/servidor-dcnet/cardapio-universal/prisma/schema.prisma` (Role),  
`/home/servidor-dcnet/cardapio-universal/src/modules/tenants/tenants.controller.ts`,  
`/home/servidor-dcnet/cardapio-universal/src/common/guards/roles.guard.ts` (ou novo guard SuperAdmin),  
`/home/servidor-dcnet/cardapio-universal/admin/src/app/` — nova seção ou app para super-admin (ex.: `(super)/tenants/page.tsx`).

**Estrutura esperada:**  
- Guard que verifica `user.role === 'SUPER_ADMIN'`.  
- Rotas como `GET /tenants`, `POST /tenants`, `PATCH /tenants/:id` (status) protegidas por esse guard.  
- Admin: apenas usuários com SUPER_ADMIN acessam; pode ser subpath `/super/tenants` ou outro subdomínio (não alterar Nginx sem plano de rollback).

**Modo produção segura:** Backup antes; deploy em ramo; validar que usuários normais não acessam rotas super-admin.

**Anti-alucinação:** Usar apenas modelos e enums existentes (Tenant, Role); não criar novas tabelas sem especificação.

---

## PROMPT 16 — Sistema de planos

**Contexto técnico:** `Tenant.plan` (string) e `status` já existem no schema. Não há validação de limites (estabelecimentos, produtos, etc.) nem UI de planos.

**Arquivos a analisar:**  
`/home/servidor-dcnet/cardapio-universal/prisma/schema.prisma` (Tenant),  
`/home/servidor-dcnet/cardapio-universal/src/modules/tenants/tenants.service.ts`,  
`/home/servidor-dcnet/cardapio-universal/src/modules/establishments/establishments.service.ts` (validar limite ao criar),  
admin: página de planos ou exibição do plano atual.

**Estrutura esperada:**  
- Constantes de planos (ex.: basic = { maxEstablishments: 1 }, pro = { maxEstablishments: 3 }).  
- Ao criar establishment: verificar `count(establishments)` do tenant vs limite do plano.  
- Admin: exibir plano atual e, se necessário, tela para “trocar plano” (sem billing, apenas mudar campo até integrar pagamento).

**Modo produção segura:** Não alterar migrations; só lógica e constantes. Backup antes.

**Anti-alucinação:** Não inventar novas tabelas sem requisito; usar apenas o campo `plan` existente.

---

## PROMPT 17 — Onboarding automático

**Contexto técnico:** Não existe fluxo de cadastro que crie tenant + establishment + usuário em uma transação. Hoje tenant/establishment são criados pelo admin (usuário já logado em um tenant).

**Arquivos a considerar:**  
`/home/servidor-dcnet/cardapio-universal/src/modules/auth/auth.controller.ts` e `auth.service.ts`,  
`/home/servidor-dcnet/cardapio-universal/src/modules/tenants/tenants.service.ts`,  
`/home/servidor-dcnet/cardapio-universal/src/modules/establishments/establishments.service.ts`,  
`/home/servidor-dcnet/cardapio-universal/src/modules/users/users.service.ts`.  
Novo endpoint ex.: `POST /auth/register` ou `POST /onboarding` que: valide email/senha; crie Tenant (slug a partir do nome); crie Establishment (ex.: “Meu Restaurante”, slug único); crie User (TENANT_OWNER); opcionalmente StoreSettings e WorkingHours padrão; retorne token ou redirect para login.

**Estrutura esperada:**  
- DTO com nome da empresa, slug ou nome do estabelecimento, email, senha.  
- Transação Prisma: create Tenant → create Establishment → create User (tenantId, establishmentId).  
- Não alterar Nginx nem rotas públicas existentes; apenas adicionar rota.

**Modo produção segura:** Backup; deploy em ramo; validar criação e login após registro.

**Anti-alucinação:** Usar apenas modelos existentes (Tenant, Establishment, User); não inventar tabela “Onboarding”.

---

## PROMPT 18 — Domínio personalizado

**Contexto técnico:** Hoje o app é acessado por `https://app.cardapio.nexoracloud.com.br/{slug}`. Domínio personalizado (ex.: `cardapio.restaurante.com.br` apontando para o mesmo app) exige: (1) o tenant/establishment ter um campo como `customDomain`; (2) resolução do estabelecimento por host em vez de (ou além de) path; (3) Nginx com wildcard SSL ou proxy por domínio. É a mudança de maior impacto (infra + código).

**Arquivos a considerar:**  
`/home/servidor-dcnet/cardapio-universal/prisma/schema.prisma` (ex.: `Establishment.customDomain`),  
`/home/servidor-dcnet/cardapio-universal/src/modules/store-public/store-public.service.ts` (getStoreBySlug hoje; precisaria getStoreByHost ou similar),  
Nginx: *não alterar sem plano de backup e rollback.*

**Estrutura esperada (fase 1 — só backend):**  
- Campo opcional `customDomain` em Establishment; migração.  
- Endpoint público que, recebendo header Host ou parâmetro, resolva establishment por customDomain; fallback para slug na URL.  
- Frontend/App: em produção, usar window.location.host ou env para decidir se usa domínio customizado; mesma SPA.

**Modo produção segura:** Implementar primeiro resolução por domínio no backend e testes; Nginx em etapa separada, com documento de rollback.

**Anti-alucinação:** Não inventar CDN ou DNS; apenas campo + lógica de resolução; Nginx é fora do repositório.

---

# RESUMO

- **RAIO-X** e **Etapas 3–7** foram preenchidos com base **apenas na base de código** e nas informações que você forneceu (portas, domínios, caminhos).
- Tudo o que depende de **Nginx, PM2, migrations, logs** está marcado como *[Requer saída do BLOCO A/B/C/D]*.
- Para fechar a auditoria com certeza: cole as saídas dos BLOCOs A, B, C, D e E; com isso dá para preencher “o que está pronto em produção” e “problemas/lacunas” de forma definitiva e ajustar o plano e os prompts se necessário.
