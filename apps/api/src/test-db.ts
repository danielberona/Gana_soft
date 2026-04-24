import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log(`Conexión exitosa. Usuarios encontrados: ${users.length}`);
  } catch (error: any) {
    console.error('Error conectando a la base de datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
