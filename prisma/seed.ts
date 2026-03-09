/**
 * Seed inicial para desenvolvimento - Cardápio Universal
 * Senha do usuário admin: 123456 (hash bcrypt - trocar em produção).
 * Execute após a migration: npm run prisma:seed ou npx prisma db seed
 */
import { PrismaClient, Role, Weekday } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TENANT_SLUG = 'cardapio-demo';
const ESTABLISHMENT_SLUG = 'restaurante-demo';
const ADMIN_EMAIL = 'admin@cardapiodemo.com';
const DEV_PASSWORD = '123456';

async function main() {
  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: {
      name: 'Cardápio Demo',
      slug: TENANT_SLUG,
      email: 'admin@cardapiodemo.com',
      phone: '61996088711',
      isActive: true,
      plan: 'basic',
      status: 'active',
    },
  });

  // 2. Estabelecimento
  const establishment = await prisma.establishment.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: ESTABLISHMENT_SLUG } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Restaurante Demo',
      slug: ESTABLISHMENT_SLUG,
      city: 'Brasília',
      state: 'DF',
      isActive: true,
    },
  });

  // 3. Usuário administrativo (senha: 123456 - apenas desenvolvimento)
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: ADMIN_EMAIL } },
    update: {},
    create: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      name: 'Admin Demo',
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.TENANT_OWNER,
      isActive: true,
    },
  });

  // 4. Categorias (sem unique composto no schema: findFirst + create)
  let catPizzas = await prisma.category.findFirst({
    where: { tenantId: tenant.id, establishmentId: establishment.id, name: 'Pizzas' },
  });
  if (!catPizzas) {
    catPizzas = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        establishmentId: establishment.id,
        name: 'Pizzas',
        description: 'Pizzas artesanais',
        sortOrder: 0,
        isActive: true,
      },
    });
  }

  let catBebidas = await prisma.category.findFirst({
    where: { tenantId: tenant.id, establishmentId: establishment.id, name: 'Bebidas' },
  });
  if (!catBebidas) {
    catBebidas = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        establishmentId: establishment.id,
        name: 'Bebidas',
        description: 'Bebidas geladas',
        sortOrder: 1,
        isActive: true,
      },
    });
  }

  // 5. Produtos (2 em Pizzas, 2 em Bebidas)
  const pizzaCalabresa = await prisma.product.upsert({
    where: {
      establishmentId_slug: { establishmentId: establishment.id, slug: 'pizza-calabresa' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      categoryId: catPizzas.id,
      name: 'Pizza Calabresa',
      slug: 'pizza-calabresa',
      description: 'Calabresa fatiada com cebola',
      price: 49.9,
      compareAtPrice: 54.9,
      isFeatured: true,
      sortOrder: 0,
      isActive: true,
    },
  });

  const pizzaFrango = await prisma.product.upsert({
    where: {
      establishmentId_slug: { establishmentId: establishment.id, slug: 'pizza-frango-catupiry' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      categoryId: catPizzas.id,
      name: 'Pizza Frango com Catupiry',
      slug: 'pizza-frango-catupiry',
      description: 'Frango desfiado e catupiry',
      price: 52.9,
      isFeatured: true,
      sortOrder: 1,
      isActive: true,
    },
  });

  const coca = await prisma.product.upsert({
    where: {
      establishmentId_slug: { establishmentId: establishment.id, slug: 'coca-cola-2l' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      categoryId: catBebidas.id,
      name: 'Coca-Cola 2L',
      slug: 'coca-cola-2l',
      price: 12,
      sortOrder: 0,
      isActive: true,
    },
  });

  const guarana = await prisma.product.upsert({
    where: {
      establishmentId_slug: { establishmentId: establishment.id, slug: 'guarana-lata' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      categoryId: catBebidas.id,
      name: 'Guaraná Lata',
      slug: 'guarana-lata',
      price: 5,
      sortOrder: 1,
      isActive: true,
    },
  });

  // 6. Grupo de opcionais + itens (OptionalGroup não tem unique por name: findFirst + create)
  let groupExtrasResolved = await prisma.optionalGroup.findFirst({
    where: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      name: 'Extras',
    },
  });
  if (!groupExtrasResolved) {
    groupExtrasResolved = await prisma.optionalGroup.create({
      data: {
        tenantId: tenant.id,
        establishmentId: establishment.id,
        name: 'Extras',
        description: 'Adicionais para sua pizza',
        minSelect: 0,
        maxSelect: 3,
        isRequired: false,
        sortOrder: 0,
        isActive: true,
      },
    });
  }

  const optionalItemsData = [
    { name: 'Bacon', price: 4 },
    { name: 'Queijo Extra', price: 5 },
    { name: 'Molho Especial', price: 2 },
  ];

  for (let i = 0; i < optionalItemsData.length; i++) {
    const item = optionalItemsData[i];
    const existing = await prisma.optionalItem.findFirst({
      where: {
        optionalGroupId: groupExtrasResolved.id,
        name: item.name,
      },
    });
    if (!existing) {
      await prisma.optionalItem.create({
        data: {
          tenantId: tenant.id,
          optionalGroupId: groupExtrasResolved.id,
          name: item.name,
          price: item.price,
          sortOrder: i,
          isActive: true,
        },
      });
    }
  }

  // Vincular grupo Extras aos dois produtos de pizza (N:N)
  await prisma.productOptionalGroup.upsert({
    where: {
      productId_optionalGroupId: {
        productId: pizzaCalabresa.id,
        optionalGroupId: groupExtrasResolved.id,
      },
    },
    update: {},
    create: {
      productId: pizzaCalabresa.id,
      optionalGroupId: groupExtrasResolved.id,
    },
  });
  await prisma.productOptionalGroup.upsert({
    where: {
      productId_optionalGroupId: {
        productId: pizzaFrango.id,
        optionalGroupId: groupExtrasResolved.id,
      },
    },
    update: {},
    create: {
      productId: pizzaFrango.id,
      optionalGroupId: groupExtrasResolved.id,
    },
  });

  // 7. Store settings (1 por estabelecimento)
  await prisma.storeSettings.upsert({
    where: {
      tenantId_establishmentId: {
        tenantId: tenant.id,
        establishmentId: establishment.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      acceptsDelivery: true,
      acceptsPickup: true,
      acceptsDineIn: true,
      currency: 'BRL',
    },
  });

  // 8. Horário de funcionamento (seg a sáb 11h-23h; domingo fechado)
  const weekdays = [
    Weekday.MONDAY,
    Weekday.TUESDAY,
    Weekday.WEDNESDAY,
    Weekday.THURSDAY,
    Weekday.FRIDAY,
    Weekday.SATURDAY,
    Weekday.SUNDAY,
  ];
  for (const weekday of weekdays) {
    await prisma.establishmentWorkingHours.upsert({
      where: {
        establishmentId_weekday: { establishmentId: establishment.id, weekday },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        establishmentId: establishment.id,
        weekday,
        openTime: weekday === Weekday.SUNDAY ? null : '11:00',
        closeTime: weekday === Weekday.SUNDAY ? null : '23:00',
        isClosed: weekday === Weekday.SUNDAY,
      },
    });
  }

  console.log('Seed concluído.');
  console.log('Tenant:', tenant.name, '| Estabelecimento:', establishment.name);
  console.log('Login:', ADMIN_EMAIL, '| Senha (dev):', DEV_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
