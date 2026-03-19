# NEXORA Higiene de Segredos (Operacional)

Este checklist reduz risco de vazamento acidental sem rotacionar segredos automaticamente.

## 1) Arquivos que nao devem entrar no Git

- `.env`
- `*/.env.production`
- `.env.local`
- `.env.*.local`
- `*.pem`, `*.key`, `*.crt`, `*.p12`, `*.pfx`
- `*.bak-*` com conteudo operacional/sensivel

## 2) Segredos criticos esperados

Nao registrar valores reais em documentos, tickets ou commits:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- credenciais operacionais fora do repo (chaves TLS, arquivos privados)

## 3) Politica minima antes de commit/push

1. `git status --short` (revisar se entrou algo sensivel)
2. `git diff --stat` (confirmar somente arquivos esperados)
3. Validar que somente `*.example` contem variaveis de ambiente versionadas

## 4) Acao futura recomendada

- Adotar rotacao planejada de `JWT_SECRET` e `JWT_REFRESH_SECRET` em janela controlada.
- Centralizar segredos em gerenciador dedicado (Vault/Secrets Manager) quando a esteira permitir.
