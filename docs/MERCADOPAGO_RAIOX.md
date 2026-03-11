# Raio-X: integração Mercado Pago (fluxo real atual)

## 1. RAIO-X CURTO DO FLUXO REAL

### Checkout (criação do link de pagamento)

1. Admin: usuário em `/billing` escolhe plano e clica em "Escolher plano" / "Fazer upgrade".
2. Frontend chama `POST /api/billing/subscription/checkout` com `{ plan }` (JWT + tenantId pelo contexto).
3. **BillingService.createCheckoutSubscription**:
   - Exige `mercadopago.accessToken` (ConfigService); se vazio, retorna `null` (checkout desabilitado).
   - Valida plano em `basic` | `pro` | `enterprise`.
   - Se não existir `Subscription` para o tenant: cria uma com `status: trialing`, `trialStartsAt`/`trialEndsAt` (7 dias), `provider: null`, `externalSubscriptionId: null`; atualiza `Tenant.plan` para o plano escolhido.
   - Monta body para a API MP: `POST https://api.mercadopago.com/preapproval` com `reason`, `external_reference: tenantId`, `payer_email`, `status: 'pending'`, `back_url` (BILLING_BACK_URL), `auto_recurring` (mensal, BRL, valor do plano).
   - Em sucesso: guarda `id` da preapproval em `Subscription.externalSubscriptionId` e `provider: 'mercadopago'`, atualiza `Subscription.plan` e `Tenant.plan`, registra `BillingEvent` `subscription.checkout_created`.
   - Retorna `checkoutUrl: init_point` (ou `sandbox_init_point`).
4. Admin faz redirect com `window.location.href = checkoutUrl` → usuário paga no Mercado Pago e volta para `back_url` (ex.: `/billing`).

### Webhook (ativação após pagamento)

1. Mercado Pago envia `POST /api/billing/webhooks/mercadopago` com body contendo `type` e `data.id` (id da preapproval).
2. **BillingController.webhookMercadoPago**: rota `@Public()`, repassa body e header `x-signature` para o service.
3. **BillingService.processMercadoPagoWebhook**:
   - Ignora se `type !== 'subscription_preapproval'` ou `!data.id`.
   - Se `mercadopago.webhookSecret` estiver definido e vier `x-signature`, valida HMAC (ts + id); se inválido, retorna sem atualizar.
   - Busca **Subscription** por `externalSubscriptionId === data.id`.
   - Se não achar, loga e retorna.
   - Chama `GET https://api.mercadopago.com/preapproval/{id}` com o access token para obter o status atual.
   - Mapeia status MP → nosso: `authorized` → `active`, `cancelled`/`canceled` → `cancelled`, `paused` → `past_due`; outros (ex.: `pending`) → ignora.
   - Atualiza **Subscription**: `status`; se `active`, preenche `currentPeriodStart`, `currentPeriodEnd` (+1 mês), zera `cancelAtPeriodEnd` e `cancelledAt`; se `cancelled`, seta `cancelledAt`.
   - Registra `BillingEvent` `webhook.mercadopago.preapproval`.
   - **Não** atualiza `Tenant.plan` aqui (já foi setado no checkout).

### Admin após retorno

- Usuário cai em `BILLING_BACK_URL` (ex.: `/billing`). A página chama `getSubscription()` (GET `/api/billing/subscription`).
- Se o webhook já tiver rodado, a assinatura aparece como `active`. Caso contrário, continua `trialing` até o webhook ser processado ou o usuário atualizar a página.

---

## 2. ENVS OBRIGATÓRIAS E OPCIONAIS

| Variável | Obrigatória? | Uso |
|----------|--------------|-----|
| **MERCADOPAGO_ACCESS_TOKEN** | **Sim** (para checkout e webhook) | Sem ela, checkout retorna `null` e o webhook não chama a API MP para buscar status. |
| MERCADOPAGO_WEBHOOK_SECRET | Não | Se definida, valida header `x-signature`; se não, processa o webhook sem validação. |
| BILLING_BACK_URL | Não | URL de retorno após pagamento; default: primeiro item de CORS_ORIGINS ou `http://localhost:3001/billing`. |
| MERCADOPAGO_PLAN_AMOUNT_BASIC / _PRO / _ENTERPRISE | Não | Valores em BRL; default 29.90, 79.90, 199.90. |

---

## 3. CAMPOS DA SUBSCRIPTION ATUALIZADOS HOJE

