# Onboarding automático — Diagnóstico e plano

## Respostas ao primeiro passo obrigatório

### 1. Hoje como um tenant é criado no sistema?

- **Arquivo:** `src/modules/tenants/tenants.service.ts` — método `create(dto: CreateTenantDto)`.
- **Fluxo:** `TenantsController` expõe `POST /tenants` protegido por `JwtAuthGuard` e `@Roles(ROLES.SUPER_ADMIN)`. Apenas SUPER_ADMIN pode criar tenant. Criação com `name`, `slug` (único), `plan` e `status` opcionais.
- **Conclusão:** Não existe criação de tenant por usuário final; apenas pelo super admin.

### 2. Hoje como um user é criado e vinculado ao tenant?

- **Arquivo:** `src/modules/users/users.service.ts` — método `create(tenantId: string, dto: CreateUserDto)`.
- **Fluxo:** `POST /users` exige JWT; `tenantId` vem do token (`@TenantId()`). Cria usuário com `tenantId`, `name`, `email`, `password` (hash bcrypt), `role`, `establishmentId` opcional.
- **Conclusão:** Usuário é sempre criado no contexto de um tenant já existente e por quem já está autenticado.

### 3. Hoje como um establishment é criado?

- **Arquivo:** `src/modules/establishments/establishments.service.ts` — método `create(tenantId: string, dto: CreateEstablishmentDto)`.
- **Fluxo:** `POST /establishments` exige JWT; `tenantId` do token. Slug derivado de `dto.slug ?? dto.name`. Retorna establishment com `tenantId`, `name`, `slug`, etc.
- **Conclusão:** Estabelecimento é criado apenas por usuário autenticado do tenant.

### 4. Quais campos mínimos já existem nos DTOs e models?

- **CreateTenantDto:** `name`, `slug` (obrigatórios); `plan`, `status` opcionais.
- **CreateUserDto:** `name`, `email`, `password`, `role` (obrigatórios); `establishmentId`, `isActive` opcionais.
- **CreateEstablishmentDto:** `name` e `slug` com `MinLength(2)` (na prática obrigatórios); demais opcionais (phone, whatsapp, description, address, city, state, zipCode, etc.).
- **StoreSettings (Prisma):** `tenantId`, `establishmentId`; opcionais: `deliveryFee`, `minimumOrderAmount`, `acceptsDelivery`, `acceptsPickup`, `acceptsDineIn`, `currency`. Criado via `SettingsService.getStore()` (upsert) quando não existe.

### 5. Já existe alguma tela que possa ser reaproveitada para onboarding?

- **Login:** `admin/src/app/login/page.tsx` — formulário de e-mail e senha; redireciona para `/dashboard` após login. Pode ganhar link “Criar minha conta” para `/onboarding`.
- **Formulários existentes:** `EstablishmentForm` (nome, slug, phone, whatsapp, etc.) e lógica de tenants/establishments podem ser referência; não é necessário reutilizar o mesmo componente no wizard para não acoplar ao CRUD protegido.
- **Conclusão:** Nova tela de onboarding (stepper/wizard); login permanece e ganha link para essa tela.

### 6. O login atual permite redirecionar por estado inicial do tenant?

- **Arquivo:** `admin/src/contexts/AuthContext.tsx` — após `login()` chama `router.push('/dashboard')` de forma fixa.
- **Conclusão:** Não há redirecionamento condicional por “onboarding incompleto”. Podemos manter assim: após onboarding o usuário já é redirecionado para dashboard (ou para settings do estabelecimento). Campo `onboardingCompleted` pode ser adicionado depois para redirecionar primeiro acesso.

### 7. Existe algum campo no banco para marcar onboarding concluído?

- **Prisma:** Model `Tenant` em `prisma/schema.prisma` não possui campo `onboardingCompleted` (nem equivalente).
- **Proposta (opcional para v1):** Adicionar `onboardingCompleted Boolean @default(false)` em `Tenant` para uso futuro (ex.: redirecionar primeiro login para conclusão de passos ou exibir mensagem de boas-vindas). Para a primeira entrega, **não** é obrigatório: o fluxo pode apenas criar tenant + user + establishment e redirecionar para o dashboard sem checar esse campo. Assim evitamos migration no primeiro passo em ambientes sem migrations versionadas.

---

## 1. Diagnóstico real — Arquivos a alterar

