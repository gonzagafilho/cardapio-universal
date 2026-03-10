# Auditoria completa — Cardápio Nexora (estado atual)

Checklist técnico e funcional para validar o que está pronto e o que falta antes de novas implementações.  
**Modo produção segura:** apenas comandos de leitura/coleta abaixo; nenhuma alteração será sugerida antes de você enviar as saídas reais.

---

## ETAPA 1 — Comandos de coleta

Execute os comandos abaixo **no servidor de produção** (ou no ambiente que quiser auditar). Não altere nada; apenas copie e cole a saída completa em um documento para enviar.

### 1. Infraestrutura

```bash
# SO e recursos
uname -a
cat /etc/os-release 2>/dev/null | head -5
free -h
df -h /
```

### 2. PM2 / processos

```bash
# Listar aplicações PM2 (se usar PM2)
pm2 list 2>/dev/null || echo "PM2 não encontrado ou não em uso"

# Se usar PM2: detalhes dos processos do Cardápio (ajuste o nome se for diferente)
pm2 show cardapio-api 2>/dev/null || true
pm2 show cardapio-admin 2>/dev/null || true
pm2 show cardapio-app 2>/dev/null || true

# Processos Node em execução (portas em uso)
ps aux | grep -E "node|nest|next" | grep -v grep
```

### 3. Portas

```bash
# Portas em escuta (TCP)
ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null

# Onde está o projeto Cardápio (ajuste o caminho se necessário)
ls -la /home/servidor-dcnet/cardapio-universal 2>/dev/null | head -20
```

### 4. Nginx

```bash
# Configuração ativa do Nginx (sites habilitados)
ls -la /etc/nginx/sites-enabled/ 2>/dev/null
ls -la /etc/nginx/conf.d/ 2>/dev/null

# Conteúdo dos vhosts que mencionam cardapio/nexora (ajuste o nome dos arquivos conforme o ls acima)
# Exemplo — substitua pelos nomes reais dos arquivos:
cat /etc/nginx/sites-enabled/*cardapio* 2>/dev/null
cat /etc/nginx/sites-enabled/*nexora* 2>/dev/null
# Se não houver arquivos com esse nome, envie a lista de sites-enabled e o conteúdo dos que parecem ser da API/Admin/App
```

### 5. SSL

```bash
# Certificados (Let's Encrypt, se usar)
ls -la /etc/letsencrypt/live/ 2>/dev/null
# Teste de expiração (somente leitura)
openssl s_client -connect api.cardapio.nexoracloud.com.br:443 -servername api.cardapio.nexoracloud.com.br </dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Ajuste o domínio ou execute manualmente"
# Ajuste os domínios para: admin, app, etc., conforme seus subdomínios
```

### 6. API (NestJS)

```bash
cd /home/servidor-dcnet/cardapio-universal

# Health ou raiz da API (ajuste a URL se o prefixo ou porta forem diferentes)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api 2>/dev/null || echo "Falha"
curl -s http://127.0.0.1:3000/api 2>/dev/null | head -5

# Rota pública (cardápio) — slug de exemplo
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/public/store/restaurante-demo 2>/dev/null || echo "Falha"
curl -s http://127.0.0.1:3000/api/public/store/restaurante-demo 2>/dev/null | head -20
```

### 7. Banco de dados

```bash
cd /home/servidor-dcnet/cardapio-universal

# Apenas verificar se o Prisma conecta (não altera dados)
npx prisma db execute --stdin <<< "SELECT 1" 2>&2 || echo "Falha na conexão"
```

### 8. Prisma / migrations

```bash
cd /home/servidor-dcnet/cardapio-universal

# Status das migrations
npx prisma migrate status 2>&1

# Listar migrations existentes
ls -la prisma/migrations 2>/dev/null
```

### 9. Autenticação (sem expor senha)

```bash
# Apenas testar se o endpoint de login existe e responde (401 sem credenciais é esperado)
curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:3000/api/auth/login -H "Content-Type: application/json" -d '{}' 2>/dev/null || echo "Falha"
```

### 10. Variáveis de ambiente (sem valores sensíveis)

```bash
cd /home/servidor-dcnet/cardapio-universal

# Apenas os NOMES das variáveis definidas (não os valores)
grep -E "^[A-Z]" .env 2>/dev/null | sed 's/=.*/=***/' || echo "Arquivo .env não encontrado ou sem permissão"
```

### 11. Frontend (Admin e App) — build e portas

```bash
cd /home/servidor-dcnet/cardapio-universal

# Estrutura dos projetos
ls -la admin/ 2>/dev/null | head -15
ls -la frontend/ 2>/dev/null | head -15

# Se estiverem rodando em portas locais (ajuste 3001/3002 se for diferente)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001 2>/dev/null || echo "Admin não em 3001"
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002 2>/dev/null || echo "App não em 3002"
```

