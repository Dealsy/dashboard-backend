import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'contact@mattdeal.com.au',
        firstName: 'Matt',
        lastName: 'Deal',
        password: 'test123', // In a real app, this should be hashed
      },
    });

    console.log('Created user:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
