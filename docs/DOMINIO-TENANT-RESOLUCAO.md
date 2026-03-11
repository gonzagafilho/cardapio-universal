# Resolução de tenant por domínio – Cardápio Universal / Nexora

Este documento descreve a **arquitetura**, **configuração** e **testes** para suportar:

- **Subdomínio padrão:** `empresa.cardapio.app` → cardápio da loja com slug `empresa`
- **Domínio customizado:** `menu.empresa.com.br` → cardápio da loja que tem `customDomain = menu.empresa.com.br`

---

## 1. Arquitetura proposta

### 1.1 Fluxo geral

```
Requisição (Host: empresa.cardapio.app ou menu.empresa.com.br)
    │
    ├─► Frontend (Next.js)
    │       │
    │       ├─ host === APP_HOST (ex.: cardapio.app ou app.cardapio.nexora.com.br)
    │       │   → Landing / páginas por slug (/[storeSlug], /menu?store=slug)
    │       │
    │       └─ host !== APP_HOST
    │           → Tratar como “domínio da loja”: resolver loja pelo host
    │           → GET /api/public/store/by-host?host=...
    │           → Se loja encontrada: exibir cardápio em /, /cart, /checkout, etc.
    │           → Se não encontrada: 404 elegante (Domínio não encontrado)
    │
    └─► Backend (NestJS) – apenas API
            GET /public/store/by-host?host=...
                1) customDomain === host normalizado → Establishment
                2) SUBDOMAIN_BASE_DOMAIN configurado e host = subdomínio.base
                   → extrair slug do subdomínio → getStoreBySlug(slug)
                3) Senão → null (API 404)
```

### 1.2 Separação de responsabilidades

| Camada        | Responsabilidade |
|---------------|-------------------|
| **Frontend**  | Ler `Host` da requisição; se host ≠ APP_HOST, chamar `by-host` e exibir cardápio ou 404. Rotas `/`, `/cart`, `/checkout`, `/success`, `/failure`, `/order/[id]` servem conteúdo por host. Admin e API **não** usam essa regra. |
| **Backend**   | Resolver loja por host: (1) `Establishment.customDomain`, (2) subdomínio → slug. Rotas em `StorePublicController` são `@Public()`. Demais rotas (orders, admin, etc.) seguem JWT/tenant por token. |
| **Infra**     | Nginx (ou similar) encaminha vários server_name (wildcard subdomínio e domínios custom) para o mesmo app; SSL por domínio. |

### 1.3 Multi-tenant seguro

- **API pública:** Apenas `GET /public/store/*` (by-host, :slug, categories, products, settings). Sem autenticação; dados somente de leitura.
- **Admin e API autenticada:** Usam JWT e tenant/establishment do token; **não** dependem do Host da requisição para identificar tenant.
- **Domínio custom:** `Establishment.customDomain` é único globalmente (Prisma `@unique`); um domínio não pode ser usado por mais de uma loja.

---

## 2. Arquivos alterados / envolvidos

### 2.1 Backend (já existente – só referência)

| Arquivo | Função |
|--------|--------|
| `src/modules/store-public/store-public.service.ts` | `normalizeHost`, `extractSubdomainSlug`, `getStoreByHost` (customDomain → subdomínio → slug), `resolveStore` |
| `src/modules/store-public/store-public.controller.ts` | `GET by-host?host=`, `GET :slug`, categories, products, settings (todos `@Public()`) |
| `prisma/schema.prisma` | `Establishment.customDomain String? @unique` |
| `.env.example` | `SUBDOMAIN_BASE_DOMAIN` (domínio base para subdomínios) |

Nenhuma alteração obrigatória no backend para esta entrega; a lógica de resolução por domínio já está implementada.

### 2.2 Frontend (alterados nesta entrega)

