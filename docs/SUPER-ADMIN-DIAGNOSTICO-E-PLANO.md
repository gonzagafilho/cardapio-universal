# Super Admin — Diagnóstico e plano

## Primeira análise obrigatória (confirmada no código)

### 1. Quais roles existem hoje no schema e no auth?

- **Prisma** (`prisma/schema.prisma`): enum `Role` = SUPER_ADMIN, TENANT_OWNER, TENANT_ADMIN, TENANT_STAFF.
- **Backend** (`src/common/constants/roles.ts`): ROLES = SUPER_ADMIN, TENANT_OWNER, TENANT_ADMIN, TENANT_STAFF, MANAGER, ATTENDANT, OPERATOR (os três últimos para compatibilidade).
- **Admin** (`admin/src/types/auth.ts`): Role inclui SUPER_ADMIN, TENANT_OWNER, etc.

### 2. Já existe role suficiente para super admin?

- **Sim.** SUPER_ADMIN está no schema e é usado nos controllers: `POST /tenants` e `DELETE /tenants` são `@Roles(ROLES.SUPER_ADMIN)`; `GET /tenants` permite SUPER_ADMIN e TENANT_OWNER (SUPER_ADMIN vê todos, TENANT_OWNER só o próprio tenant).

### 3. O módulo Tenants já possui operações administrativas reaproveitáveis?

- **Sim.** `TenantsService`: `findAll(user)` — SUPER_ADMIN retorna todos; `findOne(user, id)` com `_count: { establishments, users }`; `update(user, id, dto)` com status/plan; `remove` só SUPER_ADMIN. Falta apenas incluir `_count` na listagem para SUPER_ADMIN (hoje só em findOne).

### 4. O admin atual tem estrutura/layout que pode receber rotas de plataforma?

- **Sim.** `(dashboard)/layout.tsx` usa `DashboardLayout` (Sidebar + Topbar). Podemos criar grupo de rotas `(platform)` com layout próprio que verifica SUPER_ADMIN e redireciona; ou usar o mesmo DashboardLayout e apenas adicionar item de menu "Plataforma" visível só para SUPER_ADMIN. Opção escolhida: mesmo layout, novo item de menu condicional e rotas em `/platform/tenants`.

### 5. Já existe endpoint para listar tenants com filtros?

- **Listar sim; filtros não.** `GET /tenants` lista todos para SUPER_ADMIN (sem _count hoje) e um para TENANT_OWNER. Não há query params de filtro. Para v1 não é obrigatório filtro; podemos adicionar depois.

### 6. Existe algum risco do tenant enxergar dados globais?

- **Não, desde que o backend e o menu estejam corretos.** No backend, `findAll` para não-SUPER_ADMIN faz `where: { id: user.tenantId }` (só o próprio tenant). O risco seria o frontend chamar GET /tenants e exibir para TENANT_OWNER — ele já recebe só um registro. A separação é: menu "Plataforma" e rotas `/platform/*` só são exibidos/acessíveis para SUPER_ADMIN; o layout da área platform pode redirecionar não-SUPER_ADMIN para `/dashboard`.

---

## 1. Diagnóstico real — Arquivos a alterar

| # | Arquivo | Ação |
|---|---------|------|
| **Backend** | | |
| 1 | `src/modules/tenants/tenants.service.ts` | Em `findAll`, quando `user.role === ROLES.SUPER_ADMIN`, adicionar `include: { _count: { select: { establishments: true, users: true } } }` para a listagem trazer contagens. |
| **Admin** | | |
| 2 | `admin/src/lib/permissions.ts` | Adicionar `canAccessPlatform(role)` (role === 'SUPER_ADMIN') e item em MENU_ITEMS para "Plataforma" → `/platform/tenants`; em `canAccessPath` tratar `/platform`. |
| 3 | `admin/src/services/tenant.service.ts` | **Novo** — getTenants(), getTenant(id), updateTenant(id, dto). |
| 4 | `admin/src/types/tenant.ts` | **Novo** — tipo Tenant com id, name, slug, plan, status, isActive, createdAt, _count opcional. |
| 5 | `admin/src/app/(dashboard)/platform/tenants/page.tsx` | **Novo** — listagem de tenants (tabela) com colunas nome, slug, plano, status, estabelecimentos, usuários, criação; só renderiza se SUPER_ADMIN. |
| 6 | `admin/src/app/(dashboard)/platform/tenants/[id]/page.tsx` | **Novo** — detalhe do tenant + botão ativar/suspender (PATCH status). |
| 7 | `admin/src/components/layout/Sidebar.tsx` | Garantir que o novo item de menu (Plataforma) use ícone e path corretos (já vem de MENU_ITEMS). |

**Não alterar:** Nginx, PM2, auth, rotas existentes de tenants no backend, escopo do admin para usuários não-SUPER_ADMIN.

---

## 2. Plano técnico — Ordem de implementação

1. **Backend:** Ajustar `findAll` em TenantsService para incluir `_count` quando usuário for SUPER_ADMIN.
2. **Admin:** Criar tipo Tenant e tenant.service.ts (chamadas a GET /tenants, GET /tenants/:id, PATCH /tenants/:id).
3. **Admin:** Adicionar permissão e menu "Plataforma" (apenas SUPER_ADMIN) em permissions.ts.
4. **Admin:** Criar página listagem `(dashboard)/platform/tenants/page.tsx` com DataTable e checagem de role.
5. **Admin:** Criar página detalhe `(dashboard)/platform/tenants/[id]/page.tsx` com dados do tenant e ação de ativar/suspender (PATCH status).
6. **Rollback:** Reverter alteração no TenantsService; remover tenant.service, tipo tenant, páginas platform e item de menu.

---

## 3. Código (implementado)

- **Backend:** `src/modules/tenants/tenants.service.ts` — em `findAll`, para SUPER_ADMIN incluído `include: { _count: { select: { establishments: true, users: true } } }`.
- **Admin:** `admin/src/types/tenant.ts` (novo), `admin/src/services/tenant.service.ts` (novo), `admin/src/lib/permissions.ts` (canAccessPlatform, MENU_ITEMS plataforma, canAccessPath /platform), `admin/src/components/layout/Sidebar.tsx` (ícone platform), `admin/src/app/(dashboard)/platform/tenants/page.tsx` (novo), `admin/src/app/(dashboard)/platform/tenants/[id]/page.tsx` (novo).

---

## 4. Checklist final

- [ ] **Backup:** Nenhuma alteração em infra; opcional backup do branch.
- [ ] **Backend build:** `npm run build` na raiz; GET /tenants como SUPER_ADMIN deve retornar array com `_count` em cada item.
- [ ] **Admin build:** `npm run build` no admin.
- [ ] **Login como SUPER_ADMIN:** Verificar que o menu exibe "Plataforma" e que /platform/tenants lista os tenants.
- [ ] **Login como TENANT_OWNER:** Verificar que "Plataforma" não aparece e que acessar /platform/tenants manualmente redireciona ou nega (conforme implementação).
- [ ] **Detalhe e status:** Abrir um tenant, alterar status para suspenso e verificar que a listagem reflete; ativar novamente.
- [ ] **Rollback:** Reverter TenantsService; remover services/tenant.service, types/tenant, app/(dashboard)/platform e item Plataforma em MENU_ITEMS; rebuild.
