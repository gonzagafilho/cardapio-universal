# NEXORA Operação Premium (Deploy / Reboot / Health / Rollback)

Runbook operacional único para a produção/semi-produção do Cardápio Nexora, evitando dependência de memória.

## 0. Mapa real da stack (servidor + Nginx + PM2)

- Nginx ativo (arquivo): `/etc/nginx/sites-available/cardapio-nexora`
- Rotas (TLS 443):
  - `app.cardapio.nexoracloud.com.br` → `127.0.0.1:3021` (PM2: `nexora-app`)
  - `admin.cardapio.nexoracloud.com.br` → `127.0.0.1:3022` (PM2: `nexora-admin`)
  - `api.cardapio.nexoracloud.com.br` → `127.0.0.1:3023` (PM2: `nexora-api`)
- Proxy de API nos hosts app/admin:
  - `app.cardapio.../api/` → `http://127.0.0.1:3023/api/`
  - `admin.cardapio.../api/` → `http://127.0.0.1:3023/api/`
- WebSocket: habilitado nos `location /` do `app` e do `admin` (via `Upgrade`/`Connection "upgrade"`).

## 1. Comandos reais confirmados (neste servidor)

1. Processos:
   - `pm2 list`
2. Portas:
   - `ss -ltnp | rg ":(3021|3022|3023)\\b"`
3. Health API (localhost):
   - `curl -sS http://127.0.0.1:3023/api/health`
4. Health/Up nos domínios:
   - `curl -sS -I https://app.cardapio.nexoracloud.com.br/ -k`
   - `curl -sS -I https://admin.cardapio.nexoracloud.com.br/ -k`
   - `curl -sS -I https://api.cardapio.nexoracloud.com.br/api/health -k`
5. SW/PWA (servido na prática):
   - `curl -sS https://app.cardapio.nexoracloud.com.br/sw.js -k | sed -n '1,160p'`

## 2. Plano exato (Deploy / Restart Premium)

### A) Build limpo (ordem obrigatória)

No diretório do projeto:
`cd /home/servidor-dcnet/cardapio-universal`

1. Backend (NestJS API)
   - `npm run build`
2. Frontend (Next - App público)
   - `rm -rf frontend/.next`
   - `npm --prefix frontend run build`
3. Admin (Next - painel)
   - `rm -rf admin/.next`
   - `npm --prefix admin run build`

### B) Restart PM2 (com update-env)

1. `pm2 restart nexora-api --update-env`
2. `pm2 restart nexora-app --update-env`
3. `pm2 restart nexora-admin --update-env`

Observação: se você quiser que `pm2 resurrect` reflita imediatamente o estado atual, execute:
- `pm2 save`

## 3. Execução (passo a passo, sem variações)

1. `cd /home/servidor-dcnet/cardapio-universal`
2. Build limpo:
   - `npm run build`
   - `rm -rf frontend/.next && npm --prefix frontend run build`
   - `rm -rf admin/.next && npm --prefix admin run build`
3. Restart PM2:
   - `pm2 restart nexora-api --update-env`
   - `pm2 restart nexora-app --update-env`
   - `pm2 restart nexora-admin --update-env`
4. (Opcional, recomendado) `pm2 save`

## 4. Checklist pós-deploy (mínimo aceitável)

1. Processos online:
   - `pm2 list`
2. Health API:
   - `curl -sS http://127.0.0.1:3023/api/health`
3. Hosts:
   - `curl -sS -I https://app.cardapio.nexoracloud.com.br/ -k`
   - `curl -sS -I https://admin.cardapio.nexoracloud.com.br/ -k`
4. Ativos PWA:
   - `curl -sS -I https://app.cardapio.nexoracloud.com.br/manifest.json -k`
   - `curl -sS -I https://app.cardapio.nexoracloud.com.br/offline.html -k`
   - `curl -sS -I https://app.cardapio.nexoracloud.com.br/icon-192.png -k`
