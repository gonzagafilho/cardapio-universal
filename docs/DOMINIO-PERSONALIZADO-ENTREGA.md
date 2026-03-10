# Domínio personalizado — Entrega em 4 partes

## 1 — Diagnóstico real (arquivos afetados)

### Já implementado e confirmado no código

| Área | Arquivo | Uso |
|------|--------|-----|
| **Prisma** | `prisma/schema.prisma` | `Establishment.customDomain String? @unique`, `@@index([customDomain])` |
| **Backend – store-public** | `src/modules/store-public/store-public.service.ts` | `normalizeHost`, `resolveStore(requestHost, slug)`, `getStoreByHost`, `getStoreBySlug` |
| **Backend – store-public** | `src/modules/store-public/store-public.controller.ts` | `GET by-host?host=`, `GET :slug` e demais rotas por slug |
| **Backend – establishments** | `src/modules/establishments/dto/create-establishment.dto.ts` | `customDomain` opcional + validação (Matches hostname, ValidateIf) |
| **Backend – establishments** | `src/modules/establishments/establishments.service.ts` | Normalização de customDomain no update; checagem de duplicidade; tratamento P2002 |
| **Frontend público** | `frontend/src/lib/constants.ts` | `APP_HOST` (NEXT_PUBLIC_APP_HOST) |
| **Frontend público** | `frontend/src/services/store.service.ts` | `getStoreByHost(host)` |
| **Frontend público** | `frontend/src/hooks/useStoreData.ts` | `useStoreDataByHost(host)` |
| **Frontend público** | `frontend/src/app/page.tsx` | Server: headers(); se host ≠ APP_HOST → CustomDomainStorePage |
| **Frontend público** | `frontend/src/components/store/StoreHeader.tsx` | `linkBase` opcional |
| **Frontend público** | `frontend/src/components/store/CartDrawer.tsx` | `linkBase` opcional |
| **Frontend público** | `frontend/src/components/store/CustomDomainStorePage.tsx` | Página home por host |
| **Frontend público** | `frontend/src/components/store/CustomDomainCartPage.tsx` | Cart por host |
| **Frontend público** | `frontend/src/components/store/CustomDomainCheckoutPage.tsx` | Checkout por host |
| **Frontend público** | `frontend/src/components/store/CustomDomainSuccessPage.tsx` | Success por host |
| **Frontend público** | `frontend/src/components/store/CustomDomainFailurePage.tsx` | Failure por host |
| **Frontend público** | `frontend/src/components/store/CustomDomainOrderPage.tsx` | Order por host |
| **Frontend público** | `frontend/src/app/cart/page.tsx`, `checkout/page.tsx`, `success/page.tsx`, `failure/page.tsx`, `order/[id]/page.tsx` | Rotas raiz para domínio custom (redirecionam se host = APP_HOST) |
| **Admin** | `admin/src/lib/constants.ts` | `APP_PUBLIC_HOST` (para instruções CNAME) |
| **Admin** | `admin/src/types/establishment.ts` | `customDomain` em Establishment e DTOs |
| **Admin** | `admin/src/components/forms/EstablishmentForm.tsx` | Campo domínio + instrução CNAME + fallback por slug |
| **Admin** | `admin/src/app/(dashboard)/establishments/[id]/page.tsx` | Bloco com domínio atual e aviso de infra |
| **Doc** | `docs/DOMINIO-PERSONALIZADO-INFRA.md` | O que é aplicação vs DNS/Nginx/SSL |
| **Doc** | `docs/DOMINIO-PERSONALIZADO-DIAGNOSTICO-E-PLANO.md` | Diagnóstico e plano técnico |

### Respostas à análise obrigatória

1. **Onde o backend resolve a loja pelo slug?**  
   `StorePublicController`: rotas `GET :slug`, `GET :slug/categories`, etc.  
   `StorePublicService.getStoreBySlug(slug)` → `prisma.establishment.findFirst({ where: { slug, isActive: true } })`.

2. **Onde o frontend público resolve o slug?**  
   App Router: `(public)/[storeSlug]/page.tsx` e subpáginas; `params.storeSlug`; `useStoreData(storeSlug)` e `getStoreBySlug(slug)` em `store.service.ts`.

3. **Múltiplos establishments por tenant?**  
   Sim. Schema: `Tenant` → `establishments Establishment[]`; slug único por tenant.

4. **Domínio no Tenant ou no Establishment?**  
   **Establishment.** Uma “loja” pública = um Establishment; cada um pode ter seu próprio domínio (ex.: menu.loja1.com, menu.loja2.com).

5. **Como resolver com domínio custom?**  
   Helper central `resolveStore(requestHost?, slug?)`: (1) se requestHost bater com algum `customDomain` → retorna esse estabelecimento; (2) senão usa slug. API: `GET by-host?host=` para front em domínio custom; `GET :slug` mantido.

