# Domínio personalizado – O que é aplicação e o que é infraestrutura

## O que a aplicação faz

- **Backend:** Aceita o campo `customDomain` no estabelecimento. A API pública resolve a loja pelo **slug** (path) ou pelo **host** (query `GET /public/store/by-host?host=...`).
- **Frontend (app público):** Se o host da requisição for diferente do host padrão do app (`NEXT_PUBLIC_APP_HOST`), a aplicação trata como domínio personalizado: resolve a loja pelo host e exibe o cardápio em `/`, `/cart`, `/checkout`, etc., sem slug no path.
- **Admin:** Permite cadastrar e editar o domínio personalizado por estabelecimento. Exibe aviso de que DNS/SSL/proxy são de responsabilidade externa.

## O que depende de infraestrutura externa

A aplicação **não** configura DNS, certificados nem proxy. Quem for usar domínio personalizado precisa fazer isso fora do código.

### 1. DNS (CNAME ou A)

- O domínio do cliente (ex.: `menu.pizzariadojoao.com.br`) precisa apontar para o servidor que entrega o app/API.
- **CNAME:** Ex.: `menu` → `app.cardapio.nexoracloud.com.br` (ou o host do servidor que serve o frontend).
- **A:** Ex.: `menu` → IP do servidor.
- Sem esse apontamento, o domínio personalizado não chega ao mesmo servidor da aplicação.

### 2. Proxy reverso (Nginx ou equivalente)

- O mesmo servidor que atende o host padrão (ex.: `app.cardapio.nexoracloud.com.br`) precisa atender também o host custom (ex.: `menu.pizzariadojoao.com.br`).
- No Nginx (ou similar), é necessário um `server` (ou `server_name`) que inclua o domínio personalizado e aponte para a mesma aplicação (frontend/API) que já existe.
- **Não alterar Nginx em produção sem plano claro e rollback.**

### 3. SSL (certificado HTTPS)

- Para HTTPS no domínio personalizado, é preciso um certificado válido para esse host.
- Opções comuns: Let’s Encrypt (por domínio ou wildcard), ou certificado comercial. O proxy reverso costuma fazer a terminação SSL.
- A aplicação não emite nem instala certificados.

### 4. Variável de ambiente no frontend

- Definir `NEXT_PUBLIC_APP_HOST` com o host **padrão** do app (ex.: `app.cardapio.nexoracloud.com.br`).
- Qualquer outro host será tratado como domínio personalizado (resolução por host).

## Resumo

| Responsabilidade | Quem faz |
|------------------|----------|
| Resolver loja por slug ou host | Aplicação (backend + frontend) |
| Salvar e exibir customDomain no admin | Aplicação |
| Apontar o domínio para o servidor (CNAME/A) | Cliente / infra (DNS) |
| Atender o host custom no mesmo app (proxy) | Infra (Nginx etc.) |
| Certificado SSL para o domínio custom | Infra (Let’s Encrypt etc.) |

Não há automação de DNS ou SSL no projeto; a aplicação apenas usa o host recebido para escolher a loja quando há domínio personalizado configurado.
