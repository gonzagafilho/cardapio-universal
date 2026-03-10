# Billing recorrente SaaS – Diagnóstico e plano técnico

## 1. Diagnóstico real

### 1.1 O módulo Payments atual trata pagamento do cliente final do pedido ou já suporta assinatura SaaS?

**Resposta:** O módulo Payments trata **exclusivamente pagamento do pedido** (cliente final do cardápio).

**Evidência:**
- `prisma/schema.prisma`: modelo `Payment` possui `orderId`, `establishmentId`, `tenantId`; comentário: "transação de pagamento vinculada ao pedido".
- `src/modules/payments/payments.service.ts`: `createIntent`, `createPix`, `createCard` recebem `orderId` e criam pagamento ligado ao pedido. Sem referência a assinatura ou tenant como “cliente a ser cobrado”.
- `src/modules/payments/payments.controller.ts`: endpoints `POST /payments/create-intent`, `POST /payments/pix`, `POST /payments/card` são todos no contexto do pedido.

**Conclusão:** Não usar o módulo Payments para assinatura. Cobrança recorrente SaaS deve ser **separada**.

---

### 1.2 Existe provider/gateway já preparado no projeto?

**Resposta:** Não. Apenas placeholders.

**Evidência:**
- `payments.service.ts`: retorno com `clientSecret: null` e `message: 'Integração de pagamento a ser implementada'`; `webhook()` retorna `{ received: true, provider }` sem lógica real.
- Nenhum arquivo de config (Stripe, Mercado Pago, etc.) ou variável de ambiente de gateway de assinatura encontrado.

**Conclusão:** Preparar estrutura de billing para futura integração com gateway; **não ativar fluxo real** neste passo.

---

### 1.3 Existe model no Prisma para assinatura, fatura, ciclo, status ou histórico de cobrança?

**Resposta:** Não.

**Evidência:**
- `prisma/schema.prisma`: não há modelo `Subscription`, `SubscriptionInvoice`, `BillingEvent` nem equivalente. Há apenas `Payment` (pedido), `Order`, `Tenant` (com `plan` e `status`).

**Conclusão:** É necessário **criar** a modelagem de billing (Fase 1).

---

### 1.4 Qual o melhor desenho: novo módulo de billing ou expansão do Payments com separação de contexto?

**Resposta:** **Novo módulo de billing**, separado do Payments.

**Motivos:**
- Payments é domínio de “pagamento de pedido”; billing é “cobrança recorrente do tenant”. Responsabilidades distintas.
- Evita acoplamento e risco de quebrar o CRUD de pagamentos de pedidos.
- Rollback simples: desativar/remover apenas o BillingModule.
- Manter Payments intacto para produção; billing pode evoluir (gateway, webhooks) sem tocar em Orders/Payments.

---

### Arquivos reais envolvidos (referência)

| Área | Caminho |
|------|--------|
| Schema DB | `prisma/schema.prisma` |
| Payments (não alterar) | `src/modules/payments/payments.service.ts`, `payments.controller.ts`, `payments.module.ts` |
| Tenant / plano | `src/modules/tenants/`, `src/common/constants/plans.ts`, `src/modules/plans/` |
| App root | `src/app.module.ts` |
| Admin – tenants | `admin/src/app/(dashboard)/platform/tenants/[id]/page.tsx` |
| Admin – settings | `admin/src/app/(dashboard)/settings/page.tsx` |
| Admin – API | `admin/src/services/*.ts` |

---

## 2. Plano técnico (ordem exata)

1. **Fase 1 – Modelagem**
   - Adicionar enums e modelos no Prisma: `Subscription`, `SubscriptionInvoice`, `BillingEvent`.
   - Adicionar relações em `Tenant`.
   - Rodar `prisma generate` e migration (ou migration manual em ambiente controlado).

2. **Fase 2 – Serviço de billing**
   - Criar `src/modules/billing/`: `billing.module.ts`, `billing.service.ts`, DTOs.
   - Serviço desacoplado: sem importar Payments; operações apenas em Subscription/Invoice/Event e Tenant.plan.
   - Preparar métodos para futura integração com gateway (sem chamar gateway real).

