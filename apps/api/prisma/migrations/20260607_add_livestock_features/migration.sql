-- Migration: Add livestock management features
-- Adds: Potrero, PesajeHistorial, Vacunacion, EventoReproductivo, Tarea
-- Updates: Animal with new fields (color, numeroArete, potreroId, padreId, madreId)
-- Updates: Enums (TipoEvento, EstadoTarea, Prioridad)

-- New Enums
ALTER TABLE animales ADD COLUMN IF NOT EXISTS color VARCHAR(191);
ALTER TABLE animales ADD COLUMN IF NOT EXISTS numeroArete VARCHAR(191);
ALTER TABLE animales ADD COLUMN IF NOT EXISTS potreroId INT;
ALTER TABLE animales ADD COLUMN IF NOT EXISTS padreId INT;
ALTER TABLE animales ADD COLUMN IF NOT EXISTS madreId INT;

-- Potrero table
CREATE TABLE IF NOT EXISTS potreros (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(191) NOT NULL,
  area DOUBLE,
  capacidad INT,
  descripcion VARCHAR(191),
  activo BOOLEAN NOT NULL DEFAULT true,
  creadoEn DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- PesajeHistorial table
CREATE TABLE IF NOT EXISTS pesajes_historial (
  id INT NOT NULL AUTO_INCREMENT,
  animalId INT NOT NULL,
  peso DOUBLE NOT NULL,
  fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  observaciones VARCHAR(191),
  creadoEn DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  FOREIGN KEY (animalId) REFERENCES animales(id) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Vacunacion table
CREATE TABLE IF NOT EXISTS vacunaciones (
  id INT NOT NULL AUTO_INCREMENT,
  animalId INT NOT NULL,
  vacuna VARCHAR(191) NOT NULL,
  dosis VARCHAR(191),
  lote VARCHAR(191),
  fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  proximaFecha DATETIME(3),
  veterinario VARCHAR(191),
  costo DOUBLE,
  creadoEn DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  FOREIGN KEY (animalId) REFERENCES animales(id) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- EventoReproductivo table
CREATE TABLE IF NOT EXISTS eventos_reproductivos (
  id INT NOT NULL AUTO_INCREMENT,
  animalId INT NOT NULL,
  tipo ENUM('CELO','MONTA','INSEMINACION','PRENEZ_CONFIRMADA','PARTO','ABORTO','DESTETE') NOT NULL,
  fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  descripcion VARCHAR(191),
  resultado VARCHAR(191),
  padreId INT,
  creadoEn DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  FOREIGN KEY (animalId) REFERENCES animales(id) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tarea table
CREATE TABLE IF NOT EXISTS tareas (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(191) NOT NULL,
  descripcion VARCHAR(191),
  fecha DATETIME(3) NOT NULL,
  estado ENUM('PENDIENTE','EN_PROGRESO','COMPLETADA','CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
  prioridad ENUM('ALTA','MEDIA','BAJA') NOT NULL DEFAULT 'MEDIA',
  animalId INT,
  usuarioId INT,
  creadoEn DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  FOREIGN KEY (animalId) REFERENCES animales(id) ON DELETE SET NULL,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add FK for potreroId in animales
ALTER TABLE animales ADD CONSTRAINT animales_potreroId_fkey FOREIGN KEY (potreroId) REFERENCES potreros(id) ON DELETE SET NULL;
