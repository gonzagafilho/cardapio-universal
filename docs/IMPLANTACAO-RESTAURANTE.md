# Implantação de restaurante — passo a passo real

Fluxo para ativar um novo restaurante no NEXORA (1º ou subsequente).

## Pré-requisitos

- Backend, app e admin em produção (ver `docs/OPERACAO-PRODUCAO.md`).
- Acesso ao app público e ao admin.

---

## Opção A — Primeiro restaurante (novo cadastro)

1. **Cadastro (onboarding)**  
   Acesse no app: **Começar** / **Criar conta** (link para `/comecar`). Preencha: nome da empresa, slug da empresa, nome da loja, slug da loja, nome do responsável, e-mail, senha. Sistema cria: 1 tenant, 1 establishment, 1 usuário (dono). Slug da loja é **global** (único no sistema).

2. **Login no admin**  
   Após cadastro, faça login no admin com o e-mail e senha criados.

3. **Configurar loja**  
   - **Estabelecimento:** nome, descrição, telefone, WhatsApp, logo, capa.  
   - **Configurações (Settings):** cores, horários, pedido mínimo, entrega/retirada, pagamento.  
   - **Categorias:** criar categorias.  
   - **Produtos:** cadastrar produtos por categoria.

4. **Publicar**  
   Establishment já nasce `isActive: true`. Loja acessível por: **Por slug:** `https://app.../SEU-SLUG`. **Por domínio custom:** requer server block no nginx.

5. **Validar**  
   Abra `https://app.../SEU-SLUG`. Confira cardápio, carrinho, checkout e pedido de teste (`docs/LAUNCH-CHECKLIST.md`).

6. **Entregar ao cliente**  
   Link: `https://app.cardapio.nexoracloud.com.br/SEU-SLUG`. Credenciais do admin (e-mail + senha).

---

## Opção B — Novo estabelecimento (mesmo tenant)

Login no admin → **Estabelecimentos** → **Novo estabelecimento**. Preencher nome e slug (global único). Depois: configurações, categorias, produtos, validar, entregar link.

---

## Comandos

- Health API: `curl -s -o /dev/null -w "%{http_code}" https://api..../api/health`
- Migrations: `npx prisma migrate deploy` (raiz).

## Checklist por restaurante

- [ ] Tenant/establishment criado.  
- [ ] Slug definido e único.  
- [ ] Logo/capa/dados configurados.  
- [ ] Categorias e produtos cadastrados.  
- [ ] Configurações (horários, entrega, pagamento) ajustadas.  
- [ ] Loja acessível por `https://app.../SLUG`.  
- [ ] Pedido de teste realizado.  
- [ ] Link e credenciais entregues ao cliente.
