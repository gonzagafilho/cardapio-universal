# Diagnóstico: origem do slug incorreto (bistro-nexora)

**Data:** 2026-03-15  
**Modo:** Produção segura — inspeção sem alterar backend à toa.

---

## 1. RAIO-X AGORA

| Item | Estado |
|------|--------|
| Backend `GET /api/public/store/:slug/settings` | OK; usa `getStoreBySlug(slug)` com `prisma.establishment.findFirst({ where: { slug, isActive: true } })` |
| Slug real no banco (Bistrô Nexora) | **`bistro`** (confirmado por query Prisma) |
| `GET /api/public/store/bistro/settings` | 200 OK |
| `GET /api/public/store/bistro-nexora/settings` | 404 Loja não encontrada |
| Frontend rota por path (APP_HOST) | `/[storeSlug]` → `params.storeSlug` → `useStoreData(storeSlug)` → `getStoreBySlug(storeSlug)` → chamadas a `/api/public/store/${storeSlug}`. **O frontend não monta o slug; usa o que vem da URL.** |
| Frontend rota por host (custom/subdomínio) | `page.tsx` lê `headers().get('host')`; se `host !== APP_HOST` → `CustomDomainStorePage(host)` → `useStoreDataByHost(host)` → `getStoreByHost(host)` → `GET /api/public/store/by-host?host=...`. Slug não aparece na URL. |
| Nginx cardapio-nexora | `bistro.menu.cardapio.nexoracloud.com.br` como `server_name`; proxy para API (3023) e App (3021); `Host $host` repassado. Acesso por esse host usa resolução **by-host**, não slug na path. |
| Establishments ativos (banco) | 4; Bistrô Nexora: `slug: "bistro"`, `customDomain: null`. Nenhum tem slug `bistro-nexora`. |

**Conclusão do raio-x:** Não há bug de geração de slug no backend nem no frontend. O 404 com `bistro-nexora` ocorre porque esse valor não existe no banco; quem chama com esse slug está usando um identificador errado (digitado, link ou exemplo de script).

---

## 2. INSPEÇÃO REAL

### Passo 1 — Frontend e resolução de slug

- **Onde o slug é usado por path:**  
  - `frontend/src/app/(public)/[storeSlug]/page.tsx`: recebe `params.storeSlug` (Next.js) e passa para `useStoreData(storeSlug)`.  
  - `frontend/src/hooks/useStoreData.ts`: chama `getStoreBySlug(storeSlug)`, `getStoreCategories(storeSlug)`, etc.  
  - `frontend/src/services/store.service.ts`: `getStoreBySlug(slug)` → `GET ${PUBLIC_PREFIX}/${slug}`; `getStoreByHost(host)` → `GET ${PUBLIC_PREFIX}/by-host?host=...`.
- **Constantes de host:**  
  - `frontend/src/lib/constants.ts`: `APP_HOST`, `MENU_BASE_HOST`, `NEXT_PUBLIC_API_URL`.  
  - `.env.production`: `NEXT_PUBLIC_APP_HOST=app.cardapio.nexoracloud.com.br`, `NEXT_PUBLIC_API_URL=https://api.cardapio.nexoracloud.com.br/api`.
- **Onde `/api/public/store/` aparece no código:**  
  - `frontend/src/services/store.service.ts` (prefix + slug ou by-host).  
  - Scripts `apply-nginx-nexora.sh` e `remove-nginx-duplicados.sh`: **exemplos de curl com slug `bistro-nexora`** (induzem teste com slug errado).
- **Admin QR/link:**  
  - `CardapioQRSection` recebe `slug` do estabelecimento (vindo da API/banco); monta `APP_PUBLIC_URL/${slug}`. Se o banco tem `bistro`, o link fica correto. Não há código no admin que transforma nome em slug para esse link.

### Passo 2 — Nginx

- Configuração em `/etc/nginx/sites-enabled/cardapio-nexora` (e sites-available):
  - `server_name bistro.menu.cardapio.nexoracloud.com.br`; proxy para API e para frontend (3021); `proxy_set_header Host $host`.
- Não há rewrite que coloque `bistro-nexora` na URL. Quem acessa por `bistro.menu....` envia Host = `bistro.menu.cardapio.nexoracloud.com.br`; o app usa **by-host**, não slug na path.

### Passo 3 — Rota by-host

- **Controller:** `GET public/store/by-host?host=` → `getStoreByHost(host)`.  
- **Service:** `getStoreByHost(host)` normaliza o host; 1) busca por `customDomain = host`; 2) se houver `SUBDOMAIN_BASE_DOMAIN`, usa `extractSubdomainSlug(host, base)` e depois `getStoreBySlug(slug)`. Para `bistro.menu.cardapio.nexoracloud.com.br` e base `menu.cardapio.nexoracloud.com.br`, o slug extraído é `bistro` → correto.
- Uso real: quando o usuário acessa por subdomínio/domínio custom, o frontend chama by-host; não há evidência de que by-host esteja sendo ignorado ou que o slug errado venha daí.

### Passo 4 — Dados reais (customDomain e slug)

- Query executada:  
  `establishment.findMany({ where: { isActive: true }, select: { id, name, slug, customDomain, tenantId } })`.