3. **Fase 3 – Endpoints administrativos**
   - Criar `billing.controller.ts` com rotas tenant-scoped (JWT):
     - `GET /billing/subscription` – assinatura atual do tenant.
     - `PATCH /billing/subscription/plan` – mudar plano.
     - `POST /billing/subscription/cancel` – cancelar (ex.: fim do período).
     - `POST /billing/subscription/reactivate` – reativar.
     - `GET /billing/invoices` – histórico de faturas.
   - Guard/roles: apenas usuários do tenant (e opcionalmente Super Admin para ver qualquer tenant).

4. **Fase 4 – Telas admin**
   - Página ou seção “Assinatura / Cobrança” no admin (ex.: em Settings ou menu “Billing”): exibir assinatura atual, plano, próximo ciclo, ações cancelar/reativar, lista de faturas.
   - Super Admin: na página do tenant em platform/tenants/[id], exibir status da assinatura e link/hint para billing (mantendo troca de plano já existente).

---

## 3. Código – pontos exatos de inserção

### 3.1 Prisma – enums e modelos (após `AuditLog`, antes do fim do arquivo)

- Inserção em `prisma/schema.prisma`:
  - Novos enums: `SubscriptionStatus`, `InvoiceStatus`.
  - Modelos: `Subscription`, `SubscriptionInvoice`, `BillingEvent`.
  - Em `model Tenant`: adicionar `subscriptions Subscription[]`, `subscriptionInvoices SubscriptionInvoice[]`, `billingEvents BillingEvent[]`.
- Após alterar o schema: `npx prisma generate`. Para persistir no banco: `npx prisma migrate dev --name add_billing_models` (apenas em ambiente controlado).

### 3.2 Backend – módulo Billing

- Novos arquivos:
  - `src/modules/billing/billing.module.ts`
  - `src/modules/billing/billing.service.ts`
  - `src/modules/billing/billing.controller.ts`
  - `src/modules/billing/dto/change-plan.dto.ts` (opcional, para validação)
- Em `src/app.module.ts`: adicionar `BillingModule` em `imports`.

### 3.3 Admin – serviços e telas

- Novo serviço: `admin/src/services/billing.service.ts` (chamadas a `/billing/*`).
- Nova página ou seção: ex.: `admin/src/app/(dashboard)/billing/page.tsx` ou bloco em `settings/page.tsx` (assinatura + histórico).
- Tipos: `admin/src/types/billing.ts` (Subscription, Invoice, etc.).

---

## 4. Checklist final (validar com segurança)

- [ ] **Build backend:** `npm run build` no backend (raiz do projeto) sem erros.
- [ ] **Prisma:** `npx prisma generate` sem erro. Aplicar migration (`npx prisma migrate dev` ou deploy) apenas em ambiente não produtivo ou com backup.
- [ ] **Payments intacto:** fluxo de criação de intenção de pagamento de pedido continua funcionando (teste manual ou E2E existente). Nenhum arquivo em `src/modules/payments/` foi alterado.
- [ ] **Billing isolado:** endpoints `/billing/*` não retornam ou alteram dados de `Payment`/`Order`.
- [ ] **Tenant atual:** GET `/billing/subscription` retorna assinatura (ou vista implícita do plano) para o tenant do JWT; PATCH `/billing/subscription/plan` atualiza `Tenant.plan` e cria/atualiza `Subscription`.
- [ ] **Cancelar/reativar:** alteram apenas estado da assinatura (Subscription); sem disparar cobrança real.
- [ ] **Admin:** menu "Assinatura" visível para quem tem `billing.view`; página `/billing` exibe assinatura atual, troca de plano, cancelar/reativar e histórico de faturas.
- [ ] **Rollback:** remover `BillingModule` de `app.module.ts` e opcionalmente reverter migration; rotas `/billing` deixam de existir; Payments e Tenants permanecem inalterados.
