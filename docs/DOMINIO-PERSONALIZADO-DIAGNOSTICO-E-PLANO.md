# Domínio personalizado – Diagnóstico e plano técnico

## 1. Diagnóstico real

### 1.1 Onde o app público resolve a loja pelo slug?

- **Frontend (app público):** O segmento dinâmico da URL é `[storeSlug]`.
  - Arquivos: `frontend/src/app/(public/)/[storeSlug]/page.tsx`, `layout.tsx`, e subpáginas `cart`, `checkout`, `success`, `failure`, `order/[id]`.
  - O `storeSlug` vem de `params.storeSlug` (primeiro segmento do path, ex.: `/pizzaria-do-joao` → `pizzaria-do-joao`).
  - O hook `useStoreData(storeSlug)` chama `getStoreBySlug(storeSlug)` e demais endpoints com esse slug.
- **Serviço:** `frontend/src/services/store.service.ts`: todas as chamadas usam `PUBLIC_PREFIX + '/' + slug` (ex.: `GET /public/store/pizzaria-do-joao`).

### 1.2 Onde a API pública resolve a loja pelo slug?

- **Controller:** `src/modules/store-public/store-public.controller.ts`: rotas `GET :slug`, `GET :slug/categories`, `GET :slug/products`, etc. O parâmetro `slug` é o path param.
- **Service:** `src/modules/store-public/store-public.service.ts`: `getStoreBySlug(slug)` faz `prisma.establishment.findFirst({ where: { slug, isActive: true } })`.
  - A loja pública é um **Establishment** (slug único por tenant; no findFirst o slug é usado sem tenantId, então o primeiro ativo com aquele slug é retornado).

### 1.3 Domínio personalizado no Tenant ou no Establishment?

- **Establishment.** O cardápio público é por estabelecimento: a API e o app usam o slug do **Establishment**. Um tenant pode ter vários estabelecimentos; cada um pode ter seu próprio domínio (ex.: `menu.loja1.com`, `menu.loja2.com`). Colocar em Tenant obrigaria um único domínio por tenant e não refletiria a estrutura atual (uma “loja” = um establishment).

### 1.4 Múltiplos estabelecimentos por tenant?

- Sim. No schema, `Tenant` tem `establishments Establishment[]`; `Establishment` tem `tenantId` e `slug` único por tenant (`@@unique([tenantId, slug])`). Faz sentido domínio custom por **Establishment**.

### 1.5 Como adaptar a resolução (host custom vs slug)?

- **Backend:** Resolver loja de duas formas: (1) por **slug** (path param, comportamento atual) e (2) por **host** (query `host=` ou header): buscar Establishment onde `customDomain` = host normalizado. Um helper centralizado (ex.: `resolveStore(slug?: string, host?: string)`) evita duplicar lógica.
- **Frontend:** Se a requisição for do **host padrão do app** (ex.: `app.cardapio.nexoracloud.com.br`), manter resolução por path (`storeSlug`). Se for **outro host** (domínio custom), chamar a API com `host=` e usar o estabelecimento retornado; o “storeSlug” interno pode ser o `store.slug` para links.

### 1.6 Dependências de infraestrutura externa

- **DNS:** O cliente precisa apontar o domínio (CNAME ou A) para o servidor que entrega o app/API (ex.: Nginx ou provedor). **Não foi possível confirmar na base de código** se há algum processo automatizado de DNS; assumir que é configuração manual do cliente/suporte.
- **SSL:** O domínio custom precisa de certificado (ex.: Let’s Encrypt, wildcard ou por domínio). Nginx ou proxy reverso costumam fazer terminação SSL. **Não foi possível confirmar** na estrutura do projeto; documentar que é responsabilidade da infra.
- **Nginx / proxy reverso:** Para que `menu.pizzariadojoao.com.br` sirva o mesmo app/API, o Nginx (ou equivalente) deve rotear esse host para a mesma aplicação que atende o domínio padrão. **Não alterar Nginx em produção sem plano claro.**
- **Wildcard/certificados:** Se houver muitos domínios custom, pode ser necessário certificado wildcard ou provisionamento por domínio; isso fica fora do código da aplicação.

---

## 2. Plano técnico (ordem exata)

1. **Prisma:** Em `Establishment`, adicionar `customDomain String? @unique` (e índice se útil). Normalizar ao salvar (lowercase, sem porta).
2. **Backend:**  
   - Em `StorePublicService`: adicionar `getStoreByHost(host: string)` (busca por `customDomain`) e `resolveStore(slug?: string, host?: string)` (tenta host, depois slug).  
   - Manter `getStoreBySlug` e usá-lo dentro de `resolveStore` quando houver slug.  
   - Em `StorePublicController`: rota `GET by-host` (query `host=`) antes de `:slug`; demais rotas passam a usar o helper (slug do path ou host do query, conforme disponível).  
   - Em Establishments: DTOs e update permitindo `customDomain` (opcional, validação simples).