### 12. Erros de console / rede (manual)

- Abra o **Admin** no navegador (HTTPS).
- Abra o **App público** (cardápio) no navegador (HTTPS).
- Abra DevTools (F12) → aba **Console** e aba **Rede (Network)**.
- Anote: erros em vermelho no Console; requisições falhadas (4xx/5xx) na Rede; mensagens de CORS, se houver.
- Envie a lista (pode ser texto: “Console: …; Rede: requisição X retornou 404”, etc.).

### 13. Rotas protegidas (manual)

- No Admin: faça login e anote quais menus/páginas carregam e quais quebram ou redirecionam.
- Sem login: tente acessar uma URL protegida do Admin (ex.: /dashboard) e anote se redireciona para login.
- Envie um resumo: “Login OK; páginas X,Y,Z carregam; página W dá 404/500”.

### 14. Swagger / documentação da API

```bash
# Se a API estiver no localhost:3000
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/docs 2>/dev/null || echo "Falha"
```

---

## ETAPA 2 — Arquivos / saídas que preciso que você envie

Envie o seguinte (pode colar em um único documento ou anexar arquivos, **sem incluir valores reais de senhas, JWT ou DATABASE_URL**):

| # | O que enviar | Observação |
|---|----------------|------------|
| 1 | Saída completa de **todos os comandos** da ETAPA 1 | Um bloco por comando; se algum comando falhar, envie a mensagem de erro |
| 2 | Conteúdo dos arquivos Nginx que servem **API**, **Admin** e **App** do Cardápio | Caminho típico: `/etc/nginx/sites-enabled/`. Pode mascarar nomes de servidor interno se preferir |
| 3 | Lista de **variáveis de ambiente** que a API usa | Pode ser a saída do `sed 's/=.*/=***/'` do comando 10, ou só os nomes (PORT, API_PREFIX, DATABASE_URL, JWT_*, CORS_ORIGINS, etc.) |
| 4 | Se usar **PM2**: conteúdo do arquivo de configuração (ecosystem.config.js ou equivalente) | Apenas estrutura e nomes dos apps/scripts; não é necessário enviar caminhos absolutos sensíveis se não quiser |
| 5 | Resumo **manual** dos itens 12 e 13 | Erros de console/rede; comportamento de login e rotas protegidas |
| 6 | Domínios reais em uso | Ex.: api.cardapio.nexoracloud.com.br, admin.xxx, app.xxx (só os nomes, sem credenciais) |

**Não envie:** conteúdo real de `.env` (senhas, secrets, DATABASE_URL completa). Só nomes de variáveis ou versão mascarada.

---

## ETAPA 3 — Diagnóstico do que já está pronto

*(Será preenchido após receber as saídas da ETAPA 1 e os itens da ETAPA 2.)*

- [ ] Infraestrutura
- [ ] PM2/processos
- [ ] Portas
- [ ] Nginx
- [ ] SSL
- [ ] API
- [ ] Banco de dados
- [ ] Prisma/migrations
- [ ] Autenticação
- [ ] Painel admin
- [ ] App público
- [ ] Console/rede
- [ ] Rotas protegidas
- [ ] Variáveis de ambiente
- [ ] Riscos atuais

---

## ETAPA 4 — Problemas ou lacunas

*(Será preenchido após o diagnóstico.)*

- Lista objetiva do que está quebrado, incompleto ou inconsistente.

---

## ETAPA 5 — O que falta para ficar vendável

*(Será preenchido após a ETAPA 4.)*

- Itens que precisam ser corrigidos ou implementados para considerar o produto pronto para venda.

---

## ETAPA 6 — Plano de ação em ordem de prioridade

*(Será preenchido após a ETAPA 5.)*

Para cada item:

1. **Identificar** (o que está errado ou faltando)
2. **Confirmar estado real** (comando ou passo para reproduzir)
3. **Backup** (comando de backup antes de mexer)
4. **Alteração mínima** (o que fazer)
5. **Validação** (comando de teste)
6. **Rollback** (comando para desfazer, se aplicável)

---

## Riscos ao executar os comandos

- **Comandos listados:** são de **leitura** (listar, curl, status, cat, ls). Não alteram configuração nem dados.
- **`npx prisma db execute --stdin <<< "SELECT 1"`:** apenas executa `SELECT 1`; não altera o banco.
- **Nenhum comando** reinicia serviços, altera Nginx ou modifica `.env`.  
Se você usar algum comando adicional por conta própria (por exemplo, `systemctl restart`), faça-o por sua conta e risco.

Assim que você enviar as saídas da ETAPA 1 e os itens da ETAPA 2, as etapas 3 a 6 serão preenchidas com o diagnóstico real e o plano de ação.