- **No checkout** (createCheckoutSubscription): criação com `trialing` ou uso de subscription existente; após resposta MP: `externalSubscriptionId`, `provider`, `plan`. `Tenant.plan` também atualizado.
- **No webhook** (processMercadoPagoWebhook):
  - Sempre: `status` (active | cancelled | past_due conforme MP).
  - Se `active`: `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd: false`, `cancelledAt: null`.
  - Se `cancelled`: `cancelledAt`.
- **Não** atualizados no webhook: `plan`, `externalSubscriptionId`, `provider`, `Tenant.plan` (já definidos no checkout).

---

## 4. O QUE FALTA PARA FECHAR ATIVAÇÃO AUTOMÁTICA (CONFIÁVEL)

1. **Configuração no painel Mercado Pago**
   - URL do webhook: `https://api.cardapio.nexoracloud.com.br/api/billing/webhooks/mercadopago` (método POST).
   - Tópico/natureza: notificações de **subscription_preapproval** (assinaturas sem planos associados precisam desse tópico ativo).

2. **Timing no retorno do usuário**
   - Ao voltar do MP para `/billing`, a tela pode ainda mostrar `trialing` se o webhook não tiver sido disparado/processado. Basta dar refresh ou aguardar; não exige mudança de código para “fechar” ativação.

3. **Sincronização Tenant.plan no webhook (recomendado)**
   - Hoje o `Tenant.plan` é setado só no checkout. Se por qualquer falha o tenant não tiver sido atualizado no checkout, após o webhook a Subscription fica `active` mas o Tenant pode manter plano antigo. **Recomendação:** ao passar a assinatura para `active` no webhook, atualizar também `Tenant.plan` com o `Subscription.plan` (correção mínima abaixo).

4. **Assinatura do webhook**
   - Em produção, definir `MERCADOPAGO_WEBHOOK_SECRET` e garantir que o MP envia `x-signature` conforme documentação, para evitar processamento de notificações falsas.

5. **Outros status MP**
   - Código mapeia apenas `authorized`, `cancelled`/`canceled`, `paused`. Qualquer outro status é ignorado (não atualiza Subscription). Para pagamento aprovado, o MP envia `authorized`; fluxo atual cobre o caso principal.

---

## 5. CORREÇÃO MÍNIMA SEGURA (OPCIONAL)

**Objetivo:** Garantir que, quando o webhook ativa a assinatura, o `Tenant.plan` fique alinhado ao plano da Subscription.

**Arquivo:** `src/modules/billing/billing.service.ts`

**Alteração:** Dentro de `processMercadoPagoWebhook`, após o `prisma.subscription.update(...)`, se `ourStatus === SubscriptionStatus.active`, atualizar também o tenant:

```ts
if (ourStatus === SubscriptionStatus.active) {
  await this.prisma.tenant.update({
    where: { id: sub.tenantId },
    data: { plan: sub.plan },
  });
}
```

Isso evita divergência Tenant.plan x Subscription.plan caso o checkout não tenha atualizado o tenant por algum motivo.

---

## 6. PROMPT EXATO PARA PRÓXIMA CORREÇÃO (SE APLICAR A CORREÇÃO MÍNIMA)

```
No BillingService.processMercadoPagoWebhook, quando ourStatus === SubscriptionStatus.active, após o update da Subscription, atualizar também o Tenant.plan com o valor de sub.plan (sync garantido após ativação pelo webhook). Uma única chamada prisma.tenant.update; não alterar auth, guards ou outros fluxos.
```

---

## 7. COMANDOS EXATOS DE BUILD / RESTART / TESTE

```bash
# Backend (no diretório do projeto)
cd /home/servidor-dcnet/cardapio-universal
npm run build
pm2 restart nexora-api

# Teste webhook (local)
curl -s -X POST http://127.0.0.1:3020/api/billing/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"subscription_preapproval","data":{"id":"ID_PREAPPROVAL_EXISTENTE"}}'

# Teste webhook (produção HTTPS)
curl -s -X POST https://api.cardapio.nexoracloud.com.br/api/billing/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"subscription_preapproval","data":{"id":"ID_PREAPPROVAL_EXISTENTE"}}'
```

Substituir `ID_PREAPPROVAL_EXISTENTE` por um `externalSubscriptionId` real de uma Subscription de teste para validar atualização de status e (com a correção) de Tenant.plan.
