# Restaurante Demo Vendável — Cardápio Nexora

Documento das 6 etapas: diagnóstico, desenho comercial, seed, ajustes no app, validação e rollback.  
**Modo produção segura:** backup → alteração mínima → validação.

---

## ETAPA 1 — Diagnóstico do banco/modelos atuais

### Schema Prisma (resumo)

- **Tenant**: `id`, `name`, `slug` (único), `primaryColor`, `secondaryColor`, `logoUrl`, `isActive`, etc.
- **Establishment**: `id`, `tenantId`, `name`, `slug` (único por tenant), `description`, `logoUrl`, `bannerUrl`, `phone`, `whatsapp`, `addressLine`, `city`, `state`, etc.
- **Category**: `tenantId`, `establishmentId`, `name`, `description`, `sortOrder`, `isActive`.
- **Product**: `tenantId`, `establishmentId`, `categoryId`, `name`, `slug` (único por establishment), `description`, `imageUrl`, `price`, `compareAtPrice` (preço riscado), `isFeatured`, `sortOrder`, `isActive`.
- **OptionalGroup** / **OptionalItem**: opcionais por produto (N:N com Product via ProductOptionalGroup).
- **StoreSettings**: por estabelecimento (tenantId + establishmentId), `deliveryFee`, `minimumOrderAmount`, `estimatedDeliveryTimeMin/Max`, `acceptsDelivery`, `acceptsPickup`, `acceptsDineIn`, `currency`. **Não há** `primaryColor` no schema — fica no **Tenant**.
- **EstablishmentWorkingHours**: por dia da semana (`weekday`), `openTime`, `closeTime`, `isClosed`.

### App público (consumo)

- **URL do cardápio:** `GET /public/store/:slug` — o `slug` é o **slug do Establishment**, não do Tenant.
- **Endpoints:** `/:slug`, `/:slug/categories`, `/:slug/products`, `/:slug/products/:id`, `/:slug/settings`.
- **Frontend** espera:
  - **Product:** `price`, `promotionalPrice` (número), `optionGroups` (array de grupos com `items`).
  - **API Prisma** devolve: `compareAtPrice` (Decimal), `optionalGroups` (array de `{ optionalGroup }`). Ou seja, é necessário mapear na API ou no frontend.
  - **StoreSettings** no frontend: `primaryColor`, `openHours`, `minimumOrder`, `deliveryEstimate`. No backend, `primaryColor` está no Tenant; `openHours` vêm de EstablishmentWorkingHours, não de StoreSettings.

### Seed existente

- **Arquivo:** `prisma/seed.ts`.
- **Comando:** `npm run prisma:seed` ou `npx prisma db seed`.
- Cria: tenant `cardapio-demo`, establishment `restaurante-demo`, categorias (Pizzas, Bebidas), 4 produtos, opcionais “Extras”, StoreSettings, horários.
- **Slug público atual:** `restaurante-demo`.

### QR Code

- O schema tem modelo **Table** (mesa/comanda), sem campo específico de “QR Code”. O link do cardápio é fixo: `{baseUrl}/{establishmentSlug}`. Um QR pode apontar para esse URL (gerado externamente ou por ferramenta de QR). Nenhuma alteração de schema necessária para “QR do cardápio demo”.

---

## ETAPA 2 — Desenho da demo comercial

### Restaurante

| Campo            | Valor |
|------------------|--------|
| Nome             | Pizzaria Bella Massa |
| Slug público     | `pizzaria-bella-massa` |
| Descrição        | Pizzas artesanais e massas frescas. Ambiente aconchegante e delivery rápido. |
| Telefone/WhatsApp| (61) 3333-0000 |
| Cidade/Estado    | Brasília, DF |
| Identidade       | Tenant com `primaryColor` e `secondaryColor` para o tema do cardápio |

### Tenant (conta demo comercial)

