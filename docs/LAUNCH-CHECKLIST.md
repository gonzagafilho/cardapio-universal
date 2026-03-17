# Checklist final de lançamento — NEXORA

Checklist objetiva para validação antes do lançamento comercial.

- [ ] **1. Loja por slug** — Acessar `https://app.../minha-loja` (ou slug configurado); cardápio carrega.
- [ ] **2. Loja por domínio custom** — Se houver domínio custom configurado; resolver pelo host e exibir mesma loja.
- [ ] **3. Carrinho** — Adicionar itens; carrinho persiste; alterar quantidades e remover itens.
- [ ] **4. Checkout** — Preencher dados; botão "Enviar pedido" desabilita durante envio; não duplo clique.
- [ ] **5. Pedido criado** — Após finalizar, pedido é criado no backend e retorna orderId/code.
- [ ] **6. Success** — Redirecionamento para página de sucesso com orderId/code/total; link "Acompanhar pedido" quando houver orderId; mensagem de fallback quando não houver orderId.
- [ ] **7. Admin recebe pedido** — No painel admin, pedido aparece na lista e pode ser visualizado.
- [ ] **8. Cozinha recebe pedido** — Tela de cozinha (websocket) recebe o novo pedido em tempo real.
- [ ] **9. Mudança de status** — Alterar status no admin; cozinha/estabelecimento refletem a mudança.
- [ ] **10. Rate limit** — Exceder limite (ex.: muitas requisições em sequência); resposta 429 com mensagem amigável.
- [ ] **11. Isolamento entre establishments** — Pedidos/lojas de um estabelecimento não aparecem em outro.
- [ ] **12. Onboarding** — Novo cadastro (tenant + estabelecimento + usuário); login e acesso ao admin.
- [ ] **13. Cache refletindo mudanças** — Alterar produto/categoria/settings; loja pública mostra dados atualizados (sem cache antigo por tempo excessivo).
- [ ] **14. WebSocket funcionando** — Cozinha conectada; ao criar/alterar pedido, evento chega sem precisar recarregar.
- [ ] **15. Rollback básico** — Ter build/commit anterior conhecido; processo documentado para voltar (ex.: git checkout + build + pm2 restart).
