export type Rol = 'ADMIN' | 'EMPLEADO'
export type Especie = 'BOVINO' | 'PORCINO' | 'OVINO' | 'CAPRINO' | 'EQUINO' | 'AVICOLA' | 'OTRO'
export type Sexo = 'MACHO' | 'HEMBRA'
export type EstadoAnimal = 'ACTIVO' | 'VENDIDO' | 'MUERTO' | 'TRANSFERIDO'
export interface Usuario { id: number; nombre: string; email: string; rol: Rol; activo: boolean; creadoEn: string }
export interface Animal { id: number; codigo: string; nombre?: string; especie: Especie; raza?: string; sexo: Sexo; fechaNac?: string; peso?: number; estado: EstadoAnimal; observaciones?: string; creadoEn: string; actualizadoEn: string; usuario?: { nombre: string } }
export interface RegistroSalud { id: number; animalId: number; tipo: string; descripcion: string; fecha: string; veterinario?: string; costo?: number; animal?: { codigo: string; nombre?: string } }
export interface Produccion { id: number; animalId: number; tipo: string; cantidad: number; unidad: string; fecha: string; animal?: { codigo: string; nombre?: string } }
export interface DashboardData { resumen: { totalAnimales: number; animalesActivos: number; animalesInactivos: number }; porEspecie: { especie: Especie; _count: { id: number } }[]; porEstado: { estado: EstadoAnimal; _count: { id: number } }[]; ultimosAnimales: Pick<Animal, 'id' | 'codigo' | 'nombre' | 'especie' | 'estado' | 'creadoEn'>[]; ultimosRegistrosSalud: RegistroSalud[]; produccionReciente: Produccion[] }
export interface PaginatedAnimales { animales: Animal[]; total: number; page: number; totalPages: number }
