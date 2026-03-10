# Landing page e página de planos — Entrega

## 1. Diagnóstico real (arquivos alterados/criados)

### Onde colocar a landing
- **Frontend público (app do cardápio).** A home pública já é `app/page.tsx` no frontend; quando o host é o padrão, exibe conteúdo comercial. O admin é para gestão (login/onboarding); o app público é o que o visitante vê no domínio do produto. Mantém tudo na mesma aplicação sem novo deploy.

### Rota atual da home pública
- **`/`** em `frontend/src/app/page.tsx`. Se host = APP_HOST → landing; se host ≠ APP_HOST → CustomDomainStorePage (cardápio por domínio custom).

### Conflito com cardápio por slug
- Cardápio por slug usa **`/[storeSlug]`** (ex.: `/pizzaria-do-joao`). Em Next.js, rotas estáticas têm prioridade sobre dinâmicas. **`/planos`** é rota estática; portanto `/planos` sempre mostra a página de planos e o path "planos" fica reservado (nenhum estabelecimento deve usar slug "planos" para evitar confusão). A home `/` não conflita: continua sendo a única rota raiz.

### CTAs
- **Criar conta** → `ADMIN_URL/onboarding`
- **Entrar** → `ADMIN_URL/login`
- **Ver planos** → `/planos` (interno ao frontend)
- Constante **ADMIN_URL** em `frontend/src/lib/constants.ts` (env `NEXT_PUBLIC_ADMIN_URL` ou fallback `https://admin.cardapio.nexoracloud.com.br`).

### Layouts e componentes reaproveitados
- **Layout:** Não existe layout comercial; criado `CommercialLayout` (header + footer).
- **Componentes:** `Button`, `Link` (next/link), Tailwind e `globals.css` (primary/secondary) já existentes; usados na landing e em planos.

### Arquivos criados
| Caminho | Descrição |
|--------|-----------|
| `frontend/src/lib/constants.ts` | Alterado: adicionado `ADMIN_URL`. |
| `frontend/src/lib/plans-commercial.ts` | Novo: configuração visual dos 3 planos (Basic, Pro, Enterprise) para a página comercial. |
| `frontend/src/components/commercial/CommercialLayout.tsx` | Novo: header (logo, Planos, Entrar, Criar conta) + footer. |
| `frontend/src/components/commercial/LandingPage.tsx` | Novo: landing (Hero, Benefícios, Como funciona, Planos resumidos, Prova visual, CTA final). |
| `frontend/src/app/page.tsx` | Alterado: quando host = APP_HOST, renderiza `<LandingPage />` em vez da landing mínima. |
| `frontend/src/app/planos/page.tsx` | Novo: página de pricing com 3 planos e CTA "Começar agora" → onboarding. |

---

## 2. Plano técnico (ordem exata)

1. Adicionar **ADMIN_URL** em `frontend/src/lib/constants.ts`.
2. Criar **plans-commercial.ts** com os 3 planos (apenas exibição).
3. Criar **CommercialLayout** (header + footer) com links para /planos, login e onboarding.
4. Criar **LandingPage** com todas as seções e usar **CommercialLayout**.
5. Alterar **app/page.tsx** para renderizar **LandingPage** quando host = APP_HOST.
6. Criar **app/planos/page.tsx** com **CommercialLayout** e grid de planos com CTAs para onboarding.

---

## 3. Código (caminho e ponto de inserção)

- **`frontend/src/lib/constants.ts`**  
  Após `APP_HOST`, inserir:  
  `export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.cardapio.nexoracloud.com.br';`

- **`frontend/src/lib/plans-commercial.ts`**  
  Arquivo novo: array `COMMERCIAL_PLANS` com basic, pro, enterprise (name, price, features, recommended).

- **`frontend/src/components/commercial/CommercialLayout.tsx`**  
  Arquivo novo: header com logo "Nexora", links Planos (/planos), Entrar (ADMIN_URL/login), Criar conta (ADMIN_URL/onboarding); footer com marca e mesmos links.

- **`frontend/src/components/commercial/LandingPage.tsx`**  
  Arquivo novo: seções Hero, Benefícios, Como funciona (3 passos), Planos resumidos, Prova visual (placeholder), CTA final; tudo dentro de `<CommercialLayout>`.

- **`frontend/src/app/page.tsx`**  
  Remover o bloco `<main>...</main>` da landing antiga; importar `LandingPage` e, no branch `host === APP_HOST`, retornar `<LandingPage />`.

- **`frontend/src/app/planos/page.tsx`**  
  Arquivo novo: página default export com `<CommercialLayout>`, título "Planos Nexora", grid de 3 cards usando `COMMERCIAL_PLANS`, botão "Começar agora" → ADMIN_URL/onboarding, link "Já tem conta?" → login.

---

## 4. Checklist final (como testar sem quebrar produção)

- [ ] **Build frontend:** `npm run build` no diretório `frontend` sem erros.
- [ ] **Home no host padrão:** Acessar `https://app.cardapio.nexoracloud.com.br/` (ou localhost com APP_HOST) e ver a nova landing (Hero, benefícios, como funciona, planos resumo, CTA).
- [ ] **Domínio custom intacto:** Acessar o app pelo domínio custom configurado; a rota `/` deve continuar exibindo o cardápio (CustomDomainStorePage), não a landing.
- [ ] **Cardápio por slug:** Acessar `/{slug}` (ex.: `/minha-loja`) e confirmar que o cardápio público continua funcionando.
- [ ] **Página de planos:** Acessar `/planos` e ver os 3 planos com CTAs; "Começar agora" deve levar ao admin/onboarding; "Já tem conta?" ao login.
- [ ] **Navegação:** No header da landing e da página de planos, clicar em Planos, Entrar e Criar conta e verificar destinos corretos.
- [ ] **Variável de ambiente:** Em produção, definir `NEXT_PUBLIC_ADMIN_URL` com a URL do admin para os CTAs apontarem ao ambiente correto.
- [ ] **Rollback:** Reverter alterações em `app/page.tsx` (voltar à landing mínima), remover `app/planos/page.tsx`, remover `components/commercial` e `lib/plans-commercial.ts`, e remover `ADMIN_URL` de constants; rebuild.

---

## Resultado esperado

- Landing page comercial na home (quando host = padrão).
- Página pública de planos em `/planos`.
- Navegação pública (header e footer) com Planos, Entrar e Criar conta.
- CTAs para onboarding e login sem alterar backend, auth ou admin.
- App público por slug e por domínio custom inalterados.
