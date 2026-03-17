/**
 * Seed DEMO COMERCIAL — Pizzaria Bella Massa
 * Uso: apresentação comercial / vendas (Cardápio Nexora).
 * NÃO altera o seed.ts principal. Cria tenant + establishment separados.
 *
 * Slug público do cardápio: pizzaria-bella-massa
 * Execute: npx ts-node -r tsconfig-paths/register prisma/seed-demo-comercial.ts
 *
 * Backup do banco recomendado antes de rodar em produção.
 */
import { PrismaClient, Role, Weekday } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TENANT_SLUG = 'nexora-demo';
const ESTABLISHMENT_SLUG = 'pizzaria-bella-massa';
const ADMIN_EMAIL = 'admin@pizzariabellamassa.com';
const DEV_PASSWORD = '123456';

async function main() {
  // 1. Tenant (identidade visual: cores no tenant)
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {
      primaryColor: '#c2410c',
      secondaryColor: '#9a3412',
      name: 'Nexora Demo',
      isActive: true,
    },
    create: {
      name: 'Nexora Demo',
      slug: TENANT_SLUG,
      email: ADMIN_EMAIL,
      phone: '6133330000',
      primaryColor: '#c2410c',
      secondaryColor: '#9a3412',
      isActive: true,
      plan: 'pro',
      status: 'active',
    },
  });

  // 2. Estabelecimento — Pizzaria Bella Massa (slug público vendável, identidade comercial)
  const LOGO_URL = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80';
  const BANNER_URL = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80';
  const establishment = await prisma.establishment.upsert({
    where: { slug: ESTABLISHMENT_SLUG },
    update: {
      name: 'Pizzaria Bella Massa',
      description:
        'Pizzas artesanais e massas frescas. Ambiente aconchegante e delivery rápido. Experimente nosso forno a lenha.',
      phone: '(61) 3333-0000',
      whatsapp: '556133330000',
      email: 'contato@pizzariabellamassa.com.br',
      city: 'Brasília',
      state: 'DF',
      addressLine: 'Av. Comercial, 1000',
      neighborhood: 'Centro',
      logoUrl: LOGO_URL,
      bannerUrl: BANNER_URL,
      isActive: true,
    },
    create: {
      tenantId: tenant.id,
      name: 'Pizzaria Bella Massa',
      slug: ESTABLISHMENT_SLUG,
      description:
        'Pizzas artesanais e massas frescas. Ambiente aconchegante e delivery rápido. Experimente nosso forno a lenha.',
      phone: '(61) 3333-0000',
      whatsapp: '556133330000',
      email: 'contato@pizzariabellamassa.com.br',
      city: 'Brasília',
      state: 'DF',
      addressLine: 'Av. Comercial, 1000',
      neighborhood: 'Centro',
      logoUrl: LOGO_URL,
      bannerUrl: BANNER_URL,
      isActive: true,
    },
  });

  // 3. Usuário admin da demo (senha: 123456 — trocar em produção)
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: ADMIN_EMAIL } },
    update: {},
    create: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      name: 'Admin Bella Massa',
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.TENANT_OWNER,
      isActive: true,
    },
  });

  // 4. Categorias (comerciais, ordem de exibição — Destaques em primeiro)
  const categoriesData = [
    { name: 'Destaques', description: 'Promoções e combos imperdíveis', sortOrder: 0 },
    { name: 'Pizzas Tradicionais', description: 'Clássicas e irresistíveis', sortOrder: 1 },
    { name: 'Pizzas Especiais', description: 'Combinações especiais da casa', sortOrder: 2 },
    { name: 'Bebidas', description: 'Refrigerantes e bebidas geladas', sortOrder: 3 },
    { name: 'Sobremesas', description: 'Doces para fechar com chave de ouro', sortOrder: 4 },
  ];

  const categories: { id: string; name: string }[] = [];
  for (const cat of categoriesData) {
    let c = await prisma.category.findFirst({
      where: {
        tenantId: tenant.id,
        establishmentId: establishment.id,
        name: cat.name,
      },
    });
    if (!c) {
      c = await prisma.category.create({
        data: {
          tenantId: tenant.id,
          establishmentId: establishment.id,
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
      });
    }
    categories.push({ id: c.id, name: c.name });
  }

  const catDestaques = categories.find((c) => c.name === 'Destaques')!;
  const catTradicionais = categories.find((c) => c.name === 'Pizzas Tradicionais')!;
  const catEspeciais = categories.find((c) => c.name === 'Pizzas Especiais')!;
  const catBebidas = categories.find((c) => c.name === 'Bebidas')!;
  const catSobremesas = categories.find((c) => c.name === 'Sobremesas')!;

  // 5. Produtos (preços em reais; imageUrl opcional; destaque para combos)
  const productsData = [
    {
      name: 'Combo Família',
      slug: 'combo-familia',
      categoryId: catDestaques.id,
      description: '2 pizzas grandes (escolha os sabores) + 2 refrigerantes 2L. Ideal para reunir a família com economia.',
      price: 89.9,
      compareAtPrice: 110,
      isFeatured: true,
      sortOrder: 0,
    },
    {
      name: 'Mussarela',
      slug: 'mussarela',
      categoryId: catTradicionais.id,
      description: 'Molho de tomate, mussarela e orégano. Simples e deliciosa.',
      price: 45.9,
      compareAtPrice: null as number | null,
      isFeatured: true,
      sortOrder: 0,
    },
    {
      name: 'Margherita',
      slug: 'margherita',
      categoryId: catTradicionais.id,
      description: 'Molho de tomate, mussarela, tomate e manjericão fresco. A clássica italiana.',
      price: 48.9,
      compareAtPrice: null as number | null,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Calabresa',
      slug: 'calabresa',
      categoryId: catTradicionais.id,
      description: 'Calabresa fatiada com cebola. Um clássico que nunca sai de moda.',
      price: 47.9,
      compareAtPrice: 52.9,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: 'Frango com Catupiry',
      slug: 'frango-catupiry',
      categoryId: catEspeciais.id,
      description: 'Frango desfiado e catupiry cremoso. Um dos mais pedidos.',
      price: 52.9,
      compareAtPrice: null,
      isFeatured: true,
      sortOrder: 0,
    },
    {
      name: 'Portuguesa',
      slug: 'portuguesa',
      categoryId: catEspeciais.id,
      description: 'Presunto, mussarela, ovo, cebola e azeitonas. Sabor inconfundível.',
      price: 54.9,
      compareAtPrice: null,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Coca-Cola 2L',
      slug: 'coca-cola-2l',
      categoryId: catBebidas.id,
      description: 'Refrigerante 2 litros. Ideal para compartilhar.',
      price: 12,
      compareAtPrice: null,
      isFeatured: false,
      sortOrder: 0,
    },
    {
      name: 'Guaraná Lata',
      slug: 'guarana-lata',
      categoryId: catBebidas.id,
      description: 'Guaraná Antarctica 350ml.',
      price: 5,
      compareAtPrice: null,
      isFeatured: false,
      sortOrder: 1,
    },
    {
      name: 'Pudim',
      slug: 'pudim',
      categoryId: catSobremesas.id,
      description: 'Pudim de leite condensado com calda de caramelo. Fatia generosa.',
      price: 14.9,
      compareAtPrice: null,
      isFeatured: false,
      sortOrder: 0,
    },
    {
      name: 'Petit Gateau',
      slug: 'petit-gateau',
      categoryId: catSobremesas.id,
      description: 'Bolo de chocolate com recheio derretido. Servido com sorvete.',
      price: 18.9,
      compareAtPrice: null,
      isFeatured: true,
      sortOrder: 1,
    },
  ];

  const pizzaSlugs = ['mussarela', 'margherita', 'calabresa', 'frango-catupiry', 'portuguesa'];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: {
        establishmentId_slug: { establishmentId: establishment.id, slug: p.slug },
      },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
        categoryId: p.categoryId,
      },
      create: {
        tenantId: tenant.id,
        establishmentId: establishment.id,
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
        isActive: true,
      },
    });
  }

  // 6. Grupo de opcionais "Extras" (pizzas)
  let groupExtras = await prisma.optionalGroup.findFirst({
    where: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      name: 'Extras',
    },
  });
  if (!groupExtras) {
    groupExtras = await prisma.optionalGroup.create({
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

  const extrasItems = [
    { name: 'Bacon', price: 4 },
    { name: 'Queijo Extra', price: 5 },
    { name: 'Molho Especial', price: 2 },
  ];
  for (let i = 0; i < extrasItems.length; i++) {
    const item = extrasItems[i];
    const existing = await prisma.optionalItem.findFirst({
      where: { optionalGroupId: groupExtras.id, name: item.name },
    });
    if (!existing) {
      await prisma.optionalItem.create({
        data: {
          tenantId: tenant.id,
          optionalGroupId: groupExtras.id,
          name: item.name,
          price: item.price,
          sortOrder: i,
          isActive: true,
        },
      });
    }
  }

  // Vincular Extras às pizzas
  for (const slug of pizzaSlugs) {
    const product = await prisma.product.findFirst({
      where: { establishmentId: establishment.id, slug },
    });
    if (product) {
      await prisma.productOptionalGroup.upsert({
        where: {
          productId_optionalGroupId: {
            productId: product.id,
            optionalGroupId: groupExtras.id,
          },
        },
        update: {},
        create: {
          productId: product.id,
          optionalGroupId: groupExtras.id,
        },
      });
    }
  }

  // 7. Store settings (pedido mínimo, entrega, moeda)
  await prisma.storeSettings.upsert({
    where: {
      tenantId_establishmentId: { tenantId: tenant.id, establishmentId: establishment.id },
    },
    update: {
      minimumOrderAmount: 30,
      estimatedDeliveryTimeMin: 40,
      estimatedDeliveryTimeMax: 55,
      acceptsDelivery: true,
      acceptsPickup: true,
      acceptsDineIn: true,
      currency: 'BRL',
    },
    create: {
      tenantId: tenant.id,
      establishmentId: establishment.id,
      minimumOrderAmount: 30,
      estimatedDeliveryTimeMin: 40,
      estimatedDeliveryTimeMax: 55,
      acceptsDelivery: true,
      acceptsPickup: true,
      acceptsDineIn: true,
      currency: 'BRL',
    },
  });

  // 8. Horário de funcionamento (Seg–Sáb 11h–23h; Dom fechado)
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

  console.log('--- Seed DEMO COMERCIAL concluído ---');
  console.log('Tenant:', tenant.name, '| Estabelecimento:', establishment.name);
  console.log('Slug público (cardápio):', ESTABLISHMENT_SLUG);
  console.log('URL do cardápio: /' + ESTABLISHMENT_SLUG);
  console.log('Login admin:', ADMIN_EMAIL, '| Senha (dev):', DEV_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