- Resultado: Bistrô Nexora — `slug: "bistro"`, `customDomain: null`. Nenhum establishment com slug `bistro-nexora`.
- Conclusão: frontend por path deve usar slug **bistro**; por host (bistro.menu....) a resolução é by-host e o backend deriva slug **bistro** do subdomínio.

### Evidência adicional — arquivo no repositório

- Arquivo **`tablishment"`** (no root do repo): conteúdo é um dump em formato de tabela (ex.: saída de `SELECT` psql) com uma linha:
  - `cmmrrmyw3000n80grcngn96r5 | Bistrô Nexora | bistro-nexora | t |`
- Ou seja, em algum momento essa saída mostrava slug **bistro-nexora** para o Bistrô Nexora. O banco **atual** tem slug **bistro**. Esse arquivo **não é código** da aplicação; é dado/snapshot que pode ter sido usado como referência e **induzir** uso do slug errado (ex.: em scripts ou testes). Não é a “origem” no sentido de código que monta o slug.

---

## 3. DIAGNÓSTICO

- **O slug incorreto `bistro-nexora` não é gerado por nenhum código do backend nem do frontend.**
- **Origens plausíveis do uso incorreto:**
  1. **Teste manual ou link digitado:** alguém acessa ou testa `.../bistro-nexora` (por exemplo por associar ao nome “Bistrô Nexora”).
  2. **Scripts de deploy/teste:** `apply-nginx-nexora.sh` e `remove-nginx-duplicados.sh` sugerem no final os curls com `.../api/public/store/bistro-nexora`, levando quem segue as instruções a testar o slug errado e ver 404.
  3. **Arquivo `tablishment"`:** dump/saída que mostra Bistrô Nexora com slug `bistro-nexora`; pode ter sido usada como referência e reforçar o uso desse valor.

Nenhuma dessas origens é bug de aplicação; são uso, documentação ou artefato de referência.

---

## 4. DECISÃO: EDITA OU NÃO EDITA

- **Backend:** **Não editar.** Comportamento está correto; 404 é esperado para slug inexistente.
- **Frontend (lógica de slug/host):** **Não editar.** Slug vem apenas da URL (params) ou da resolução por host; não há correção a fazer no código.
- **Opcional (recomendado):**  
  - Corrigir **exemplos** nos scripts para não induzir teste com slug errado.  
  - Remover ou corrigir o arquivo **`tablishment"`** para evitar que vire referência para slug incorreto.

---

## 5. PATCH MÍNIMO EXATO (somente para indução/documentação)

Aplicar **apenas** se quiser evitar que scripts e artefatos continuem sugerindo o slug errado.

**5.1 — Scripts (exemplos de curl)**

- **Arquivo:** `apply-nginx-nexora.sh`  
  - Trocar as duas linhas que contêm `bistro-nexora` por `bistro`:
    - `echo "  curl -sI https://api.cardapio.nexoracloud.com.br/api/public/store/bistro"`
    - `echo "  curl -sI https://app.cardapio.nexoracloud.com.br/api/public/store/bistro"`

- **Arquivo:** `remove-nginx-duplicados.sh`  
  - Mesma troca: `bistro-nexora` → `bistro` nos dois echos de curl.

**5.2 — Arquivo dump**

- **Arquivo:** `tablishment"` (root do repositório)  
  - **Opção A:** Deletar o arquivo (é snapshot/dump, não código).  
  - **Opção B:** Renomear para algo como `establishment-dump-old.txt` e adicionar uma linha no topo: “Referência antiga; slug correto do Bistrô Nexora no banco atual é **bistro**.”

Nenhuma migration, nenhuma alteração em backend ou em lógica de negócio do frontend.

---

## 6. VALIDAÇÃO FINAL

- Após o patch dos scripts:
  - `curl -sI https://api.cardapio.nexoracloud.com.br/api/public/store/bistro` → 200 (ou 302 conforme implementação).
  - `curl -sI https://api.cardapio.nexoracloud.com.br/api/public/store/bistro-nexora` → 404 (comportamento esperado).
- Quem seguir os “Teste com” dos scripts passará a usar o slug correto e não será induzido ao 404 por exemplo errado.

---

## 7. TEXTO PRONTO PRO PRÓXIMO CHAT

Colar no próximo chat:

---

**Contexto (diagnóstico slug Bistrô Nexora):**

- Backend e frontend estão corretos: o slug real do Bistrô Nexora no banco é **`bistro`**; `bistro-nexora` não existe e por isso retorna 404.
- O frontend não “monta” o slug: na rota por path usa `params.storeSlug`; na rota por host usa `getStoreByHost(host)` (by-host). A origem do uso incorreto de `bistro-nexora` foi identificada como **indução por scripts e por um arquivo dump**, não como bug de código.
- Foi feito diagnóstico completo (greps, Nginx, controller/service by-host, query Prisma, inspeção da página `[storeSlug]` e do fluxo por host). Documento: `docs/DIAGNOSTICO-SLUG-BISTRO-NEXORA.md`.
- **Decisão:** não alterar backend nem lógica do frontend. **Patch opcional já documentado:** (1) nos scripts `apply-nginx-nexora.sh` e `remove-nginx-duplicados.sh`, trocar os exemplos de curl de `bistro-nexora` para `bistro`; (2) remover ou renomear o arquivo `tablishment"` no root (dump com slug errado) para não induzir referência ao slug incorreto.

---

*Fim do diagnóstico.*
