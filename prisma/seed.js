// prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Upsert some categories, cant dup with Upsert when we run multiple times
  const dairy = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Dairy' },
  });

  const meat = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Meat' },
  });

  const frozen = await prisma.category.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'Frozen' },
  });

  // Upsert some products (linked to categories above)
  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Chicken Breast 650g',
      description: 'Chicken breast',
      price: 6.50,
      stock: 51,
      categoryId: meat.id,
    },
  });

  await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Milk 1L',
      description: 'Semi skimmed',
      price: 1.25,
      stock: 101,
      categoryId: dairy.id,
    },
  });

  await prisma.product.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'Frozen Vrg 1kg',
      description: 'Peas, Cauliflower, Brocoli, frozen',
      price: 2.20,
      stock: 10,
      categoryId: frozen.id,
    },
  });
}

main()
  .then(async () => {
    console.log('Seed data created');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
