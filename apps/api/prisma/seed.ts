import { PrismaClient, Rol, Especie, Sexo, EstadoAnimal } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@ganasoft.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@ganasoft.com',
      password: adminPassword,
      rol: Rol.ADMIN,
    },
  })

  await prisma.usuario.upsert({
    where: { email: 'empleado@ganasoft.com' },
    update: {},
    create: {
      nombre: 'Juan Perez',
      email: 'empleado@ganasoft.com',
      password: await bcrypt.hash('empleado123', 10),
      rol: Rol.EMPLEADO,
    },
  })

  await prisma.animal.upsert({
    where: { codigo: 'BOV-001' },
    update: {},
    create: { codigo: 'BOV-001', nombre: 'Lola', especie: Especie.BOVINO, raza: 'Holstein', sexo: Sexo.HEMBRA, peso: 450.5, estado: EstadoAnimal.ACTIVO, usuarioId: admin.id },
  })

  await prisma.animal.upsert({
    where: { codigo: 'BOV-002' },
    update: {},
    create: { codigo: 'BOV-002', nombre: 'Toro Negro', especie: Especie.BOVINO, raza: 'Angus', sexo: Sexo.MACHO, peso: 620.0, estado: EstadoAnimal.ACTIVO, usuarioId: admin.id },
  })

  await prisma.animal.upsert({
    where: { codigo: 'POR-001' },
    update: {},
    create: { codigo: 'POR-001', nombre: 'Gordo', especie: Especie.PORCINO, raza: 'Duroc', sexo: Sexo.MACHO, peso: 95.0, estado: EstadoAnimal.ACTIVO, usuarioId: admin.id },
  })

  console.log('Seed completo!')
}

main().catch(console.error).finally(() => prisma.$disconnect())