| # | Arquivo | Ação / Motivo |
|---|---------|----------------|
| **Backend** | | |
| 1 | `src/modules/auth/dto/onboarding.dto.ts` | **Novo** — DTO único para o payload do onboarding (empresa, loja, dono). |
| 2 | `src/modules/auth/onboarding.service.ts` | **Novo** — Serviço que em transação Prisma cria tenant → establishment → user (TENANT_OWNER, establishmentId) → StoreSettings; depois chama `AuthService.login()` e retorna `AuthResponse`. |
| 3 | `src/modules/auth/auth.controller.ts` | Adicionar `POST /auth/onboarding` `@Public()`, chamando `OnboardingService.register(dto)`. |
| 4 | `src/modules/auth/auth.module.ts` | Registrar `OnboardingService` e importar `PrismaModule` (se ainda não estiver disponível globalmente). |
| 5 | `src/modules/auth/dto/index.ts` | Exportar `OnboardingDto` (e validações se houver). |
| **Admin** | | |
| 6 | `admin/src/app/onboarding/page.tsx` | **Novo** — Tela de onboarding (stepper: empresa → loja → confirmação) que envia dados para `POST /auth/onboarding` e, em sucesso, grava tokens/usuário e redireciona para dashboard (ou settings). |
| 7 | `admin/src/services/auth.service.ts` | Adicionar `onboardingRegister(payload)` que chama `POST /auth/onboarding` e aplica a mesma lógica de armazenamento de tokens/usuário do login. |
| 8 | `admin/src/app/login/page.tsx` | Adicionar link “Criar minha conta” (ou “Cadastrar”) apontando para `/onboarding`. |
| 9 | `admin/src/contexts/AuthContext.tsx` | Expor `registerOnboarding(data)` que chama o novo método do auth.service, atualiza `user` e redireciona para `/dashboard` (ou `/establishments/:id` do primeiro estabelecimento). |

**Não alterar:** Nginx, PM2, Swagger (apenas nova rota documentada), rotas existentes de tenants/users/establishments, app público, Prisma schema (a menos que se opte por adicionar `onboardingCompleted` depois).

---

## 2. Plano técnico — Sequência

1. **Backend — DTO:** Criar `OnboardingDto` com: `companyName`, `companySlug`, `ownerName`, `email`, `password`, `storeName`, `storeSlug?`, `phone?`, `storeDescription?`. Validações: `MinLength`, `IsEmail`, slug em lowercase.
2. **Backend — OnboardingService:** Implementar `register(dto)` com `this.prisma.$transaction`: (a) criar Tenant (name, slug, plan: 'basic', status: 'active'); (b) criar Establishment (tenantId, name, slug); (c) criar User (tenantId, establishmentId, name, email, passwordHash, role: TENANT_OWNER); (d) criar StoreSettings (tenantId, establishmentId, acceptsDelivery/Pickup/DineIn: true, currency: 'BRL'). Em seguida chamar `this.authService.login({ email: dto.email, password: dto.password }, tenant.id)` e retornar o resultado (AuthResponse).
3. **Backend — Controller e módulo:** `POST /auth/onboarding` `@Public()`; registrar OnboardingService no AuthModule.
4. **Admin — auth.service:** Função `onboardingRegister(payload)` → `apiPost('/auth/onboarding', payload)` e mesma persistência de token/refresh/user que no login.
5. **Admin — AuthContext:** Método `registerOnboarding(data)` que chama `onboardingRegister`, atualiza estado e redireciona para `/dashboard`.
6. **Admin — Tela onboarding:** Página `/onboarding` com stepper (etapa 1: empresa; etapa 2: loja; etapa 3: confirmação). Ao submeter, chamar `registerOnboarding`; em sucesso, redirecionar.
7. **Admin — Login:** Link “Criar minha conta” para `/onboarding`.
8. **Rollback:** Remover endpoint, serviço e DTO; remover tela e link; reverter alterações no AuthContext e auth.service.

---

## 3. Código (implementado)

- **Backend:** `src/modules/auth/dto/onboarding.dto.ts` (novo), `src/modules/auth/onboarding.service.ts` (novo), `src/modules/auth/auth.controller.ts` (endpoint `POST /auth/onboarding`), `src/modules/auth/auth.module.ts` (OnboardingService), `src/modules/auth/dto/index.ts` (export OnboardingDto).
- **Admin:** `admin/src/services/auth.service.ts` (onboardingRegister + OnboardingPayload), `admin/src/contexts/AuthContext.tsx` (registerOnboarding), `admin/src/app/onboarding/page.tsx` (novo — stepper 4 passos), `admin/src/app/login/page.tsx` (link “Criar minha conta” para `/onboarding`).

---

## 4. Checklist final

- [ ] **Backup:** Nenhuma alteração em Nginx/PM2; opcional: backup do banco antes de deploy.
- [ ] **Build backend:** `npm run build` na raiz; testes manuais em `POST /api/auth/onboarding` (payload válido) devem retornar 201 e body com `user`, `accessToken`, `tokens`.
- [ ] **Tenant slug único:** Enviar mesmo `companySlug` duas vezes; segunda deve retornar 409 ou mensagem de conflito.
- [ ] **Login após onboarding:** Após concluir onboarding, verificar redirecionamento para dashboard e acesso às telas (estabelecimentos, etc.).
- [ ] **Cardápio e QR:** Após onboarding, acessar Estabelecimentos → editar o estabelecimento → conferir link do cardápio e QR Code já disponíveis.
- [ ] **Admin build:** `npm run build` no admin; acessar `/onboarding` sem estar logado; preencher os 4 passos e submeter; verificar que não quebra login existente.
- [ ] **Link no login:** Em `/login`, clicar em “Criar minha conta” e ser levado a `/onboarding`.
- [ ] **Rollback:** Remover `POST /auth/onboarding`, `OnboardingService`, `OnboardingDto` e seus arquivos; remover página onboarding, link e método no AuthContext/auth.service; rebuild backend e admin.