- **Nome:** Nexora Demo (ou Cardápio Nexora Demo).
- **Slug:** `nexora-demo`.
- **Cores:** ex.: primária `#c2410c`, secundária `#9a3412` (tom pizzaria).

### Categorias (ordem de exibição)

1. **Destaques** — sortOrder 0 (promoções e combos)  
2. **Pizzas Tradicionais** — sortOrder 1  
3. **Pizzas Especiais** — sortOrder 2  
4. **Bebidas** — sortOrder 3  
5. **Sobremesas** — sortOrder 4  

### Produtos (exemplo comercial)

| Nome                | Categoria           | Preço (R$) | compareAtPrice (R$) | Slug                  | Destaque |
|---------------------|---------------------|------------|---------------------|------------------------|----------|
| Combo Família       | Destaques           | 89,90      | 110,00              | combo-familia         | Sim      |
| Mussarela           | Pizzas Tradicionais | 45,90      | —                   | mussarela              | Sim      |
| Margherita          | Pizzas Tradicionais | 48,90      | —                   | margherita             | Sim      |
| Calabresa           | Pizzas Tradicionais | 47,90      | 52,90               | calabresa              | Sim      |
| Frango com Catupiry | Pizzas Especiais    | 52,90      | —                   | frango-catupiry        | Sim      |
| Portuguesa          | Pizzas Especiais    | 54,90      | —                   | portuguesa             | Sim      |
| Coca-Cola 2L        | Bebidas             | 12,00      | —                   | coca-cola-2l           | Não      |
| Guaraná Lata        | Bebidas             | 5,00       | —                   | guarana-lata           | Não      |
| Pudim               | Sobremesas          | 14,90      | —                   | pudim                  | Não      |
| Petit Gateau        | Sobremesas          | 18,90      | —                   | petit-gateau           | Sim      |

- Descrições curtas e comerciais; `imageUrl` opcional (placeholder ou vazio para estrutura pronta).
- Um grupo de opcionais “Extras” (Bacon, Queijo Extra, Molho Especial) vinculado às pizzas, para demonstrar opcionais no modal. Pizzas com Extras: Mussarela, Margherita, Calabresa, Frango Catupiry, Portuguesa.
- **Identidade visual:** `establishment.logoUrl` e `establishment.bannerUrl` com URLs (ex.: Unsplash); `establishment.email` para contato. Exibidos no app público (StoreHeader, StoreBanner).

### StoreSettings (demo)

- `acceptsDelivery`, `acceptsPickup`, `acceptsDineIn`: true.
- `minimumOrderAmount`: 30,00.
- `estimatedDeliveryTimeMin/Max`: 40–55 min.
- `currency`: BRL.

### Horário de funcionamento

- Seg–Sáb: 11:00–23:00.
- Domingo: fechado.

---

## ETAPA 3 — Seed proposta

- **Arquivo:** `prisma/seed-demo-comercial.ts`.
- **Comando (somente este seed):**  
  `npx ts-node -r tsconfig-paths/register prisma/seed-demo-comercial.ts`  
  (ou o comando equivalente que você usar para rodar um único arquivo ts no projeto).
- A seed usa **upsert** por identificadores únicos (tenant por slug, establishment por tenantId+slug, produtos por establishmentId+slug, etc.) para ser idempotente e segura em produção.
- **Não altera** o `seed.ts` atual; a demo comercial é um tenant/establishment separados (slug público `pizzaria-bella-massa`).

---

## ETAPA 4 — Ajustes necessários no backend/app para exibir a demo

1. **API pública — formato do produto (frontend)**  
   - No `StorePublicService`, ao devolver produtos (e produto por id), mapear:
     - `compareAtPrice` → `promotionalPrice` (número).
     - `price` → número (Decimal para number).
     - `optionalGroups` → `optionGroups`: para cada elemento, usar `optionalGroup` e mapear `items` com `price` em número.
   - Assim o cardápio público exibe preço promocional e opcionais corretamente sem mudar o frontend.

