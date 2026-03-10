# Implementação — QR Code automático do cardápio

**Objetivo:** Exibir no Admin o link público do cardápio e um QR Code por estabelecimento, sem novo endpoint e sem alterar App/API.

---

## 1. Diagnóstico — Arquivos reais a alterar

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `/home/servidor-dcnet/cardapio-universal/admin/package.json` | Adicionar dependência `qrcode` (geração da imagem em base64 no cliente). |
| 2 | `/home/servidor-dcnet/cardapio-universal/admin/src/lib/constants.ts` | Adicionar constante `APP_PUBLIC_URL` (URL base do app público; ex.: `https://app.cardapio.nexoracloud.com.br`). |
| 3 | `/home/servidor-dcnet/cardapio-universal/admin/src/components/establishment/CardapioQRSection.tsx` | **Novo** — Componente que recebe `slug`, monta o link, exibe URL, botão copiar, QR (via `qrcode.toDataURL`) e botão baixar imagem. |
| 4 | `/home/servidor-dcnet/cardapio-universal/admin/src/app/(dashboard)/establishments/[id]/page.tsx` | Inserir `<CardapioQRSection slug={establishment.slug} />` acima do formulário (após o título, antes do `EstablishmentForm`). |

**Não alterar:** Prisma, API, rotas do App, Nginx, PM2, auth. Nenhum endpoint novo.

**Confirmado no repositório:**
- Model `Establishment` com campo `slug` em `prisma/schema.prisma` (linha 152, `slug String`).
- App público usa rota `/[storeSlug]` em `frontend/src/app/(public)/[storeSlug]/page.tsx`.
- Admin: listagem em `admin/src/app/(dashboard)/establishments/page.tsx`; edição em `admin/src/app/(dashboard)/establishments/[id]/page.tsx`; tipo `Establishment` com `slug` em `admin/src/types/establishment.ts`.
- Nenhuma biblioteca de QR no `admin/package.json` atual.

---

## 2. Plano de implementação

1. **Constante da URL do app** — Em `admin/src/lib/constants.ts`, definir `APP_PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'`. Em produção configurar `NEXT_PUBLIC_APP_URL=https://app.cardapio.nexoracloud.com.br`.
2. **Dependência** — Em `admin/package.json`, adicionar `"qrcode": "^1.5.3"` em `dependencies`. O pacote expõe `toDataURL()` para uso no browser.
3. **Componente CardapioQRSection** — Novo arquivo em `admin/src/components/establishment/CardapioQRSection.tsx`: `'use client'`; props `{ slug: string }`; URL = `APP_PUBLIC_URL + '/' + slug`; `useEffect` chamando `QRCode.toDataURL(menuUrl, { width: 256 })` e guardando em state; exibir link, botão copiar (navigator.clipboard), `<img src={qrDataUrl} />`, botão baixar (anchor com `download`, `href=qrDataUrl`).
4. **Página do estabelecimento** — Em `establishments/[id]/page.tsx`, importar `CardapioQRSection` e renderizar com `establishment.slug` quando houver slug, acima do `EstablishmentForm`.
5. **Build e teste** — Rodar `npm run build` no admin; abrir estabelecimento no admin e validar link, copiar e QR.

---

## 3. Código — Caminhos e pontos de inserção

### 3.1 Constante APP_PUBLIC_URL

**Arquivo:** `/home/servidor-dcnet/cardapio-universal/admin/src/lib/constants.ts`

**Inserção:** Após a linha que define `API_BASE_URL`, adicionar a constante da URL pública do app (e, se desejar, comentário sobre `.env`).

```ts
// Após API_BASE_URL e antes de TOKEN_KEY:
/** URL base do app público (cardápio). Definir NEXT_PUBLIC_APP_URL em produção. */
export const APP_PUBLIC_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
```

### 3.2 Dependência qrcode

**Arquivo:** `/home/servidor-dcnet/cardapio-universal/admin/package.json`

**Inserção:** No objeto `dependencies`, adicionar uma linha com `"qrcode": "^1.5.3"` (ordem alfabética ou ao final do bloco).

### 3.3 Componente CardapioQRSection

**Arquivo (novo):** `/home/servidor-dcnet/cardapio-universal/admin/src/components/establishment/CardapioQRSection.tsx`

Conteúdo completo do componente (ver bloco abaixo).

### 3.4 Página do estabelecimento [id]

**Arquivo:** `/home/servidor-dcnet/cardapio-universal/admin/src/app/(dashboard)/establishments/[id]/page.tsx`

**Inserção:**
- No topo, no bloco de imports, adicionar: `import { CardapioQRSection } from '@/components/establishment/CardapioQRSection';`
- No JSX, após o `<h1>` e antes do `<EstablishmentForm>`, inserir o bloco que renderiza o QR quando há slug (ver bloco abaixo).

---

## 4. Checklist final — Como testar sem quebrar produção

- [ ] **Backup:** Nenhuma alteração em banco, API ou infra. Se quiser, fazer backup do branch antes (ex.: `git stash` ou branch de feature).
- [ ] **Build admin:** Na raiz do admin, rodar `npm install` (para instalar `qrcode`) e em seguida `npm run build`. Deve concluir sem erros.
- [ ] **URL em produção:** No ambiente de produção do admin, definir `NEXT_PUBLIC_APP_URL=https://app.cardapio.nexoracloud.com.br` (ou o domínio real do app) e fazer rebuild/redeploy do admin. Não alterar Nginx nem PM2.
- [ ] **Teste no Admin:** Fazer login, ir em Estabelecimentos, abrir um estabelecimento que tenha slug. Verificar: (1) link do cardápio exibido; (2) botão “Copiar link” cola a URL correta; (3) imagem do QR Code visível; (4) botão “Baixar QR” faz download de um PNG.
- [ ] **Link correto:** O link deve ser exatamente `{APP_PUBLIC_URL}/{slug}` (ex.: `https://app.cardapio.nexoracloud.com.br/restaurante-demo`). Abrir em nova aba e confirmar que o cardápio público carrega.
- [ ] **Rollback:** Remover a dependência `qrcode` do `package.json`, remover o import e o uso de `CardapioQRSection` na página `[id]`, remover a constante `APP_PUBLIC_URL` e o arquivo `CardapioQRSection.tsx`; rodar `npm install` e `npm run build` novamente.

---

**Resumo:** A solução usa apenas o slug já existente no Establishment e a URL base do app; não cria tabelas, rotas nem endpoints novos e mantém compatibilidade com o sistema atual.