6. **Dependências de infraestrutura?**  
   DNS (CNAME/A), Nginx (proxy/wildcard), SSL (wildcard ou Let’s Encrypt). Documentado em `docs/DOMINIO-PERSONALIZADO-INFRA.md`. Nenhuma alteração automática de infra no código.

---

## 2 — Plano técnico (ordem exata)

1. **Prisma:** Campo `customDomain` em Establishment (já feito). Migration apenas em ambiente controlado.
2. **Backend:** Helper `resolveStore(requestHost, slug)` e `getStoreByHost`; rota `GET by-host`; validação e unicidade de `customDomain` no update (já feito + validação e conflito).
3. **API pública:** Manter `/public/store/:slug`; adicionar `/public/store/by-host?host=` (já feito). Não remover slug.
4. **Frontend público:** Host padrão vs custom; resolver por host quando host ≠ APP_HOST; rotas `/`, `/cart`, `/checkout`, etc. para custom (já feito).
5. **Admin:** Configuração de domínio no estabelecimento, instrução CNAME, status/fallback (já feito + CNAME explícito).
6. **Segurança:** Formato hostname (DTO), evitar duplicidade (checagem + unique Prisma), conflito entre tenants evitado por unique global (já feito).
7. **Doc infra:** O que é app vs infra (já feito em DOMINIO-PERSONALIZADO-INFRA.md).

---

## 3 — Código (caminho e ponto de inserção)

### Ajustes feitos nesta sessão

- **`src/modules/establishments/dto/create-establishment.dto.ts`**  
  - Import: `Matches`, `ValidateIf`.  
  - Em `customDomain`: `@ValidateIf((_o, v) => v != null && String(v).trim() !== '')` e `@Matches(/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i, { message: '...' })`.

- **`src/modules/establishments/establishments.service.ts`**  
  - No `update`: antes do `prisma.establishment.update`, se `customDomain` não vazio, buscar outro establishment com o mesmo `customDomain` e `id !== id`; se existir, `ConflictException('Este domínio já está em uso por outro estabelecimento')`.  
  - Envolver o `update` em try/catch; se `e.code === 'P2002'`, lançar `ConflictException('Este domínio já está em uso')`.

- **`src/modules/store-public/store-public.service.ts`**  
  - Assinatura e comentário de `resolveStore`: `resolveStore(requestHost?: string, slug?: string)` com doc “1) requestHost → customDomain; 2) fallback slug”.

- **`admin/src/lib/constants.ts`**  
  - `APP_PUBLIC_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? (typeof window !== 'undefined' ? new URL(APP_PUBLIC_URL).hostname : 'app.cardapio.nexoracloud.com.br')`.

- **`admin/src/components/forms/EstablishmentForm.tsx`**  
  - Import `APP_PUBLIC_HOST`.  
  - Instrução DNS: “Crie um CNAME apontando para **{APP_PUBLIC_HOST}**”. Texto de fallback por slug mantido.

Demais pontos (Prisma, controller, frontend, páginas custom, admin [id]) já estavam implementados conforme diagnóstico.

---

## 4 — Checklist final (como testar com segurança)

- [ ] **Prisma:** `npx prisma generate`; migration só em ambiente controlado: `npx prisma migrate dev --name add_custom_domain` (se ainda não aplicada).
- [ ] **Backend:** `npm run build` sem erros.
- [ ] **Modo slug:** `GET /public/store/pizzaria-do-joao` retorna a loja; frontend em `https://app.cardapio.nexoracloud.com.br/pizzaria-do-joao` abre o cardápio (comportamento atual).
- [ ] **Modo domínio custom:** Estabelecimento com `customDomain = 'menu.exemplo.com'`. `GET /public/store/by-host?host=menu.exemplo.com` retorna a mesma loja. Frontend acessado com host `menu.exemplo.com` (e Nginx/DNS configurados) exibe cardápio em `/`, `/cart`, `/checkout`, etc.
- [ ] **Fallback:** Estabelecimento com customDomain continua acessível por slug (ex.: `app.cardapio.nexoracloud.com.br/slug-da-loja`).
- [ ] **Admin:** Em estabelecimento, preencher domínio personalizado; salvar; exibir domínio e instrução CNAME; tentar salvar o mesmo domínio em outro estabelecimento e verificar mensagem de conflito.
- [ ] **Validação:** Enviar `customDomain` inválido (ex.: "invalido" sem TLD); backend deve retornar 400 com mensagem de validação.
- [ ] **QR Code / onboarding / billing:** Não alterados; fluxos atuais mantidos.
- [ ] **Rollback:** Reverter migration (remover `customDomain`), remover uso de customDomain em store-public e frontend; manter apenas resolução por slug.

---

## Resultado esperado

- Cardápio por **slug**: `https://app.cardapio.nexoracloud.com.br/pizzaria-do-joao`.
- Cardápio por **domínio personalizado**: `https://menu.pizzariadojoao.com.br` (com DNS/Nginx/SSL configurados fora da aplicação).
- Compatibilidade mantida com clientes atuais (slug e QR Code); domínio custom é recurso adicional.
