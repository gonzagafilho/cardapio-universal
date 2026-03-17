# Nexora — Produção comercial segura — Raio-X e próximo passo

**Data:** 2026-03-15  
**Modo:** Produção segura — inspeção antes de editar.

---

## 1. RAIO-X AGORA

| Área | Estado (inspecionado) |
|------|------------------------|
| **Backend público** | `GET /api/public/store/:slug` e `by-host`; `:slug/settings`, `:slug/categories`, `:slug/products`; cart e order por slug. OK. |
| **Backend settings (auth)** | `GET/PATCH /settings/store`, `PATCH /settings/hours`, `PATCH /settings/branding`, `PATCH /settings/payment-methods`, `PATCH /settings/delivery`. Controller com todas as rotas. |
| **Settings service (backend)** | `updateStore()` remove delivery/payment do DTO e persiste só parte em StoreSettings. `updateDelivery()` e `updatePaymentMethods()` existem e fazem upsert em StoreSettings. |
| **Schema StoreSettings** | Tem: deliveryFee, minimumOrderAmount, minimumOrderAmountDelivery, estimatedDeliveryTimeMin/Max, acceptsPickup, acceptsDelivery, acceptsDineIn. **Não** declara paymentPix, paymentCardOnDelivery, paymentCardOnCounter — se o backend chamar Prisma com esses campos, pode falhar ou as colunas podem existir só no banco (confirmar). |
| **Admin tela Configurações** | `admin/src/app/(dashboard)/settings/page.tsx` — usa `getStoreSettings` e `updateStoreSettings` apenas. Exibe plano + `SettingsForm`. |
| **Admin settings.service** | Apenas: `getStoreSettings`, `updateStoreSettings`, `updateHours`, `updateBranding`. **Não tem** `updateDelivery` nem `updatePaymentMethods`. |
| **SettingsForm (admin)** | Campos: primaryColor, minimumOrder, minimumOrderDelivery, pixKey, acceptsDelivery, acceptsPickup. Submit envia tudo para `updateStoreSettings` → PATCH `/settings/store`. Backend em `updateStore` remove deliveryFee, paymentPix, etc., e mapeia minimumOrder → minimumOrderAmount; aceita acceptsDelivery/acceptsPickup no DTO e **podem** ser persistidos pelo upsert (não estão na lista de delete). |
| **Loja pública (frontend)** | `[storeSlug]/page.tsx` → useStoreData(storeSlug) → getStoreBySlug, getStoreCategories, getStoreProducts, getStoreSettings. Checkout usa settings (minDelivery, etc.) e submitOrder. |
| **Carrinho / pedido** | store.service.ts chama PUBLIC_PREFIX (slug); checkout usa useCheckout e submitOrder. |

**Resumo:** Backend de delivery e payment-methods existe; admin **não chama** esses endpoints. Formulário de configurações envia tudo para PATCH store; backend limpa campos de payment/delivery no updateStore e expõe esses dados via PATCH delivery e PATCH payment-methods separados.

---

## 2. O QUE JÁ ESTÁ PRONTO

- Backend público por slug e by-host (loja, categorias, produtos, settings, cart, order).
- Slug real Bistrô = `bistro`; scripts e referências corrigidos.
- Backend `settings/delivery` e `settings/payment-methods` implementados no controller e no service.
- Schema StoreSettings com campos de entrega (deliveryFee, minimumOrder*, estimatedDeliveryTime*), acceptsDelivery/acceptsPickup/acceptsDineIn.
- Admin: tela Configurações em `/settings` com plano e SettingsForm (cor, pedido mínimo, PIX, aceita entrega/retirada).
- Frontend: loja pública por slug, carrinho, checkout que usa settings (minOrder) e submitOrder.
- Store público getSettings retorna deliveryFee, minimumOrder*, estimatedDeliveryTime* para o frontend.

---

## 3. O QUE FALTA PARA FICAR VENDÁVEL

1. **Admin não conectado a delivery e payment-methods**  
   - A tela de configurações não chama `PATCH /settings/delivery` nem `PATCH /settings/payment-methods`.  
   - Só chama `updateStoreSettings` (PATCH store). O backend em updateStore **remove** deliveryFee e paymentPix/paymentCard* do payload; então mesmo que o form enviasse, não seriam gravados por aí.  
   - Para “configurações comerciais” vendáveis é preciso:  
     - no admin: passar a chamar updateDelivery e updatePaymentMethods (ou expor abas/seções que usem esses endpoints);  
     - no form (ou em seções): campos de taxa de entrega, tempo estimado, formas de pagamento (PIX, cartão na entrega, cartão no balcão), se ainda não estiverem.