| Arquivo | Alteração |
|--------|-----------|
| `frontend/src/lib/constants.ts` | `APP_URL` (NEXT_PUBLIC_APP_URL) para link “Ir para o site principal” no 404. |
| `frontend/src/components/store/DomainNotFound.tsx` | **Novo:** tela 404 elegante (domínio não encontrado) com host, texto e botão para APP_URL. |
| `frontend/src/components/store/index.ts` | Export de `DomainNotFound`. |
| `frontend/src/components/store/CustomDomainStorePage.tsx` | Quando `error \|\| !store`, renderiza `<DomainNotFound>` em vez de EmptyState genérico. |
| `frontend/src/components/store/CustomDomainCartPage.tsx` | Idem: DomainNotFound quando loja não encontrada por host. |
| `frontend/src/components/store/CustomDomainCheckoutPage.tsx` | Idem. |
| `frontend/src/components/store/CustomDomainSuccessPage.tsx` | Idem. |
| `frontend/src/components/store/CustomDomainFailurePage.tsx` | Idem. |
| `frontend/src/components/store/CustomDomainOrderPage.tsx` | Idem. |

### 2.3 Documentação

| Arquivo | Conteúdo |
|--------|----------|
| `docs/DOMINIO-TENANT-RESOLUCAO.md` | Este arquivo: arquitetura, config app/Nginx, checklist. |

---

## 3. Configuração do app

### 3.1 Backend (.env)

```env
# Domínio base para subdomínios: empresa.cardapio.app → slug "empresa"
# Deixe vazio para desabilitar resolução por subdomínio (só customDomain).
SUBDOMAIN_BASE_DOMAIN=cardapio.app
```

- **Produção (ex.: cardapio.nexoracloud.com.br):** use o domínio base real, sem subdomínio (ex.: `cardapio.nexoracloud.com.br`). Assim `empresa.cardapio.nexoracloud.com.br` gera slug `empresa`.
- **Desenvolvimento:** pode usar `localhost` só para testes com customDomain (subdomínio em localhost exige ajustes de DNS/hosts).

### 3.2 Frontend (.env / .env.production)

```env
# Host do “site principal” (landing e acesso por slug). Qualquer outro host = subdomínio ou domínio custom.
NEXT_PUBLIC_APP_HOST=app.cardapio.nexoracloud.com.br

# URL completa do app (para link "Ir para o site principal" na tela de domínio não encontrado)
NEXT_PUBLIC_APP_URL=https://app.cardapio.nexoracloud.com.br

# API (admin e frontend)
NEXT_PUBLIC_API_URL=https://api.cardapio.nexoracloud.com.br/api
```

Regra prática:

- **Host da requisição === APP_HOST** → landing ou rotas por slug (`/menu?store=slug`, `/[storeSlug]`).
- **Host da requisição !== APP_HOST** → resolução por domínio (by-host); cardápio em `/`, `/cart`, etc., ou 404 elegante.

### 3.3 Admin

O admin não usa resolução por domínio; continua com login JWT e tenant/establishment do token. Pode usar `NEXT_PUBLIC_APP_HOST` / `NEXT_PUBLIC_APP_URL` apenas para exibir links ou instruções (ex.: CNAME para domínio customizado).

---

## 4. Configuração Nginx

Objetivo: aceitar requisições em vários hosts (wildcard subdomínio + domínios custom) e encaminhar para o mesmo app (frontend) e para a API.

### 4.1 Exemplo: app público (frontend) com subdomínio + domínios custom

```nginx
# Wildcard para subdomínios: *.cardapio.app
server {
    listen 443 ssl http2;
    server_name .cardapio.app;
    # server_name inclui: cardapio.app, empresa.cardapio.app, qualquer.coisa.cardapio.app

    ssl_certificate     /etc/letsencrypt/live/cardapio.app/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/cardapio.app/privkey.pem;

    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Domínios customizados (um server por domínio ou use um mapa/lua se tiver muitos)
server {
    listen 443 ssl http2;
    server_name menu.empresa.com.br;

    ssl_certificate     /etc/letsencrypt/live/menu.empresa.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/menu.empresa.com.br/privkey.pem;

    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- **frontend_upstream:** apontar para o processo/serviço do Next.js (ex.: `http://127.0.0.1:3000`).
- **Host:** sempre repassado com `$host` para o app decidir por `host !== APP_HOST` e chamar `by-host`.

### 4.2 API (backend)

