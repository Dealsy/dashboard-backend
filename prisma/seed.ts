import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  'Sport',
  'Cruiser',
  'Adventure',
  'Touring',
  'Naked',
] as const;
const SERVICE_TYPES = [
  'Oil Change',
  'Tire Change',
  'Chain Service',
  'Major Service',
  'Brake Service',
] as const;
const COLORS = ['Red', 'Black', 'Blue', 'White', 'Silver'] as const;

type BrandModels = {
  brand: string;
  models: {
    [K in (typeof CATEGORIES)[number]]?: string[];
  };
};

const MOTORCYCLE_BRANDS: BrandModels[] = [
  {
    brand: 'Ducati',
    models: {
      Sport: ['Panigale V4', 'SuperSport 950', 'Panigale V2'],
      Naked: ['Monster', 'Streetfighter V4', 'Streetfighter V2'],
      Adventure: ['Multistrada V4', 'Desert X'],
    },
  },
  {
    brand: 'Kawasaki',
    models: {
      Sport: ['Ninja ZX-10R', 'Ninja ZX-6R', 'Ninja 400'],
      Naked: ['Z900', 'Z650', 'Z400'],
      Touring: ['Concours 14', 'Versys 1000'],
      Adventure: ['KLR650', 'Versys-X 300'],
    },
  },
  {
    brand: 'Honda',
    models: {
      Sport: ['CBR1000RR-R', 'CBR600RR', 'CBR500R'],
      Cruiser: ['Rebel 1100', 'Rebel 500', 'Shadow'],
      Adventure: ['Africa Twin', 'CB500X'],
      Touring: ['Gold Wing', 'NT1100'],
      Naked: ['CB1000R', 'CB650R', 'CB300R'],
    },
  },
  {
    brand: 'Yamaha',
    models: {
      Sport: ['YZF-R1', 'YZF-R7', 'YZF-R3'],
      Naked: ['MT-10', 'MT-09', 'MT-07'],
      Adventure: ['Ténéré 700', 'Super Ténéré'],
      Touring: ['FJR1300', 'Tracer 9 GT'],
    },
  },
  {
    brand: 'BMW',
    models: {
      Adventure: ['R 1250 GS', 'F 850 GS', 'F 750 GS'],
      Sport: ['M 1000 RR', 'S 1000 RR'],
      Touring: ['K 1600 GTL', 'R 1250 RT'],
      Naked: ['S 1000 R', 'F 900 R'],
    },
  },
];

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  // Create motorbikes
  const motorbikes = await Promise.all(
    MOTORCYCLE_BRANDS.flatMap((brandData) =>
      Object.entries(brandData.models).flatMap(([category, models]) =>
        models.map((model) =>
          prisma.motorbike.create({
            data: {
              brand: brandData.brand,
              model,
              category,
              year: 2020 + Math.floor(Math.random() * 4),
              price: 5000 + Math.floor(Math.random() * 15000),
              engineSize: 600 + Math.floor(Math.random() * 900),
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
            },
          }),
        ),
      ),
    ),
  );

  // Create inventory entries
  await Promise.all(
    motorbikes.map((motorbike) =>
      prisma.inventory.create({
        data: {
          motorbikeId: motorbike.id,
          quantity: Math.floor(Math.random() * 5) + 1,
          location: `Warehouse ${Math.floor(Math.random() * 3) + 1}`,
        },
      }),
    ),
  );

  // Create sales over the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await Promise.all(
    Array.from({ length: 50 }, () => {
      const saleDate = new Date(thirtyDaysAgo);
      saleDate.setDate(saleDate.getDate() + Math.floor(Math.random() * 30));

      const randomMotorbike =
        motorbikes[Math.floor(Math.random() * motorbikes.length)];

      return prisma.sale.create({
        data: {
          motorbikeId: randomMotorbike.id,
          salePrice: randomMotorbike.price * (1 + Math.random() * 0.2), // Add up to 20% markup
          saleDate,
          customerName: `Customer ${Math.floor(Math.random() * 1000)}`,
        },
      });
    }),
  );

  // Create maintenance records
  await Promise.all(
    Array.from({ length: 30 }, () => {
      const randomMotorbike =
        motorbikes[Math.floor(Math.random() * motorbikes.length)];
      const serviceType =
        SERVICE_TYPES[Math.floor(Math.random() * SERVICE_TYPES.length)];

      return prisma.maintenance.create({
        data: {
          motorbikeId: randomMotorbike.id,
          serviceType,
          cost: 100 + Math.floor(Math.random() * 900), // Random cost between 100 and 1000
          serviceDate: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ), // Random date in last 30 days
          notes: `Regular ${serviceType.toLowerCase()} maintenance`,
        },
      });
    }),
  );

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