2. **Schema vs payment methods (confirmado)**  
   - StoreSettings no Prisma e **no banco** não têm paymentPix, paymentCardOnDelivery, paymentCardOnCounter.  
   - O endpoint `PATCH /settings/payment-methods` vai falhar ao persistir (Prisma/schema sem essas colunas). Para habilitar formas de pagamento configuráveis é necessária migration que adicione essas colunas; até lá, conectar admin só a **delivery** (que já existe no banco).

3. **Validações de fluxo** (conforme sua ordem 1–10):  
   - Validar loja pública completa (slug e by-host).  
   - Validar carrinho completo.  
   - Validar criação de pedido ponta a ponta.  
   - Inspecionar admin e tela real de configurações comerciais (já localizada: `/settings` + SettingsForm).  
   - Conectar admin a settings/delivery e payment-methods.  
   - Validar fluxo de pagamento configurável.  
   - Validar delivery real.  
   - Validar painel de pedidos em tempo real.  
   - Validar PWA / link / QR.  
   - Checklist final de produção.

---

## 4. PRÓXIMO PASSO EXATO

**Passo 1 da sua ordem:** Validar loja pública completa.

- **O que fazer:** Garantir que a loja pública (por slug e por host) carrega loja, categorias, produtos e settings e que o frontend exibe e usa esses dados (incluindo mínimo de pedido e entrega no checkout).
- **Não editar código ainda:** Apenas rodar os comandos de validação abaixo e anotar 200/404/erros. Se tudo 200 e o frontend abrir cardápio e checkout, marcar item 1 como OK e seguir para o item 2 (carrinho).

---

## 5. ARQUIVOS REAIS A INSPECIONAR

Já inspecionados com `nl -ba` (ou equivalente):

- `admin/src/app/(dashboard)/settings/page.tsx` — página Configurações.
- `admin/src/services/settings.service.ts` — sem updateDelivery/updatePaymentMethods.
- `admin/src/components/forms/SettingsForm.tsx` — campos e submit para updateStoreSettings.
- `src/modules/settings/settings.controller.ts` — rotas store, hours, branding, payment-methods, delivery.
- `src/modules/settings/settings.service.ts` — getStore, updateStore (strip delivery/payment), updatePaymentMethods, updateDelivery.
- `src/modules/settings/dto/update-store-settings.dto.ts` — aceita delivery e payment; updateStore depois remove esses campos.
- `prisma/schema.prisma` — model StoreSettings (sem paymentPix/paymentCard*).
- `frontend/src/app/(public)/[storeSlug]/page.tsx` — loja por slug.
- `frontend/src/app/(public)/[storeSlug]/checkout/page.tsx` — checkout com settings e submitOrder.
- `frontend/src/services/store.service.ts` — getStoreSettings(slug) → GET público.

Para o **próximo passo** (validar carrinho e pedido), inspecionar:

- `frontend/src/hooks/useCheckout.ts` (ou onde está submitOrder).
- `src/modules/store-public/store-public.controller.ts` — rotas POST cart e POST order.
- `admin/src/app/(dashboard)/cozinha/page.tsx` ou `orders/page.tsx` — painel de pedidos em tempo real.

---

## 6. COMANDOS EXATOS

**1) Validar loja pública (API):**

```bash
# Slug bistro
curl -s -o /dev/null -w "%{http_code}" "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro"
curl -s -o /dev/null -w "%{http_code}" "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/settings"
curl -s -o /dev/null -w "%{http_code}" "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/categories"
curl -s -o /dev/null -w "%{http_code}" "https://api.cardapio.nexoracloud.com.br/api/public/store/bistro/products"
```

Esperado: 200 em todos (ou 302 se houver redirect; anotar).

**2) Validar by-host (se subdomínio ativo):**

```bash
curl -s -o /dev/null -w "%{http_code}" "https://api.cardapio.nexoracloud.com.br/api/public/store/by-host?host=bistro.menu.cardapio.nexoracloud.com.br"
```

**3) Validar frontend (loja e checkout) manualmente ou E2E:**

- Abrir `https://app.cardapio.nexoracloud.com.br/bistro` (ou host do menu) e conferir cardápio, carrinho e ir até o checkout (sem precisar finalizar pagamento).

**4) Confirmar colunas de payment no banco (antes de conectar admin a payment-methods):**

