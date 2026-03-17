# Piloto restaurante real — guia executável

Guia objetivo para rodar **1 restaurante piloto** do zero ao primeiro pedido e conferência em admin/cozinha e teste de assinatura.

---

## Pré-requisitos

- **Backend** rodando e acessível na URL configurada em `NEXT_PUBLIC_API_URL`.
- **Frontend (app)** rodando na URL configurada em `NEXT_PUBLIC_APP_URL` (ex.: `https://app.cardapio.nexoracloud.com.br`).
- **Admin** rodando na URL configurada em `NEXT_PUBLIC_ADMIN_URL` (ex.: `https://admin.cardapio.nexoracloud.com.br`).
- **Variáveis de ambiente** (ver seção [URLs e env](#urls-e-env)) preenchidas no backend, frontend e admin.
- Navegador com JavaScript ativo e sem bloqueio de cookies/localStorage para os domínios do app e do admin.

---

## URLs e env

| Onde   | Variável                | Uso |
|--------|-------------------------|-----|
| Backend | `APP_PUBLIC_URL`       | URL do app público; usada no onboarding para retornar `publicCardUrl` (ex.: `https://app.cardapio.nexoracloud.com.br`). |
| Backend | `CORS_ORIGINS`        | Origens permitidas (frontend + admin). Ex.: `https://admin....,https://app....` |
| Frontend | `NEXT_PUBLIC_APP_URL`  | Base do app (landing + cardápio). |
| Frontend | `NEXT_PUBLIC_API_URL`  | API (ex.: `https://api..../api`). |
| Frontend | `NEXT_PUBLIC_ADMIN_URL`| Base do admin (links "Começar configuração", "Assinar plano"). |
| Admin   | `NEXT_PUBLIC_API_URL`  | API. |
| Admin   | `NEXT_PUBLIC_APP_URL`  | Link "Abrir cardápio" no setup e em outros pontos. |

---

## Ordem dos passos

1. Criar conta em **/comecar** (frontend).
2. Escolher plano (Basic / Pro / Enterprise).
3. Concluir cadastro (empresa, loja, slug, acesso).
4. Cair na **tela de sucesso** (frontend).
5. Ir para **/setup** (admin).
6. Preencher **setup completo** (informações, logo/capa, categorias, produtos, pedidos, publicar).
7. **Publicar cardápio** (último passo do setup).
8. Fazer **pedido real** no cardápio público.
9. Conferir pedido no **admin** (Pedidos).
10. Conferir pedido na **cozinha** (tempo real).
11. Testar **assinatura** em **/billing** (admin).

---

## O que conferir em cada etapa

### 1. Criar conta em /comecar

- **URL:** `{NEXT_PUBLIC_APP_URL}/comecar`
- **Ação:** Preencher empresa, loja, slug da loja, nome, e-mail, senha; escolher plano.
- **Resultado esperado:** Request `POST .../auth/onboarding` retorna 200 com `accessToken`, `tokens`, `publicCardUrl` (ou path do cardápio).
- **Se falhar:** Mensagem de erro na tela (ex.: slug já em uso, slug inválido). Verificar backend (logs, CORS, `APP_PUBLIC_URL` opcional) e slugs únicos.

### 2. Escolher plano

- Feito na mesma tela de /comecar (Basic, Pro, Enterprise).
- **Resultado esperado:** Plano enviado no payload e persistido no tenant; trial de 7 dias.

### 3. Concluir cadastro

- Clicar em enviar após preencher todos os passos (Empresa, Loja, Acesso, Confirmar).
- **Resultado esperado:** Redirecionamento para a tela de sucesso na mesma aba (frontend).

### 4. Tela de sucesso

- **Onde:** Continua no frontend (/comecar com estado de sucesso).
- **Conferir:** Mensagem "Sua conta foi criada com sucesso"; link do cardápio; botão **"Começar configuração"** apontando para o admin com token no hash.
- **Resultado esperado:** Link do tipo `{ADMIN_URL}/setup#accessToken=...&refreshToken=...` (e opcionalmente `&businessType=...`).
- **Se falhar:** Se "Começar configuração" não aparecer, o backend pode não ter retornado `accessToken`/`tokens`. Verificar resposta do `POST /auth/onboarding`.

### 5. Ir para /setup

- **Ação:** Clicar em "Começar configuração" (abre admin em nova navegação).
- **URL esperada:** `{ADMIN_URL}/setup#accessToken=...&refreshToken=...`
- **Resultado esperado:** Admin carrega, lê o hash, grava token/refresh em localStorage, faz `replaceState` para `/setup` e recarrega. Após reload, usuário está logado e a página /setup mostra o wizard.
- **Se falhar:** 404 em /setup → rota do admin; CORS ou rede → verificar `NEXT_PUBLIC_API_URL` e CORS no backend. Se cair em /login → token não foi guardado ou expirou (improvável logo após cadastro).

### 6. Preencher setup completo

- **Passos no wizard:** (1) Informações do restaurante, (2) Logo e capa, (3) Categorias, (4) Produtos, (5) Configuração de pedidos, (6) Publicar restaurante.
- **Conferir:** `establishmentId` do usuário existe (onboarding já vinculou); chamadas à API usam `establishmentId` (categorias, produtos, settings).
- **Resultado esperado:** Conseguir salvar dados em cada passo; ao final, ver o passo "Publicar" com o link do cardápio.
- **Se falhar:** "Carregando..." infinito → verificar se `user.establishmentId` está preenchido (GET /auth/me). Se não tiver, usuário é redirecionado para /dashboard (caso raro após onboarding novo).

### 7. Publicar cardápio

- **Onde:** Último passo do Setup (Publicar restaurante).
- **Conferir:** Link do cardápio no formato `{NEXT_PUBLIC_APP_URL}/{slug}` (admin usa `APP_PUBLIC_URL`/`NEXT_PUBLIC_APP_URL`).
- **Ação:** "Abrir cardápio" ou copiar link e abrir em outra aba.
- **Resultado esperado:** Página pública do cardápio (frontend) carrega com categorias e produtos cadastrados.

### 8. Fazer pedido real

- **URL:** `{APP_URL}/{storeSlug}` (ex.: `.../pizzaria-joao`).
- **Ação:** Adicionar itens ao carrinho, ir ao checkout, preencher dados (nome, telefone, endereço se entrega), enviar pedido.
- **Resultado esperado:** Pedido criado; redirecionamento para `/{storeSlug}/success?orderId=...&code=...&total=...`.
- **Se falhar:** Erro "carrinho já convertido" → voltar ao cardápio e montar novo pedido. Erro de rede/CORS → verificar API e frontend.

### 9. Conferir pedido no admin

- **URL:** `{ADMIN_URL}` → menu **Pedidos** (ou `/orders`).
- **Conferir:** Lista filtrada por `establishmentId` do usuário; novo pedido aparece com status (ex.: Pendente).
- **Resultado esperado:** Pedido listado; possível abrir detalhe e alterar status.

### 10. Conferir pedido na cozinha

- **URL:** `{ADMIN_URL}` → menu **Cozinha** (ou `/cozinha`).
- **Conferir:** WebSocket conectado ao establishment; novo pedido aparece em tempo real (ou após refresh).
- **Resultado esperado:** Mesmo pedido visível; alteração de status no admin reflete na cozinha.

### 11. Testar assinatura em /billing

- **URL:** `{ADMIN_URL}/billing`
- **Conferir:** Página carrega; exibe estado da assinatura (trial, ativo, etc.); se configurado Mercado Pago, fluxo de checkout/assinatura disponível.
- **Resultado esperado:** Sem erro de permissão; botão/link para assinar ou trocar plano conforme permissões do usuário.

---

## O que fazer se falhar

| Sintoma | O que checar |
|--------|----------------|
| Cadastro em /comecar retorna erro genérico | Backend: logs, validação do DTO (slug, e-mail, plano). CORS. |
| Sucesso mas sem botão "Começar configuração" | Resposta do `POST /auth/onboarding`: deve ter `accessToken` e `tokens` no root. |
| Admin /setup redireciona para /login | Token não salvo (hash não lido) ou domínio diferente (cookies/localStorage). Abrir admin no mesmo domínio do link. |
| Setup não carrega (loading infinito) | GET /auth/me retorna `establishmentId`? Se não, usuário antigo ou bug no onboarding. |
| Cardápio público 404 ou "Loja não encontrada" | Slug correto? API store-public por slug respondendo? Cache. |
| Pedido não aparece no admin | Filtro por `establishmentId`; pedido realmente criado para esse establishment. |
| Cozinha não atualiza em tempo real | WebSocket (origem, path); backend Socket.IO; `establishmentId` na subscription. |
| Billing não carrega ou 403 | Permissão do usuário (`canAccessBilling`); API de billing e env do Mercado Pago (se usado). |

---

## Checklist final do piloto

- [ ] Conta criada em /comecar com plano escolhido.
- [ ] Tela de sucesso exibida com link do cardápio e botão "Começar configuração".
- [ ] Acesso ao admin /setup com token no hash; wizard carrega.
- [ ] Setup completo: informações, categorias, produtos, configuração de pedidos.
- [ ] Passo "Publicar" exibido; link do cardápio abre e mostra itens.
- [ ] Pedido real feito no cardápio; redirecionamento para success com orderId/code.
- [ ] Pedido visível em Admin → Pedidos.
- [ ] Pedido visível em Admin → Cozinha (e atualização de status reflete).
- [ ] Página /billing acessível e sem erro de permissão.

---

## Gargalos de operação (sem alterar código)

- **Backend `APP_PUBLIC_URL` vazio:** O onboarding ainda funciona; `publicCardUrl` vem como path (`/slug`). O frontend monta a URL final com `NEXT_PUBLIC_APP_URL`. Para consistência (e futuros e-mails), defina `APP_PUBLIC_URL` em produção.
- **CORS:** Backend deve listar em `CORS_ORIGINS` as origens do frontend e do admin. Senão, cadastro e login podem falhar no browser.
- **Admin `NEXT_PUBLIC_APP_URL`:** Usado no passo "Publicar" do setup (link "Abrir cardápio"). Se errado, o dono do restaurante abre um link que não bate com o app real.
- **Frontend `NEXT_PUBLIC_ADMIN_URL`:** Usado no link "Começar configuração" após o sucesso. Se errado, o usuário cai em outro lugar ou 404.

Nenhum patch de código foi aplicado; o fluxo atual suporta o piloto desde que env e CORS estejam corretos.

---

## Referências rápidas

- **Landing / começar:** frontend `src/app/comecar/page.tsx`, `src/services/auth.service.ts`.
- **Onboarding backend:** `src/modules/auth/onboarding.service.ts`, `auth.service.ts`.
- **Setup admin:** `admin/src/app/setup/page.tsx`, `admin/src/components/setup/SetupWizard.tsx`.
- **Cardápio público:** frontend `src/app/(public)/[storeSlug]/page.tsx`, `src/hooks/useStoreData.ts`.
- **Checkout / pedido:** frontend `src/app/(public)/[storeSlug]/checkout/page.tsx`, `createPublicOrder` (store.service).
- **Admin pedidos/cozinha:** `admin/src/app/(dashboard)/orders/page.tsx`, `admin/src/app/(dashboard)/cozinha/page.tsx`.
- **Billing:** `admin/src/app/(dashboard)/billing/page.tsx`.
- **Env backend:** `.env.example` (APP_PUBLIC_URL, CORS_ORIGINS). Frontend/Admin: `NEXT_PUBLIC_*` em cada app.