2. **API pública — settings (cores e horários)**  
   - Em `getSettings(tenantId, establishmentId)`:
     - Buscar **Tenant** (primaryColor, secondaryColor) e **EstablishmentWorkingHours**.
     - Devolver objeto que inclua `primaryColor`, `secondaryColor` e `openHours` no formato esperado pelo frontend (ex.: `{ sun: { open, close } | null, ... }`).
   - Opcional: incluir no response de store (getStoreBySlug) as cores do tenant se o frontend usar do “store” em vez de “settings”.

3. **Imagens**  
   - Deixar `imageUrl` e `logoUrl`/`bannerUrl` vazios ou com placeholder na seed; quando houver CDN/upload, preencher pelos painéis ou por nova seed.

4. **QR Code**  
   - Nenhuma alteração obrigatória. Link do cardápio: `https://<seu-dominio>/pizzaria-bella-massa`. Gerar QR para esse URL com qualquer ferramenta externa.

---

## ETAPA 5 — Comandos para executar seed e testar

### Pré-requisitos

- Banco aplicado: `npx prisma migrate deploy` (ou `prisma migrate dev` em dev).
- Variável `DATABASE_URL` definida.

### Backup (obrigatório em produção)

```bash
# Exemplo PostgreSQL (ajuste DB_NAME e path)
pg_dump $DATABASE_URL -F c -f ./backup_antes_demo_$(date +%Y%m%d_%H%M%S).dump
```

Ou, se usar apenas arquivo SQL:

```bash
pg_dump $DATABASE_URL > backup_antes_demo_$(date +%Y%m%d_%H%M%S).sql
```

### Executar apenas a seed comercial (não substitui o seed padrão)

```bash
cd /home/servidor-dcnet/cardapio-universal
npm run prisma:seed:demo
```

Ou diretamente:

```bash
npx ts-node prisma/seed-demo-comercial.ts
```

### Testar

1. **API:**  
   `GET /public/store/pizzaria-bella-massa`  
   Deve retornar o establishment “Pizzaria Bella Massa” e tenant.
2. **Frontend (cardápio):**  
   Abrir `https://<frontend>/pizzaria-bella-massa` e conferir categorias, produtos, preços e opcionais.
3. **Login admin:**  
   Se a seed criar usuário admin para o tenant da demo, testar login no painel com esse tenant/establishment.

---

## ETAPA 6 — Rollback

- A seed comercial **não remove** dados; apenas faz upsert. Para “desfazer” a demo:
  1. **Remover apenas os dados da demo** (recomendado em produção):  
     - Deletar em cascata a partir do **Establishment** com slug `pizzaria-bella-massa` (ou do **Tenant** da demo, se for exclusivo da demo). No Prisma, deletar o establishment (ou o tenant) remove categorias, produtos, settings, horários etc.  
     - Exemplo via script Prisma ou SQL (cuidado em produção):  
       - Buscar `establishmentId` onde `slug = 'pizzaria-bella-massa'` e `tenant.slug = 'nexora-demo'`.  
       - Deletar `Order`, `OrderItem`, `Cart`, `CartItem`, `Product`, `Category`, `StoreSettings`, `EstablishmentWorkingHours`, etc. desse establishment e, por fim, o Establishment e, se desejado, o Tenant e o User do admin demo.
  2. **Restaurar backup do banco:**  
     Se tiver feito backup antes da seed:  
     `pg_restore -d $DATABASE_URL -c backup_antes_demo_YYYYMMDD_HHMMSS.dump`  
     (ou recriar o banco e importar o .sql).

- **Não** é necessário reverter migrations; a seed não altera o schema.

---

## Entrega — Demo comercial evoluída

### 1. Diagnóstico real (arquivos alterados/criados)

