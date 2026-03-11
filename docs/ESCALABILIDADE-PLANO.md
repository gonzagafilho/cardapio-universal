# Plano de escalabilidade – Cardápio Universal / Nexora

Documento técnico para preparar a base para escala futura (milhares de restaurantes) **sem quebrar** o ambiente atual (VPS, PM2, Nginx, deploy simples).

---

## 1. Raio-X da arquitetura atual

### 1.1 Repositório e aplicações

| Aplicação | Localização | Stack | Deploy |
|-----------|-------------|--------|--------|
| **API (backend)** | Raiz do repo | NestJS 10, Prisma 5, PostgreSQL, Express | `npm run build` → `node dist/main` (PM2) |
| **App público** | `frontend/` | Next.js 14, Tailwind | Build estático/SSR; servido por Nginx ou outro processo |
| **Admin** | `admin/` | Next.js, Tailwind | Idem; outro host ou path |

- Uma única API NestJS atende **admin** e **app público** (CORS por origem).
- Prefixo global da API: `env.apiPrefix` (ex.: `api`). Swagger em `/{apiPrefix}/docs`.
- **Banco:** PostgreSQL; Prisma como ORM; migrations em `prisma/migrations`.

### 1.2 Backend – módulos e fluxos críticos

- **Auth:** JWT (access + refresh), onboarding (tenant + establishment + user + trial), login.
- **StorePublic (API pública do cardápio):** `GET by-host`, `GET :slug`, categories, products, settings. **Sem cache**; toda requisição bate no Prisma.
- **Uploads:** Multer com `diskStorage` em `./uploads`; serviço retorna URL relativa (placeholder para produção). **Sem abstração** para trocar por S3/GCS.
- **Payments/Billing:** Webhooks Mercado Pago (PIX, assinaturas); processamento **síncrono** no handler.
- **Orders, Products, Categories, etc.:** CRUD autenticado; tenant via JWT.

### 1.3 Infra e dependências

- **Sem Redis** no projeto (apenas `lru-cache` em dependências transitivas de ferramentas).
- **Sem fila** (Bull/BullMQ ou similar).
- **Sem rate limit** (nenhum Throttler ou middleware de limite).
- **Logs:** `Logger` do Nest em alguns serviços (Payments, Billing); `AllExceptionsFilter` loga erro com método e URL; `main.ts` usa `console.log`/`console.error`. **Sem requestId** nem tenantId estruturado em todas as requisições.
- **Config:** `ConfigModule` global (env + database, auth, mercadopago). Variáveis em `.env` / ambiente.
- **PM2/Nginx:** Não versionados no repo; assumidos externos.

### 1.4 Separação app / admin / API

- **API:** Uma única aplicação NestJS; rotas públicas (`@Public()`) vs autenticadas; tenant extraído do JWT.
- **App e Admin:** Dois frontends Next.js em pastas distintas; consomem a mesma API. Separação é por **deploy/host**, não por código compartilhado no backend.

---

## 2. Gargalos reais (hoje)

| Gargalo | Onde | Impacto quando crescer |
|--------|------|-------------------------|
| **Leitura do cardápio sempre no banco** | `StorePublicService`: getStoreByHost, getStoreBySlug, getCategories, getProducts, getSettings | Muitos acessos ao cardápio público aumentam carga no PostgreSQL; latência por request. |
| **Webhooks síncronos** | `PaymentsController`, `BillingController`: webhooks MP | Resposta lenta ao gateway; se processamento demorar, risco de timeout e retentativas. |
| **Sem rate limit** | Auth (login, onboarding), API pública | Abuso (força bruta, scraping, DDoS) sem mitigação. |
| **Logs pouco correlacionáveis** | Filter loga método+URL+stack; sem id por request | Difícil rastrear uma requisição em múltiplos logs. |
| **Upload em disco local** | `UploadsModule`: diskStorage em `./uploads` | Um único servidor; sem CDN; backup e escala horizontal limitados. |
| **Nenhum ponto de extensão para cache/fila** | Código acoplado a Prisma e chamadas diretas | Inserir Redis ou fila depois exige refatoração maior. |

---

## 3. Melhorias mínimas seguras (agora)

Objetivo: **preparar o código** sem mudar comportamento de produção nem adicionar infra nova (Redis, fila, etc.).

### 3.1 Logs mais organizados (requestId)

- **Middleware** que atribui um `requestId` (UUID) a cada requisição e o expõe em `request.requestId` (e opcionalmente no header de resposta `X-Request-Id`).
- **AllExceptionsFilter** passa a logar também `requestId` (e, quando houver, tenantId do JWT) para correlacionar erros com a requisição.

**Benefício:** Quando houver mais logs (cache, fila, etc.), todos poderão incluir o mesmo `requestId`. Nenhuma dependência nova.

### 3.2 Ponto de extensão para storage (uploads)

- **Interface** `IStorageAdapter` (ou similar) com `saveImage` e `deleteImage`.
- Implementação **atual** (disco local / URL relativa) vira a implementação padrão.
- `UploadsService` usa o adapter via injeção; em produção continua igual; no futuro basta registrar outro adapter (ex.: S3) sem alterar controller nem assinaturas públicas.

**Benefício:** Storage externo (S3, GCS) pode ser plugado depois sem quebrar deploy atual.

### 3.3 Documentar pontos para cache e rate limit

- No próprio código ou em comentário/doc: **StorePublicService** é o candidato a cache por tenant/slug (ex.: chave `store:${slug}`, TTL curto).
- Rotas críticas para rate limit: `POST /auth/login`, `POST /auth/onboarding`, `GET /public/store/*` (e webhooks, se desejado). **Não** adicionar pacote de rate limit nesta etapa; apenas deixar indicado onde aplicar quando houver Redis ou throttler.

