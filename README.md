# Cardápio Universal

Backend SaaS de cardápio digital multi-tenant (multi-empresa) com NestJS, TypeScript, Prisma e PostgreSQL.

## Stack

- Node.js + TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- JWT + Bcrypt
- Class-validator / Class-transformer
- Swagger
- Multer (upload)

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## Instalação

```bash
npm install
cp .env.example .env
# Edite .env com DATABASE_URL e JWT_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed   # opcional: tenant e usuário demo
```

## Executar

```bash
npm run start:dev
```

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

## Estrutura

- `src/common` – decorators, guards, pipes, filters, constants
- `src/config` – env, database, auth, swagger
- `src/prisma` – PrismaModule e PrismaService
- `src/modules/*` – auth, users, tenants, establishments, categories, products, product-options, carts, orders, payments, customers, coupons, delivery-zones, settings, reports, uploads, audit, health, store-public

## Perfis (roles)

- SUPER_ADMIN
- TENANT_OWNER
- MANAGER
- ATTENDANT
- OPERATOR

## Próximos passos sugeridos

1. Implementar validação de cupom no carrinho e persistir cupom aplicado.
2. Integrar gateway de pagamento (Stripe/Mercado Pago) em `PaymentsService`.
3. Persistir uploads em storage (S3/GCS) em `UploadsService`.
4. Adicionar auditoria automática (interceptor) chamando `AuditService.log`.
5. Testes unitários e e2e para módulos críticos.
6. Rate limiting e throttling para rotas públicas.
7. Documentar fluxo de pedido (status) e regras de negócio por tenant.
