# Operação em Produção — NEXORA

Documentação mínima para deploy e validação pós-deploy.

## Variáveis de ambiente

### Backend (raiz do projeto)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NODE_ENV` | Sim | `production` em produção |
| `PORT` | Sim | Porta do backend (ex.: 3023) |
| `API_PREFIX` | Sim | `api` |
| `DATABASE_URL` | Sim | Connection string PostgreSQL |
| `JWT_SECRET` | Sim | Chave para access token (trocar em produção) |
| `JWT_EXPIRES_IN` | Não | Ex.: `7d` |
| `JWT_REFRESH_SECRET` | Sim | Chave para refresh token |
| `JWT_REFRESH_EXPIRES_IN` | Não | Ex.: `30d` |
| `CORS_ORIGINS` | Recomendado | Origens permitidas separadas por vírgula (admin e app) |
| `PUBLIC_API_URL` | Produção | URL pública da API (ex.: https://api.cardapio.nexoracloud.com.br) |
| `APP_PUBLIC_URL` | Produção | URL do app público (ex.: https://app.cardapio.nexoracloud.com.br) |
| `REDIS_URL` | Opcional | Ex.: `redis://localhost:6379` — cache e filas; se vazio, cache em memória |
| `REDIS_CACHE_TTL` | Opcional | TTL do cache em segundos (padrão 300) |
| `UPLOAD_*` | Não | Limites de upload (ver .env.example) |
| `MERCADOPAGO_*` | Opcional | Billing/assinaturas (ver .env.example) |

### Frontend (pasta `frontend`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_APP_HOST` | Sim | Host do site principal (ex.: app.cardapio.nexoracloud.com.br) |
| `NEXT_PUBLIC_APP_URL` | Sim | URL completa do app |
| `NEXT_PUBLIC_API_URL` | Sim | URL da API (ex.: https://api.cardapio.nexoracloud.com.br/api) |
| `NEXT_PUBLIC_ADMIN_URL` | Não | URL do painel admin |

### Admin (pasta `admin`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | Sim | URL da API |
| Outras | Conforme uso | Ver admin/.env.production se existir |

## Build e processos

- **Backend:** `npm run build` (raiz) → `node dist/main` ou `npm run start:prod`. Porta típica: 3023.
- **Frontend:** `cd frontend && npm run build && npm run start`. Porta típica: 3021.
- **Admin:** `cd admin && npm run build && npm run start`. Porta típica: 3022.

## Ordem segura de deploy

1. Backend: migrar banco se necessário (`npx prisma migrate deploy`), depois subir o processo.
2. Frontend: build e start (depende da API no ar para chamadas server-side se houver).
3. Admin: build e start.
4. Validar health: `GET /api/health` na API.

## PM2 (exemplo)

```bash
# Raiz do projeto
pm2 start dist/main.js --name api -- -p 3023
pm2 start npm --name app -- start --prefix frontend   # ou "next start -p 3021" no frontend
pm2 start npm --name admin -- start --prefix admin   # ou "next start -p 3022" no admin
pm2 save
```

Restart após deploy:

```bash
pm2 restart api
pm2 restart app
pm2 restart admin
```

## Validação pós-deploy

- `curl -s -o /dev/null -w "%{http_code}" https://api.cardapio.nexoracloud.com.br/api/health` → 200
- Abrir app e admin no browser; login; criar pedido de teste; conferir cozinha/websocket.

## Nginx e WebSocket

Arquivo de referência: `nginx-cardapio-nexora.conf`.

- **API:** `server_name api.cardapio.nexoracloud.com.br` → `proxy_pass http://127.0.0.1:3023`. Headers de proxy e **Upgrade / Connection** já configurados para WebSocket.
- **App:** `server_name app.cardapio.nexoracloud.com.br` → app em :3021; `/api/` repassado para :3023. Upgrade/Connection para WebSocket no location `/`.
- **Admin:** `server_name admin.cardapio.nexoracloud.com.br` → admin em :3022; `/api/` para :3023. Upgrade/Connection no location `/`.

Cozinha/pedidos em tempo real usam WebSocket na mesma origem da API (ou via app/admin que fazem requests à API); o proxy com Upgrade/Connection cobre o upgrade de conexão.

**Hosts customizados (domínio por loja):** o arquivo atual **não** inclui `server` blocks para domínios customizados (ex.: `loja.seudominio.com`). Cada domínio customizado exige um `server` block próprio com certificado e `proxy_pass` para o app (3021), ou uso de wildcard SSL e lógica no app. Documentar em DOMINIO-PERSONALIZADO-*.md conforme já existente.

**Sugestões opcionais (sem alterar produção sem necessidade):**

- `client_max_body_size 10M;` no server da API se houver upload de imagens.
- `proxy_read_timeout 60s;` e `proxy_send_timeout 60s;` nos locations de API se precisar de timeouts maiores.

Risco: alterar nginx em produção pode derrubar tráfego; aplicar em janela de manutenção e testar antes.

## Rollback básico

- Manter o commit/build anterior conhecido (ex.: `git rev-parse HEAD` antes do deploy).
- Em caso de falha: `git checkout <commit-anterior>` na raiz; `npm run build`; reiniciar processos (ex.: `pm2 restart api app admin`).
- Se houver migração de banco aplicada, avaliar se é reversível antes de rodar rollback.