---

## 4. O que deixar para fase seguinte

- **Cache (Redis):** Quando houver Redis na infra, introduzir módulo de cache e usar em `StorePublicService` (getStoreByHost, getStoreBySlug, getCategories, getProducts, getSettings) com invalidação por tenant/establishment. **Não** implementar cache em memória forte agora (risco de inconsistência entre instâncias).
- **Fila (webhooks/jobs):** Quando houver fila (Bull + Redis, ou SQS, etc.), mover o processamento pesado dos webhooks (MP) para job assíncrono; o endpoint do webhook apenas enfileira e responde 200 rápido.
- **Rate limit:** Com mesmo Redis (ou throttler do Nest), aplicar limites em login, onboarding e, se necessário, em rotas públicas. Configurar por IP e/ou por tenant.
- **Monitoramento:** Métricas (ex.: Prometheus), health avançado (dependências), alertas e dashboard ficam para quando a operação justificar (ex.: segundo servidor, SLA).
- **Separação física de serviços:** Manter API única até que carga ou equipe exijam separar (ex.: API pública em um processo, admin em outro). Plano não inclui microserviços nesta etapa.

---

## 5. Patch por arquivo (implementação mínima)

Apenas os arquivos necessários para: (1) requestId + log no filter, (2) interface de storage + implementação atual.

### 5.1 Middleware requestId

- **Arquivo novo:** `src/common/middleware/request-id.middleware.ts`  
  - Gera UUID, seta em `request.requestId`, opcionalmente seta header `X-Request-Id` na resposta.

- **AppModule / main:** Registrar o middleware globalmente (para todas as rotas).

### 5.2 AllExceptionsFilter

- **Arquivo:** `src/common/filters/http-exception.filter.ts`  
  - Incluir no log: `request.requestId`, e se existir `request.user?.tenantId` (ou equivalente do JWT).

### 5.3 Uploads – interface e adapter local

- **Arquivo novo:** `src/modules/uploads/interfaces/storage-adapter.interface.ts`  
  - Interface com `saveImage(...)` e `deleteImage(...)` (assinaturas compatíveis com o uso atual).

- **Arquivo novo:** `src/modules/uploads/adapters/local-storage.adapter.ts`  
  - Implementação que replica o comportamento atual (retorno de URL relativa; delete sem efeito em arquivo real se não houver arquivo).

- **Arquivo:** `src/modules/uploads/uploads.module.ts`  
  - Registrar o adapter local como implementação da interface (provider + useClass).

- **Arquivo:** `src/modules/uploads/uploads.service.ts`  
  - Injetar e usar o adapter em vez de implementar direto no serviço (manter mesma API pública).

### 5.4 Documentação no código (cache / rate limit)

- **Arquivo:** `src/modules/store-public/store-public.service.ts`  
  - Comentário no topo da classe (ou nos métodos getStoreByHost, getStoreBySlug, getCategories, getProducts, getSettings) indicando que são candidatos a cache por tenant/slug quando houver camada de cache.

- **Arquivo:** `src/modules/auth/auth.controller.ts`  
  - Comentário indicando que login e onboarding são candidatos a rate limit quando houver throttler/Redis.

---

## 6. Checklist de evolução

### Fase atual (sem quebrar produção)

- [ ] Aplicar patches acima (requestId, filter, storage interface + local adapter, comentários).
- [ ] Build da API: `npm run build` na raiz.
- [ ] Testar login e onboarding; testar uma rota pública (by-host ou :slug); testar upload de imagem.
- [ ] Deploy como hoje (PM2/Nginx); validar que nada mudou de comportamento.
- [ ] (Opcional) Configurar log para stdout em JSON (ex.: logger com formato JSON) em fase posterior.

### Fase seguinte (quando houver Redis)

- [ ] Adicionar `@nestjs/cache-manager` + Redis; configurar TTL curto (ex.: 60–300 s) para store público.
- [ ] Em StorePublicService, consultar cache antes do Prisma; invalidar cache (por chave tenant/slug) em writes de Establishment/Category/Product/Settings.
- [ ] Rate limit: `@nestjs/throttler` com storage Redis nas rotas de auth e, se necessário, em public/store.

### Fase seguinte (fila)

- [ ] Adicionar Bull (ou similar) com Redis; criar fila para processamento de webhooks.
- [ ] Webhooks MP: enfileirar payload e responder 200; worker processa e atualiza ordem/assinatura.
- [ ] Manter idempotência e tratamento de erro no worker.

### Fase seguinte (storage externo)

- [ ] Implementar adapter S3 (ou GCS) que implementa a mesma interface; configurar bucket e credenciais.
- [ ] Registrar adapter S3 em produção; manter adapter local em desenvolvimento se desejado.
- [ ] Migrar arquivos já em disco para o bucket (script one-off) se necessário.

---

## Resumo

- **Arquitetura atual:** Uma API NestJS, dois frontends (app + admin), Prisma + PostgreSQL, sem Redis/fila, sem rate limit, upload em disco, logs sem requestId.
- **Gargalos reais:** Cardápio público 100% no banco; webhooks síncronos; ausência de rate limit e de logs correlacionáveis; upload local sem abstração.
- **Agora:** RequestId em middleware + log no filter; interface de storage + adapter local; comentários indicando onde colocar cache e rate limit depois. Nenhuma mudança de contrato de API nem de deploy.
- **Depois:** Cache no store público, rate limit, fila para webhooks, storage externo, monitoramento; cada passo opcional e incremental.