A API pode estar em um subdomínio próprio (ex.: `api.cardapio.app`). Não precisa de vários server_name para tenant; o tenant vem do JWT. Para o frontend chamar a API:

- Em produção, `NEXT_PUBLIC_API_URL` deve ser a URL da API (ex.: `https://api.cardapio.nexoracloud.com.br/api`).

### 4.3 Certificado SSL

- **Wildcard subdomínio:** certificado `*.cardapio.app` (ex.: Let’s Encrypt com DNS challenge).
- **Domínios custom:** certificado por host (ex.: `menu.empresa.com.br`). Pode automatizar com certbot ou outro ACME.

---

## 5. Checklist de teste

### 5.1 Subdomínio (empresa.cardapio.app)

- [ ] **Backend:** `SUBDOMAIN_BASE_DOMAIN=cardapio.app` (ou seu domínio base). Establishment com `slug = empresa` existe.
- [ ] **Frontend:** `NEXT_PUBLIC_APP_HOST` = host da landing (ex.: `app.cardapio.nexoracloud.com.br`), **não** `empresa.cardapio.app`.
- [ ] **DNS/Nginx:** `empresa.cardapio.app` resolve e Nginx encaminha para o app com `Host: empresa.cardapio.app`.
- [ ] Acessar `https://empresa.cardapio.app/`: carrega o cardápio da loja “empresa” (mesmo conteúdo que `/{empresa}` ou `/menu?store=empresa` no host padrão).
- [ ] Acessar `https://empresa.cardapio.app/cart`, `/checkout`, etc.: funcionam com a mesma loja.
- [ ] Acessar `https://empresa.cardapio.app/` com slug inexistente (ex.: `naoexiste.cardapio.app`): 404 elegante “Domínio não encontrado” e link “Ir para o site principal”.

### 5.2 Domínio customizado (menu.empresa.com.br)

- [ ] **Admin:** Na loja, definir `customDomain = menu.empresa.com.br` e salvar.
- [ ] **DNS:** CNAME (ou A) de `menu.empresa.com.br` apontando para o servidor do app (ou para o Nginx).
- [ ] **Nginx:** server_name `menu.empresa.com.br` e proxy com `Host` preservado; SSL configurado.
- [ ] Acessar `https://menu.empresa.com.br/`: cardápio da loja que tem esse customDomain.
- [ ] Acessar `/cart`, `/checkout`, etc.: mesma loja.
- [ ] Acessar com um host que não é customDomain nem subdomínio configurado: 404 elegante.

### 5.3 Host padrão (landing / slug)

- [ ] Acessar `https://app.cardapio.nexoracloud.com.br/` (ou o valor de APP_HOST): landing, **não** cardápio por host.
- [ ] Acessar `https://app.cardapio.nexoracloud.com.br/empresa` ou `/menu?store=empresa`: cardápio por slug; admin e API inalterados.

### 5.4 Segurança e isolamento

- [ ] API autenticada (ex.: pedidos, admin): continua exigindo JWT; tenant vem do token, não do Host.
- [ ] Apenas `GET /public/store/*` é público; nenhum dado de outro tenant vazando por troca de host.

### 5.5 404 elegante

- [ ] Em qualquer rota do app público (/, /cart, /checkout, etc.), com host que não resolve loja: exibir tela “Domínio não encontrado”, com host exibido e botão “Ir para o site principal” apontando para APP_URL.

---

## Resumo

- **Detecção:** Frontend lê `Host`; se `host !== APP_HOST`, trata como domínio da loja e chama `GET /public/store/by-host?host=...`.
- **Resolução:** Backend: (1) customDomain, (2) subdomínio (SUBDOMAIN_BASE_DOMAIN) → slug.
- **404:** Componente `DomainNotFound` em todas as páginas “por host” quando a loja não é encontrada.
- **Config:** Backend: `SUBDOMAIN_BASE_DOMAIN`. Frontend: `NEXT_PUBLIC_APP_HOST`, `NEXT_PUBLIC_APP_URL`.
- **Nginx:** server_name wildcard para subdomínios + um server (ou mapa) para cada domínio custom; proxy com `Host` preservado; SSL por domínio.