3. **Frontend (app público):**  
   - Constante para “host padrão do app” (ex.: `NEXT_PUBLIC_APP_HOST`).  
   - `getStoreByHost(host)` no `store.service`.  
   - Quando `pathname` for `/` (ou subpáginas sem slug) e o host for custom, resolver loja por host e renderizar o mesmo fluxo (home, cart, checkout, etc.) usando o store retornado; quando host for o padrão, manter resolução por `storeSlug` no path.
4. **Admin:** Campo “Domínio personalizado” no estabelecimento (form + API); instruções de DNS/CNAME, aviso de dependências externas, fallback por slug; status simples (ex.: “Configurado” quando `customDomain` preenchido).
5. **Documentação:** Doc (ex.: `docs/DOMINIO-PERSONALIZADO-INFRA.md`) explicando o que a aplicação faz (resolução por host/slug) e o que é externo: CNAME/A, Nginx, SSL.

---

## 3. Arquivos alterados/criados (referência)

| Área | Arquivo | Alteração |
|------|--------|-----------|
| Prisma | `prisma/schema.prisma` | `Establishment`: campo `customDomain String? @unique`, `@@index([customDomain])` |
| Backend | `src/modules/store-public/store-public.service.ts` | `getStoreByHost`, `resolveStore`, uso em getStoreBySlug (ou chamadas ao resolve) |
| Backend | `src/modules/store-public/store-public.controller.ts` | `GET by-host?host=`, rotas existentes usando identificador resolvido |
| Backend | `src/modules/establishments/dto/update-establishment.dto.ts` ou create | `customDomain` opcional com validação |
| Backend | `src/modules/establishments/establishments.service.ts` | normalizar e persistir `customDomain` no update (e create se permitir) |
| Frontend | `frontend/src/lib/constants.ts` | `APP_HOST` (host padrão do app) |
| Frontend | `frontend/src/services/store.service.ts` | `getStoreByHost(host)` |
| Frontend | `frontend/src/app/(public/)/...` | Resolver loja por host quando path = / e host ≠ APP_HOST; páginas /cart, /checkout etc. quando em custom domain |
| Admin | `admin/src/types/establishment.ts` | `customDomain?: string` |
| Admin | `admin/src/components/forms/EstablishmentForm.tsx` | Campo domínio + instruções/avisos |
| Admin | `admin/src/app/(dashboard)/establishments/[id]/page.tsx` | Exibir customDomain e instruções (ou bloco na mesma página) |
| Doc | `docs/DOMINIO-PERSONALIZADO-INFRA.md` | Novo: o que é app vs infra (DNS, Nginx, SSL) |

---

## 4. Checklist final

- [ ] **Prisma:** `npx prisma generate`; migration em ambiente controlado.
- [ ] **Backend:** GET `/public/store/by-host?host=menu.exemplo.com` retorna a mesma forma que GET `/public/store/slug-da-loja` quando o establishment tem `customDomain = 'menu.exemplo.com'`.
- [ ] **Backend:** GET `/public/store/:slug` continua funcionando; estabelecimentos sem customDomain seguem acessíveis só por slug.
- [ ] **Frontend:** Com host padrão e URL `/{slug}`, comportamento igual ao atual.
- [ ] **Frontend:** Com host custom e path `/`, loja resolvida por host e cardápio exibido; links internos (cart, checkout) funcionam.
- [ ] **Admin:** Salvar/editar domínio personalizado no estabelecimento; exibir instruções e aviso de dependências externas.
- [ ] **Doc:** Documento de infra (`docs/DOMINIO-PERSONALIZADO-INFRA.md`) deixa claro: aplicação só resolve por host/slug; DNS, Nginx e SSL são externos.

---

## 5. Checklist final (validar com segurança)

- [ ] **Prisma:** `npx prisma generate`; migration em ambiente controlado (`npx prisma migrate dev --name add_custom_domain`).
- [ ] **Backend:** `GET /public/store/by-host?host=menu.exemplo.com` retorna a loja quando o establishment tem `customDomain = 'menu.exemplo.com'`.
- [ ] **Backend:** `GET /public/store/:slug` continua funcionando; rotas por slug inalteradas.
- [ ] **Frontend:** Com host padrão (`NEXT_PUBLIC_APP_HOST`) e URL `/{slug}`, comportamento igual ao atual.
- [ ] **Frontend:** Com host custom e path `/`, cardápio carrega; `/cart`, `/checkout`, `/success`, `/failure`, `/order/[id]` funcionam no mesmo host.
- [ ] **Admin:** Campo domínio personalizado no formulário de estabelecimento; instruções e aviso de dependências externas; exibição do domínio atual na página do estabelecimento.
- [ ] **Rollback:** Remover campo `customDomain` do schema (migration reversa), reverter alterações em store-public e frontend; manter slug como única forma de acesso.
