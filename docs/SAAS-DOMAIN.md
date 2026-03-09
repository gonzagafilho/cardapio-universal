# Cardápio Universal — Domínio SaaS

Domínio base: **nexoracloud.com.br**

| Aplicação | Subdomínio | Porta local (exemplo) |
|-----------|------------|------------------------|
| Admin (Next.js) | admin.cardapio.nexoracloud.com.br | 3001 |
| App loja (Next.js) | app.cardapio.nexoracloud.com.br | 3002 |
| API (NestJS) | api.cardapio.nexoracloud.com.br | 3000 |

---

## 1. Variáveis de ambiente

### 1.1 API (NestJS) — raiz do projeto

Arquivo: `.env` na raiz (`C:\Projetos\cardapio-universal\.env`).

```env
NODE_ENV=production
PORT=3000
API_PREFIX=api

# CORS: origens permitidas (separadas por vírgula). Vazio = permite todas.
CORS_ORIGINS=https://admin.cardapio.nexoracloud.com.br,https://app.cardapio.nexoracloud.com.br

DATABASE_URL="postgresql://..."
JWT_SECRET=...
JWT_REFRESH_SECRET=...
# (demais variáveis do .env.example)
```

### 1.2 Admin (Next.js)

Arquivo: `admin/.env.local` (ou `admin/.env.production`).

```env
# URL base da API (obrigatório em produção)
NEXT_PUBLIC_API_URL=https://api.cardapio.nexoracloud.com.br/api
```

### 1.3 Frontend / App loja (Next.js)

Arquivo: `frontend/.env.local` (ou `frontend/.env.production`).

```env
# URL base da API (obrigatório em produção)
NEXT_PUBLIC_API_URL=https://api.cardapio.nexoracloud.com.br/api
```

**Resumo:** Em produção, defina `NEXT_PUBLIC_API_URL` em admin e frontend apontando para `https://api.cardapio.nexoracloud.com.br/api` e, na API, `CORS_ORIGINS` com as duas origens dos Next (admin e app).

---

## 2. Next.js — aceitar domínio externo

Nenhuma alteração obrigatória no `next.config.js`. O Next já aceita requisições em qualquer host; o roteamento por subdomínio é feito pelo nginx (ou outro proxy).

- **Admin:** `admin/next.config.js` — manter como está.
- **Frontend:** `frontend/next.config.js` — manter como está.

As variáveis `NEXT_PUBLIC_*` são injetadas em tempo de build; use `.env.production` ou `.env.local` no deploy para que o build use as URLs corretas.

Se no futuro for necessário restringir hosts (ex.: redirect por domínio), pode-se usar `async headers()` ou `async redirects()` em `next.config.js` com base em `process.env.NEXT_PUBLIC_APP_URL`.

---

## 3. Exemplo de configuração nginx (produção)

Supondo:

- API rodando em `localhost:3000`
- Admin em `localhost:3001`
- Frontend em `localhost:3002`

Certificado SSL pode ser feito com Let's Encrypt (ex.: `certbot`).

```nginx
# API
server {
    listen 80;
    server_name api.cardapio.nexoracloud.com.br;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name api.cardapio.nexoracloud.com.br;

    ssl_certificate     /etc/letsencrypt/live/nexoracloud.com.br/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/nexoracloud.com.br/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin
server {
    listen 80;
    server_name admin.cardapio.nexoracloud.com.br;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name admin.cardapio.nexoracloud.com.br;

    ssl_certificate     /etc/letsencrypt/live/nexoracloud.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nexoracloud.com.br/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# App loja (frontend)
server {
    listen 80;
    server_name app.cardapio.nexoracloud.com.br;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name app.cardapio.nexoracloud.com.br;

    ssl_certificate     /etc/letsencrypt/live/nexoracloud.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nexoracloud.com.br/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ajuste os caminhos do SSL e as portas conforme seu ambiente.

---

## 4. Rotas base da API

Prefixo global: `API_PREFIX` (padrão `api`). Base: **`/api`**.

| Recurso | Base path |
|---------|-----------|
| Auth | `/api/auth` |
| Health | `/api/health` |
| Tenants | `/api/tenants` |
| Establishments | `/api/establishments` |
| Categories | `/api/categories` |
| Products | `/api/products` |
| Product options | aninhado em `/api/products/:productId/options` |
| Orders | `/api/orders` |
| Carts | `/api/carts` |
| Customers | `/api/customers` |
| Coupons | `/api/coupons` |
| Payments | `/api/payments` |
| Settings | `/api/settings` |
| Users | `/api/users` |
| Uploads | `/api/uploads` |
| Delivery zones | `/api/delivery-zones` |
| Reports | `/api/reports` |
| Audit | `/api/audit` |
| **Loja pública** | `/api/public/store` |

Documentação Swagger (se habilitada): **`/api/docs`**.

URL completa da API em produção: `https://api.cardapio.nexoracloud.com.br/api`.
