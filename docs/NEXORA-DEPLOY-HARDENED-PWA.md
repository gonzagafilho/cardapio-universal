# NEXORA Deploy (PWA Hardened) - Procedimento Seguro

Este procedimento é para deploy/restart do Cardápio Nexora (frontend + admin + api) com foco em:
- evitar mismatch de `Server Actions` após deploy
- manter o cache do PWA em um modo menos frágil

## 0. Nota PWA (cache hardened)
- O `frontend/public/sw.js` foi endurecido para NÃO cachear `/_next/static/`.
- O SW só cacheia `offline.html`, `manifest.json`, `icon-192.png` e `icon-512.png`.
- Portanto, não é necessário bump manual de cache para evitar mismatch de `Server Actions` após deploy.

## 1. Preparação
No diretório do projeto:
`cd /home/servidor-dcnet/cardapio-universal`

## 2. Build (limpo)
1. Frontend (Next - App público)
   - `rm -rf frontend/.next`
   - `npm --prefix frontend run build`
2. Admin (Next - painel)
   - `rm -rf admin/.next`
   - `npm --prefix admin run build`
3. Backend (NestJS API)
   - `npm run build`

## 3. Restart (PM2)
1. API
   - `pm2 restart nexora-api --update-env`
2. Frontend
   - `pm2 restart nexora-app --update-env`
3. Admin
   - `pm2 restart nexora-admin --update-env`

## 4. Validação pós-deploy (curl)
1. Backend health:
   - `curl -sS http://127.0.0.1:3023/api/health`
2. App:
   - `curl -sS -I https://app.cardapio.nexoracloud.com.br/ -k`
3. App + checkout (com query exemplo):
   - `curl -sS -I "https://app.cardapio.nexoracloud.com.br/pizzaria-bella-massa/checkout?table=6wW5k5XoNa8G1iTz" -k`
4. Confirmar `sw.js` atual (cache PWA):
   - `curl -sS https://app.cardapio.nexoracloud.com.br/sw.js -k | sed -n '1,120p'`

## 5. Logs (opcional, para auditoria)
- `pm2 logs nexora-app --lines 80 --nostream`
- `pm2 logs nexora-admin --lines 80 --nostream`
- `pm2 logs nexora-api --lines 80 --nostream`

