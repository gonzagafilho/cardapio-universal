# Primeiro cliente piloto — ativação e entrega

Guia objetivo para colocar o **1º restaurante piloto** no ar e entregar ao cliente.

## O que já existe no sistema

- Onboarding (cadastro tenant + establishment + dono) em `/comecar`.
- Admin: dashboard, pedidos, cozinha (tempo real), configurações, categorias, produtos, estabelecimentos.
- Loja pública por slug: `https://app.../SLUG`.
- Checkout com proteção a duplo envio; success com fallback.
- Rate limit, isolamento por establishment, cache com invalidação.

## Passo a passo de ativação

1. **Cadastro**  
   - Cliente acessa o link “Começar” / “Criar conta” na landing.  
   - Preenche empresa, loja, slug da loja, nome, e-mail e senha.  
   - Sistema cria conta e redireciona para login (ou já deixa logado).

2. **Primeiro login**  
   - Cliente entra no admin com e-mail e senha.  
   - Se aparecer onboarding interno do admin (escolher estabelecimento etc.), seguir até o dashboard.

3. **Configuração mínima (operador ou cliente)**  
   - **Estabelecimento:** nome, descrição, telefone/WhatsApp, logo e capa se houver campos.  
   - **Configurações:** horário de funcionamento, pedido mínimo, entrega/retirada, formas de pagamento.  
   - **Categorias:** criar ao menos 2–3 (ex.: Principais, Bebidas, Sobremesas).  
   - **Produtos:** cadastrar itens por categoria com preço.

4. **Validação**  
   - Abrir em aba anônima: `https://app.cardapio.nexoracloud.com.br/SLUG-DA-LOJA`.  
   - Executar itens 3–9 da `docs/LAUNCH-CHECKLIST.md` (carrinho, checkout, pedido, success, admin, cozinha, mudança de status).

5. **Entrega ao cliente**  
   - **Link do cardápio:** `https://app.cardapio.nexoracloud.com.br/SLUG-DA-LOJA`  
   - **Painel:** `https://admin.cardapio.nexoracloud.com.br`  
   - **Credenciais:** e-mail e senha definidos no cadastro.  
   - Informar: “Pedidos aparecem em **Pedidos** e em **Cozinha** (tempo real). Altere status em Pedidos ou na Cozinha.”

## O que pode estar confuso

- **Slug:** é o identificador da loja na URL. Deve ser único no sistema (ex.: `pizzaria-joao`).  
- **Domínio custom:** se o cliente quiser `cardapio.seudominio.com.br`, é preciso configurar nginx (server block + SSL) apontando esse host para o app; hoje isso não está automático.  
- **Cozinha:** só mostra pedidos se o usuário estiver vinculado a um estabelecimento (no cadastro já fica vinculado).

## Validações pós-ativação

- [ ] Cliente consegue logar no admin.  
- [ ] Link do cardápio abre e mostra categorias/produtos.  
- [ ] Pedido de teste é criado e aparece em Pedidos e Cozinha.  
- [ ] Mudança de status reflete na Cozinha sem recarregar.  
- [ ] Cliente sabe onde ver pedidos e onde alterar cardápio/configurações.

## Cobrança e comercial

- Cobrança inicial manual: combinar valor e forma (PIX, transferência etc.) fora do sistema.  
- Billing/assinatura (Mercado Pago) existe no código; ativação é opcional para o piloto.