```bash
cd /home/servidor-dcnet/cardapio-universal && node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$queryRaw\`SELECT column_name FROM information_schema.columns WHERE table_name = 'StoreSettings' ORDER BY ordinal_position\`.then(r => console.log(JSON.stringify(r, null, 2))).finally(() => p.\$disconnect());
"
```

**Resultado da validação (2026-03-15):** A tabela `StoreSettings` no banco tem apenas: id, tenantId, establishmentId, deliveryFee, minimumOrderAmount, minimumOrderAmountDelivery, estimatedDeliveryTimeMin/Max, acceptsPickup, acceptsDelivery, acceptsDineIn, currency, createdAt, updatedAt. **Não existem** colunas `paymentPix`, `paymentCardOnDelivery`, `paymentCardOnCounter`. Portanto o endpoint `PATCH /settings/payment-methods` vai falhar ao fazer upsert com Prisma (campos inexistentes). Para usar payment-methods no admin é necessária migration que adicione essas três colunas em StoreSettings; até lá, não conectar admin a payment-methods ou desativar/adaptar o endpoint.

---

## 7. PATCH MÍNIMO EXATO (somente se provado)

**Nenhum patch aplicado nesta etapa.** Ordem é validar primeiro (itens 1–10).

Depois de validar que:

- loja pública e carrinho e pedido funcionam, e  
- o gargalo é só admin não chamar delivery/payment-methods,

o **patch mínimo** seria:

1. **Admin:** Em `admin/src/services/settings.service.ts` adicionar:
   - `updateDelivery(establishmentId, data)` → `apiPatch(\`/settings/delivery?establishmentId=${establishmentId}\`, data)`
   - `updatePaymentMethods(establishmentId, data)` → `apiPatch(\`/settings/payment-methods?establishmentId=${establishmentId}\`, data)`

2. **Admin:** Na página de configurações (e/ou no SettingsForm), ao salvar:
   - além de `updateStoreSettings` (ou em vez de enviar delivery/payment no payload de store), chamar `updateDelivery` e `updatePaymentMethods` com os campos corretos (deliveryFee, minimumOrder*, estimatedDeliveryTime*, acceptsDelivery/acceptsPickup/acceptsDineIn para delivery; paymentPix, paymentCardOnDelivery, paymentCardOnCounter para payment-methods).

3. **Schema/banco:** Se a query de `information_schema.columns` mostrar que StoreSettings **não** tem paymentPix/paymentCard*, não chamar updatePaymentMethods até existir migration (ou remover/commentar no backend o uso desses campos até ter colunas). **Não criar migration** sem necessidade real confirmada.

---

## 8. VALIDAÇÃO FINAL

- Após executar os comandos da seção 6: anotar códigos HTTP e, se possível, um “OK” manual do fluxo loja → carrinho → checkout.
- Após eventual patch do admin: abrir Configurações, alterar entrega (ex.: taxa, mínimo) e formas de pagamento, salvar, e conferir no público (GET store/settings) se os valores aparecem.

---

## 9. TEXTO PRONTO PRO PRÓXIMO CHAT

Colar no próximo chat:

---

**Contexto Nexora produção comercial (modo seguro):**

- Raio-X feito: backend público (slug + by-host) e settings (store, hours, branding, **delivery**, **payment-methods**) existem. Admin tem tela Configurações (`/settings`) com SettingsForm que envia só para PATCH store; **admin não chama** PATCH delivery nem PATCH payment-methods. Backend updateStore remove campos de delivery/payment do payload; updateDelivery e updatePaymentMethods estão implementados no backend. Schema StoreSettings **não** declara paymentPix/paymentCardOnDelivery/paymentCardOnCounter — preciso confirmar no banco se as colunas existem antes de usar.
- Documento: `docs/NEXORA-PRODUCAO-SEGURA-RAIO-X.md`.
- **Ordem de trabalho:** 1) Validar loja pública completa 2) Carrinho 3) Pedido ponta a ponta 4) Inspecionar admin configurações comerciais 5) Conectar admin a settings/delivery e payment-methods 6) Validar pagamento configurável 7) Delivery real 8) Painel pedidos tempo real 9) PWA/link/QR 10) Checklist produção.
- **Próximo passo exato:** Validar loja pública completa (curl da API + teste manual do cardápio/checkout); depois validar carrinho e criação de pedido. Só então conectar admin a delivery e payment-methods (e confirmar colunas de payment no banco).

---

*Fim do raio-x.*
