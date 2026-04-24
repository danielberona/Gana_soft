-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'EMPLEADO') NOT NULL DEFAULT 'EMPLEADO',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `animales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NULL,
    `especie` ENUM('BOVINO', 'PORCINO', 'OVINO', 'CAPRINO', 'EQUINO', 'AVICOLA', 'OTRO') NOT NULL,
    `raza` VARCHAR(191) NULL,
    `sexo` ENUM('MACHO', 'HEMBRA') NOT NULL,
    `fechaNac` DATETIME(3) NULL,
    `peso` DOUBLE NULL,
    `estado` ENUM('ACTIVO', 'VENDIDO', 'MUERTO', 'TRANSFERIDO') NOT NULL DEFAULT 'ACTIVO',
    `observaciones` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` INTEGER NULL,

    UNIQUE INDEX `animales_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registros_salud` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animalId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `veterinario` VARCHAR(191) NULL,
    `costo` DOUBLE NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animalId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `animales` ADD CONSTRAINT `animales_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registros_salud` ADD CONSTRAINT `registros_salud_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `animales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producciones` ADD CONSTRAINT `producciones_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `animales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
