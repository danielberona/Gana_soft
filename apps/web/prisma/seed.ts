import { PrismaClient, Rol, Especie, Sexo, EstadoAnimal, TipoEvento, EstadoTarea, Prioridad } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Usuarios
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@ganasoft.com' }, update: {},
    create: { nombre: 'Administrador', email: 'admin@ganasoft.com', password: adminPassword, rol: Rol.ADMIN },
  })

  await prisma.usuario.upsert({
    where: { email: 'empleado@ganasoft.com' }, update: {},
    create: { nombre: 'Juan Perez', email: 'empleado@ganasoft.com', password: await bcrypt.hash('empleado123', 10), rol: Rol.EMPLEADO },
  })

  // Potreros
  const potrero1 = await prisma.potrero.upsert({
    where: { id: 1 }, update: {},
    create: { nombre: 'Potrero Norte', hectareas: 5.0, capacidad: 20, descripcion: 'Pasto kikuyo, zona alta' },
  })
  const potrero2 = await prisma.potrero.upsert({
    where: { id: 2 }, update: {},
    create: { nombre: 'Potrero Sur', hectareas: 3.5, capacidad: 15, descripcion: 'Pasto brachiaria, zona baja' },
  })

  // Animales bovinos
  const lola = await prisma.animal.upsert({
    where: { codigo: 'BOV-001' }, update: {},
    create: {
      codigo: 'BOV-001', nombre: 'Lola', especie: Especie.BOVINO, raza: 'Holstein', sexo: Sexo.HEMBRA,
      color: 'Blanco con negro', numeroArete: 'CO-12345', peso: 450.5,
      fechaNac: new Date('2021-03-15'), estado: EstadoAnimal.ACTIVO,
      potreroId: potrero1.id, usuarioId: admin.id,
    },
  })

  const toro = await prisma.animal.upsert({
    where: { codigo: 'BOV-002' }, update: {},
    create: {
      codigo: 'BOV-002', nombre: 'Toro Negro', especie: Especie.BOVINO, raza: 'Angus', sexo: Sexo.MACHO,
      color: 'Negro', numeroArete: 'CO-12346', peso: 620.0,
      fechaNac: new Date('2020-06-10'), estado: EstadoAnimal.ACTIVO,
      potreroId: potrero1.id, usuarioId: admin.id,
    },
  })

  await prisma.animal.upsert({
    where: { codigo: 'BOV-003' }, update: {},
    create: {
      codigo: 'BOV-003', nombre: 'Rosita', especie: Especie.BOVINO, raza: 'Brahman', sexo: Sexo.HEMBRA,
      color: 'Pardo', peso: 380.0, fechaNac: new Date('2022-01-20'), estado: EstadoAnimal.ACTIVO,
      potreroId: potrero2.id, usuarioId: admin.id,
      padreId: toro.id, madreId: lola.id,
    },
  })

  await prisma.animal.upsert({
    where: { codigo: 'POR-001' }, update: {},
    create: {
      codigo: 'POR-001', nombre: 'Gordo', especie: Especie.PORCINO, raza: 'Duroc', sexo: Sexo.MACHO,
      peso: 95.0, estado: EstadoAnimal.ACTIVO, usuarioId: admin.id,
    },
  })

  // Registros de salud
  await prisma.registroSalud.createMany({
    data: [
      { animalId: lola.id, tipo: 'Consulta', descripcion: 'Control rutinario de mastitis preventivo', fecha: new Date('2026-05-10'), veterinario: 'Dr. Martínez', costo: 80000 },
      { animalId: lola.id, tipo: 'Tratamiento', descripcion: 'Aplicación de antibiótico por infección leve', fecha: new Date('2026-04-20'), veterinario: 'Dr. Martínez', costo: 120000 },
      { animalId: toro.id, tipo: 'Control', descripcion: 'Revisión reproductiva anual', fecha: new Date('2026-05-01'), veterinario: 'Dr. García', costo: 60000 },
    ],
    skipDuplicates: true,
  })

  // Vacunaciones
  await prisma.vacunacion.createMany({
    data: [
      { animalId: lola.id, vacuna: 'Aftosa', dosis: '2ml', lote: 'L2024-01', fecha: new Date('2026-03-01'), proximaDosis: new Date('2026-09-01'), veterinario: 'Dr. Martínez', costo: 15000 },
      { animalId: lola.id, vacuna: 'Brucelosis', dosis: '1 dosis', fecha: new Date('2026-02-15'), veterinario: 'Dr. Martínez', costo: 20000 },
      { animalId: toro.id, vacuna: 'Aftosa', dosis: '2ml', lote: 'L2024-01', fecha: new Date('2026-03-01'), proximaDosis: new Date('2026-09-01'), veterinario: 'Dr. Martínez', costo: 15000 },
    ],
    skipDuplicates: true,
  })

  // Producciones
  await prisma.produccion.createMany({
    data: [
      { animalId: lola.id, tipo: 'Leche', cantidad: 18.5, unidad: 'litros', fecha: new Date('2026-06-01') },
      { animalId: lola.id, tipo: 'Leche', cantidad: 19.0, unidad: 'litros', fecha: new Date('2026-06-02') },
      { animalId: lola.id, tipo: 'Leche', cantidad: 17.8, unidad: 'litros', fecha: new Date('2026-06-03') },
    ],
    skipDuplicates: true,
  })

  // Pesajes históricos
  await prisma.pesajeHistorial.createMany({
    data: [
      { animalId: lola.id, peso: 430.0, fecha: new Date('2026-01-01') },
      { animalId: lola.id, peso: 440.0, fecha: new Date('2026-02-01') },
      { animalId: lola.id, peso: 450.5, fecha: new Date('2026-03-01') },
    ],
    skipDuplicates: true,
  })

  // Eventos reproductivos
  await prisma.eventoReproductivo.createMany({
    data: [
      { animalId: lola.id, tipo: TipoEvento.CELO, fecha: new Date('2026-04-05'), observaciones: 'Detección de celo por comportamiento' },
      { animalId: lola.id, tipo: TipoEvento.INSEMINACION, fecha: new Date('2026-04-06'), observaciones: 'Inseminación artificial', padreId: toro.id },
      { animalId: lola.id, tipo: TipoEvento.PRENEZ_CONFIRMADA, fecha: new Date('2026-05-15'), observaciones: 'Confirmado por palpación rectal', resultado: 'Positivo' },
    ],
    skipDuplicates: true,
  })

  // Tareas
  await prisma.tarea.createMany({
    data: [
      { titulo: 'Vacunación masiva contra Aftosa', descripcion: 'Segundo ciclo de vacunación de todo el hato', fecha: new Date('2026-09-01'), prioridad: Prioridad.ALTA, estado: EstadoTarea.PENDIENTE, usuarioId: admin.id },
      { titulo: 'Pesaje mensual', descripcion: 'Pesar todos los animales del Potrero Norte', fecha: new Date('2026-07-01'), prioridad: Prioridad.MEDIA, animalId: lola.id, usuarioId: admin.id },
      { titulo: 'Revisión reproductiva de Lola', descripcion: 'Control de preñez del mes 2', fecha: new Date('2026-06-15'), prioridad: Prioridad.ALTA, animalId: lola.id, usuarioId: admin.id },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completo con todos los datos de prueba!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
