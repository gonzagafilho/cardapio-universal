# Validação de fluxos — Nexora Admin (produção)

**Objetivo:** Validar fluxos reais no navegador sem alterar código.  
**Se algo falhar:** não aplicar patch; anotar rota, ação, mensagem e log; só então propor correção mínima.

---

## Pré-requisito

- Acesso ao admin em produção (ex.: https://admin.cardapio.nexoracloud.com.br ou http://127.0.0.1:3022).
- Conta de teste com login/senha válidos.

---

## 1. Fluxo: Login

| Passo | Ação | Esperado |
|-------|------|----------|
| 1.1 | Abrir `/login` (ou `/` que redireciona) | Página "Entrar no painel" com campos E-mail e Senha |
| 1.2 | Preencher e-mail e senha | Campos aceitam texto |
| 1.3 | Clicar em **"Entrar no painel"** | Redirecionamento para `/dashboard` (ou onboarding/setup se aplicável) |
| 1.4 | Senha errada | Mensagem de erro em vermelho (ex.: "Falha no login" ou mensagem da API) |

**Se falhar anotar:**
- Rota: `/login`
- Botão/ação: "Entrar no painel" (submit do form)
- Mensagem visual: ___
- Depois rodar: `pm2 logs nexora-admin --lines 120 --nostream`

---

## 2. Fluxo: Billing / Assinatura

| Passo | Ação | Esperado |
|-------|------|----------|
| 2.1 | Estar logado; acessar `/billing` (menu ou URL direta) | Página de assinatura/planos com informações de uso e opções |
| 2.2 | Clicar em qualquer botão de ação (ex. "Alterar plano", "Ver faturas") | Ação executa ou abre o esperado, sem tela de erro de Server Action |

**Se falhar anotar:**
- Rota: `/billing`
- Botão/ação: ___
- Mensagem visual: ___
- Depois rodar: `pm2 logs nexora-admin --lines 120 --nostream`

---

## 3. Fluxo: Novo restaurante

| Passo | Ação | Esperado |
|-------|------|----------|
| 3.1 | Estar logado; ir em Restaurantes → Novo ou acessar `/establishments/new` | Formulário de novo estabelecimento |
| 3.2 | Preencher campos obrigatórios e clicar em **Salvar/Criar** (botão principal do form) | Restaurante criado (redirect ou mensagem de sucesso) ou mensagem de limite/erro clara |
| 3.3 | Se aparecer bloqueio por limite | Mensagem com link "Ir para Assinatura" ou similar |

**Se falhar anotar:**
- Rota: `/establishments/new`
- Botão/ação: ___
- Mensagem visual: ___
- Depois rodar: `pm2 logs nexora-admin --lines 120 --nostream`

---

## Comando em caso de falha

```bash
pm2 logs nexora-admin --lines 120 --nostream
```

Guardar a saída (erro + out) e informar:
1. Rota exata
2. Botão/ação exata
3. Mensagem visual para o usuário
4. Trecho relevante do log (ex.: `Failed to find Server Action "..."` ou stack trace).

---

## Resultado da validação automática (rotas HTTP)

- `GET /` → 307 (redirect)
- `GET /login` → 200
- `GET /billing` → 200
- `GET /establishments/new` → 200

As páginas são servidas. A validação de **formulários, login real e Server Actions** deve ser feita no navegador conforme os fluxos acima.
