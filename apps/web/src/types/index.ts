export type Rol = 'ADMIN' | 'EMPLEADO'
export type Especie = 'BOVINO' | 'PORCINO' | 'OVINO' | 'CAPRINO' | 'EQUINO' | 'AVICOLA' | 'OTRO'
export type Sexo = 'MACHO' | 'HEMBRA'
export type EstadoAnimal = 'ACTIVO' | 'VENDIDO' | 'MUERTO' | 'TRANSFERIDO'
export type TipoEvento = 'CELO' | 'MONTA' | 'INSEMINACION' | 'PRENEZ_CONFIRMADA' | 'PARTO' | 'ABORTO' | 'DESTETE'
export type EstadoTarea = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA'
export type Prioridad = 'ALTA' | 'MEDIA' | 'BAJA'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
  activo: boolean
  creadoEn: string
}

export interface Potrero {
  id: number
  nombre: string
  hectareas?: number
  capacidad?: number
  descripcion?: string
  activo: boolean
  creadoEn: string
  _count?: { animales: number }
}

export interface Animal {
  id: number
  codigo: string
  nombre?: string
  especie: Especie
  raza?: string
  sexo: Sexo
  color?: string
  numeroArete?: string
  fechaNac?: string
  peso?: number
  estado: EstadoAnimal
  observaciones?: string
  potreroId?: number
  potrero?: { nombre: string }
  padreId?: number
  madreId?: number
  padre?: { id: number; codigo: string; nombre?: string }
  madre?: { id: number; codigo: string; nombre?: string }
  creadoEn: string
  actualizadoEn: string
  usuario?: { nombre: string }
  registros?: RegistroSalud[]
  producciones?: Produccion[]
  vacunaciones?: Vacunacion[]
  eventosReproductivos?: EventoReproductivo[]
  pesajes?: PesajeHistorial[]
}

export interface PesajeHistorial {
  id: number
  animalId: number
  animal?: { codigo: string; nombre?: string }
  peso: number
  fecha: string
  observaciones?: string
}

export interface RegistroSalud {
  id: number
  animalId: number
  tipo: string
  descripcion: string
  fecha: string
  veterinario?: string
  costo?: number
  animal?: { codigo: string; nombre?: string }
}

export interface Vacunacion {
  id: number
  animalId: number
  vacuna: string
  dosis?: string
  lote?: string
  fecha: string
  proximaDosis?: string
  veterinario?: string
  costo?: number
  observaciones?: string
  animal?: { codigo: string; nombre?: string; especie?: Especie }
}

export interface EventoReproductivo {
  id: number
  animalId: number
  tipo: TipoEvento
  fecha: string
  observaciones?: string
  resultado?: string
  padreId?: number
  costo?: number
  animal?: { codigo: string; nombre?: string; especie?: Especie; sexo?: Sexo }
}

export interface Produccion {
  id: number
  animalId: number
  tipo: string
  cantidad: number
  unidad: string
  fecha: string
  animal?: { codigo: string; nombre?: string }
}

export interface Tarea {
  id: number
  titulo: string
  descripcion?: string
  fecha: string
  fechaVencimiento?: string
  estado: EstadoTarea
  prioridad: Prioridad
  asignadoA?: string
  animalId?: number
  animal?: { codigo: string; nombre?: string; especie?: Especie }
  usuarioId?: number
  usuario?: { nombre: string }
  creadoEn: string
}

export interface DashboardData {
  resumen: {
    totalAnimales: number
    animalesActivos: number
    animalesInactivos: number
    tareasPendientes: number
    proximasVacunas: number
    partosMes: number
    totalPotreros: number
  }
  porEspecie: { especie: Especie; _count: { id: number } }[]
  porEstado: { estado: EstadoAnimal; _count: { id: number } }[]
  ultimosAnimales: Pick<Animal, 'id' | 'codigo' | 'nombre' | 'especie' | 'estado' | 'creadoEn'>[]
  ultimosRegistrosSalud: RegistroSalud[]
  produccionReciente: Produccion[]
}

export interface PaginatedAnimales {
  animales: Animal[]
  total: number
  page: number
  totalPages: number
}

export interface PaginatedVacunaciones {
  vacunaciones: Vacunacion[]
  total: number
  page: number
  totalPages: number
}

export interface PaginatedEventos {
  eventos: EventoReproductivo[]
  total: number
  page: number
  totalPages: number
}

export interface PaginatedTareas {
  tareas: Tarea[]
  total: number
  page: number
  totalPages: number
}
