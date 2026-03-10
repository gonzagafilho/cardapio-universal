# Planos SaaS — Diagnóstico e plano

## Primeira análise obrigatória (confirmada no código)

### 1. Como Tenant.plan está modelado hoje?

- **Arquivo:** `prisma/schema.prisma` — campo `plan String @default("basic")` com comentário `// basic, pro, enterprise`.
- **Tipo:** string, não enum.

### 2. É string, enum ou outro formato?

- **String.** DTOs usam `@IsIn(['basic', 'pro', 'enterprise'])` em CreateTenantDto e UpdateTenantDto.

### 3. Onde validar limite?

- **Criação de establishment:** `EstablishmentsService.create(tenantId, dto)` — ponto único; antes do `prisma.establishment.create` validar se o tenant já atingiu o limite de estabelecimentos do plano.
- **Criação de user:** `UsersService.create(tenantId, dto)` — idem para usuários.
- **Helper central:** Criar um `PlansService` que concentra limites e métodos `checkEstablishmentsLimit(tenantId)` e `checkUsersLimit(tenantId)`; lança exceção amigável se acima do limite. Nenhum guard genérico necessário; a validação é por recurso no service.

### 4. Já existe tela de tenant/settings que mostre plano atual?

- **Settings:** `admin/src/app/(dashboard)/settings/page.tsx` existe mas não exibe plano nem uso. Podemos adicionar um bloco "Seu plano" (plano, uso atual, limites).
- **Platform tenant detail:** `admin/src/app/(dashboard)/platform/tenants/[id]/page.tsx` já exibe plano (texto) e _count; falta exibir limites e permitir troca de plano.

### 5. Existe lugar no admin/super admin para editar o plano do tenant?

- **Sim.** Super Admin já usa `updateTenant(id, dto)` em `platform/tenants/[id]` para status. O `UpdateTenantDto` já inclui `plan`; basta adicionar na tela um controle (select) para alterar o plano e chamar `updateTenant(id, { plan })`.

---

## 1. Diagnóstico real — Arquivos a alterar

| # | Arquivo | Ação |
|---|---------|------|
| **Backend** | | |
| 1 | `src/common/constants/plans.ts` | **Novo** — constantes dos planos e limites (basic, pro, enterprise). |
| 2 | `src/modules/plans/plans.service.ts` | **Novo** — getLimits(plan), checkEstablishmentsLimit(tenantId), checkUsersLimit(tenantId). |
| 3 | `src/modules/plans/plans.module.ts` | **Novo** — exporta PlansService. |
| 4 | `src/modules/establishments/establishments.module.ts` | Importar PlansModule; EstablishmentsService injetar PlansService e chamar check antes de create. |
| 5 | `src/modules/establishments/establishments.service.ts` | Antes de `prisma.establishment.create`, chamar `plansService.checkEstablishmentsLimit(tenantId)`. |
| 6 | `src/modules/users/users.module.ts` | Importar PlansModule; UsersService injetar PlansService. |
| 7 | `src/modules/users/users.service.ts` | Antes de criar usuário, chamar `plansService.checkUsersLimit(tenantId)`. |
| 8 | `src/app.module.ts` | Importar PlansModule. |
| **Admin** | | |
| 9 | `admin/src/lib/plans.ts` | **Novo** — constantes de limites e labels para exibição (espelho do backend). |
| 10 | `admin/src/app/(dashboard)/platform/tenants/[id]/page.tsx` | Exibir limites e uso; select para trocar plano e PATCH. |
| 11 | `admin/src/app/(dashboard)/settings/page.tsx` | Bloco "Seu plano" com plano atual, uso e limites (getTenant(user.tenantId)). |

**Não alterar:** Prisma schema (plan já existe); Nginx, PM2; billing não implementado neste escopo.

---

## 2. Plano técnico — Sequência

1. **Backend:** Criar `common/constants/plans.ts` com limites por plano (establishments, users).
2. **Backend:** Criar `PlansService` (ler tenant, contar estabelecimentos/usuários, comparar com limite; lançar BadRequestException com mensagem comercial).
3. **Backend:** Criar `PlansModule` e registrar em `AppModule`.
4. **Backend:** Em `EstablishmentsModule` importar `PlansModule`; em `EstablishmentsService.create` chamar `plansService.checkEstablishmentsLimit(tenantId)`.
5. **Backend:** Em `UsersModule` importar `PlansModule`; em `UsersService.create` chamar `plansService.checkUsersLimit(tenantId)`.
6. **Admin:** Criar `lib/plans.ts` com os mesmos limites e labels para UI.
7. **Admin:** Na página platform/tenants/[id], adicionar seção de limites (limite vs uso) e select para alterar plano (PATCH).
8. **Admin:** Na página Settings, buscar tenant (getTenant(user.tenantId)) e exibir card "Seu plano" com plano, uso e limites.
9. **Rollback:** Remover PlansModule e uso nos services; remover constantes e trechos de UI de plano.

---

## 3. Código

(Implementação nos arquivos listados.)

---

## 4. Checklist final

- [ ] **Backend build:** `npm run build` sem erros.
- [ ] **Limite estabelecimentos:** Tenant com plano basic (limite 1) não pode criar segundo estabelecimento; resposta 400 com mensagem clara.
- [ ] **Limite usuários:** Tenant com plano basic (limite 3) não pode criar quarto usuário; resposta 400 com mensagem clara.
- [ ] **Tenant já acima do limite:** Quem já tem mais que o limite (ex.: 2 estab. em plano basic) continua usando; apenas novas criações são bloqueadas.
- [ ] **Super Admin:** Em platform/tenants/[id], alterar plano e ver listagem/contagens corretas; novo limite passa a valer na próxima criação.
- [ ] **Settings:** Logado como tenant owner, em Configurações ver "Seu plano" com uso e limites.
- [ ] **Rollback:** Reverter commits ou remover PlansModule, chamadas nos services e blocos de UI de plano; rebuild.