| Arquivo | Ação | Impacto |
|---------|------|--------|
| `prisma/seed-demo-comercial.ts` | **Alterado** — identidade visual (logoUrl, bannerUrl, email), categoria Destaques, Combo Família, Margherita, opcionais em Margherita. | Apenas tenant `nexora-demo` e establishment `pizzaria-bella-massa`; upsert idempotente; não altera outros tenants. |
| `docs/DEMO-COMERCIAL-RESTAURANTE.md` | **Alterado** — tabela de categorias/produtos e nota de identidade visual. | Apenas documentação. |

**Não alterados:** Nginx, PM2, billing, onboarding, store-public.service, seed.ts, schema.prisma.

### 2. Plano técnico (ordem da implementação)

1. Evoluir `seed-demo-comercial.ts`: establishment com `logoUrl`, `bannerUrl`, `email`; categorias com Destaques (sortOrder 0) e renumeração das demais; produtos Combo Família (Destaques) e Margherita (Pizzas Tradicionais); `pizzaSlugs` incluindo `margherita` para opcionais.
2. Atualizar documentação em `docs/DEMO-COMERCIAL-RESTAURANTE.md`.

### 3. Código — caminhos e pontos de inserção

- **`/home/servidor-dcnet/cardapio-universal/prisma/seed-demo-comercial.ts`**
  - Constantes `LOGO_URL` e `BANNER_URL` (Unsplash) e campos `logoUrl`, `bannerUrl`, `email` no upsert do Establishment (create e update).
  - Array `categoriesData`: entrada `{ name: 'Destaques', description: '...', sortOrder: 0 }` e sortOrder 1–4 para as demais categorias.
  - `catDestaques` no destructuring das categorias.
  - `productsData`: primeiro item Combo Família (categoryId: catDestaques.id); Margherita após Mussarela em Pizzas Tradicionais; sortOrder de Calabresa ajustado para 2.
  - `pizzaSlugs`: incluir `'margherita'` para vincular Extras à Margherita.

### 4. Checklist final (testar sem quebrar produção)

- [ ] **Backup:** Em produção, fazer backup do banco antes de rodar a seed (`pg_dump` ou equivalente).
- [ ] **Seed:** Rodar apenas `npm run prisma:seed:demo` (não rodar `prisma:seed` para não sobrescrever outros dados).
- [ ] **API:** `GET /public/store/pizzaria-bella-massa` retorna establishment com `logoUrl`, `bannerUrl`, nome Pizzaria Bella Massa.
- [ ] **App público:** Abrir `/{baseUrl}/pizzaria-bella-massa` e conferir: banner e logo no topo; categoria Destaques com Combo Família; Pizzas Tradicionais com Mussarela e Margherita; preços e compareAtPrice; opcionais Extras nas pizzas.
- [ ] **Tenants reais:** Confirmar que outros tenants/establishments não foram alterados (seed usa upsert por tenant slug e establishment slug).
- [ ] **QR / link demo:** O link do cardápio demo é `https://<seu-dominio>/pizzaria-bella-massa`; gerar QR para esse URL se necessário.
- [ ] **Rollback:** Se precisar remover a demo, deletar o establishment (ou tenant) `nexora-demo`/`pizzaria-bella-massa` em cascata; não reverter migrations.

---

## Resumo de arquivos

| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Nenhuma (já contém Tenant, Establishment, Category, Product, StoreSettings, WorkingHours). |
| `prisma/seed.ts` | Nenhuma (mantido como está). |
| `prisma/seed-demo-comercial.ts` | **Evoluído** — Pizzaria Bella Massa com identidade visual, Destaques, Combo Família, Margherita. |
| `src/modules/store-public/store-public.service.ts` | **Ajuste** (se necessário) — mapear produtos (promotionalPrice, optionGroups, numbers) e settings (primaryColor, openHours). |
| `package.json` | Script `prisma:seed:demo` já existe e chama `seed-demo-comercial.ts`. |

Com isso, a demo fica comercial, vendável e segura para uso em apresentação e produção.
