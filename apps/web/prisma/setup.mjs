// Crea el usuario admin inicial si no existe
import { PrismaClient } from '@prisma/client'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const exists = await prisma.usuario.findUnique({ where: { email: 'admin@ganasoft.com' } })
  if (!exists) {
    const password = await bcrypt.hash('admin123', 10)
    await prisma.usuario.create({
      data: { nombre: 'Administrador', email: 'admin@ganasoft.com', password, rol: 'ADMIN' }
    })
    console.log('✅ Usuario admin creado: admin@ganasoft.com / admin123')
  } else {
    console.log('ℹ️  Usuario admin ya existe')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