5. SW correto (anti-mismatch de Server Actions):
   - `curl -sS https://app.cardapio.nexoracloud.com.br/sw.js -k | sed -n '1,160p'`
   - Verifique que existem as condições:
     - `CACHE_VERSION = 'v2'`
     - `if (u.pathname.indexOf('/_next/static/') !== -1) return true;`
6. Teste mínimo de rota pública:
   - `curl -sS -I https://app.cardapio.nexoracloud.com.br/pizzaria-bella-massa/checkout -k`

## 5. Checklist pós-reboot (servidor voltou)

1. `pm2 resurrect`
2. Portas:
   - `ss -ltnp | rg ":(3021|3022|3023)\\b"`
3. Health:
   - `curl -sS http://127.0.0.1:3023/api/health`
4. Hosts:
   - `curl -sS -I https://app.cardapio.nexoracloud.com.br/ -k`
   - `curl -sS -I https://admin.cardapio.nexoracloud.com.br/ -k`
5. SW:
   - `curl -sS https://app.cardapio.nexoracloud.com.br/sw.js -k | sed -n '1,120p'`

## 6. Rollback básico (apenas o necessário)

### Cenário A: “Failed to find Server Action”

1. Confirmar SW servido (precisa evitar `/ _next/static/` em cache):
   - `curl -sS https://app.cardapio.nexoracloud.com.br/sw.js -k | rg -n \"CACHE_VERSION|/_next/static/\"`
2. Se estiver incoerente, reaplique o padrão “build limpo + restart”:
   - `rm -rf frontend/.next && npm --prefix frontend run build`
   - `rm -rf admin/.next && npm --prefix admin run build`
   - `pm2 restart nexora-app --update-env`
   - `pm2 restart nexora-admin --update-env`
3. Revalidar SW e health (checklist pós-deploy).

### Cenário B: deploy quebrado (app/admin/api não respondem)

1. Reverter código para um commit anterior conhecido:
   - `git log -n 20 --oneline`
   - `git checkout <sha_anterior>`
2. Executar novamente o padrão de build limpo:
   - `npm run build`
   - `rm -rf frontend/.next && npm --prefix frontend run build`
   - `rm -rf admin/.next && npm --prefix admin run build`
3. Restart:
   - `pm2 restart nexora-api --update-env`
   - `pm2 restart nexora-app --update-env`
   - `pm2 restart nexora-admin --update-env`
4. Validar com checklist pós-deploy.

## 7. Alertas conhecidos (o que observar nos logs)

- `Failed to find Server Action`:
  - Causa histórica: service worker cacheando bundles antigos.
  - Correção adotada: `frontend/public/sw.js` NÃO cacheia `/_next/static/` e só cacheia `offline.html`, `manifest.json`, `icon-192.png`, `icon-512.png`.
- `TRIAL_EXPIRED` (admin):
  - Se voltar em rotas GET de leitura mínima, revisar se os handlers GET necessários mantêm `@SkipTrialCheck()` (mudança já aplicada nesta linha do tempo).

Onde olhar logs:
- `pm2 logs nexora-app --lines 80 --nostream`
- `pm2 logs nexora-admin --lines 80 --nostream`
- `pm2 logs nexora-api --lines 80 --nostream`

## 8. Handoff final (continuidade)

- Este documento descreve o procedimento operacional compatível com o ambiente atual: Nginx roteando app/admin/api para `3021/3022/3023`, e SW com política anti-mismatch.
- Próxima mudança segura: sempre repita “Build limpo (com rm -rf .next) → Restart PM2 --update-env → Checklist pós-deploy”.

## 9. Nota curta: modo híbrido (SaaS / OnPrem)

- Variável de backend: `DEPLOYMENT_MODE=saas|onprem` (arquivo `.env` da API).
- `saas` (padrão): comportamento atual de trial/billing com checkout externo quando configurado.
- `onprem`:
  - checkout externo de assinatura não é obrigatório (endpoint retorna `checkoutUrl: null`);
  - `TrialGuard` passa a respeitar licença local (`ONPREM_LICENSE_VALID=true|false`);
  - onboarding público pode ser bloqueado por segurança (`ONPREM_ALLOW_PUBLIC_ONBOARDING=false` por padrão em onprem).

