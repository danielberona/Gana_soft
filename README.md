# 🐄 Ganasoft — Sistema de Gestión Ganadera

Monorepo con **Turborepo + pnpm** que incluye:
- `apps/api` — Backend Express + Prisma + MySQL
- `apps/web` — Frontend Next.js 15 + Tailwind v4

---

## Requisitos previos

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose

---

## Instalación

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

El archivo `.env.local` ya incluye valores por defecto para desarrollo:

```env
MYSQL_ROOT_PASSWORD=ganasoft_root_2024
MYSQL_DATABASE=ganasoft
MYSQL_USER=ganasoft_user
MYSQL_PASSWORD=ganasoft_pass_2024
DATABASE_URL=mysql://ganasoft_user:ganasoft_pass_2024@localhost:3306/ganasoft
JWT_SECRET=ganasoft-jwt-secret-change-in-production-2024
JWT_EXPIRES_IN=7d
API_PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> Copia `.env.local` a `apps/api/.env` para que Prisma lo detecte:
```bash
cp .env.local apps/api/.env
```

### 3. Levantar MySQL con Docker

```bash
docker-compose up -d
```

Espera ~10 segundos a que MySQL inicialice.

### 4. Ejecutar migraciones y seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Levantar el proyecto

```bash
pnpm dev
```

Esto levanta:
- API: http://localhost:4000
- Web: http://localhost:3000

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@ganasoft.com | admin123 |
| Empleado | empleado@ganasoft.com | empleado123 |

---

## Comandos útiles

```bash
pnpm dev              # Levantar todo en paralelo
pnpm build            # Build producción
pnpm db:migrate       # Migraciones Prisma
pnpm db:seed          # Cargar datos de prueba
pnpm db:studio        # Abrir Prisma Studio (explorador visual de BD)
```

---

## Estructura del proyecto

```
ganasoft/
├── apps/
│   ├── api/                    # Backend Express + Prisma
│   │   ├── src/
│   │   │   ├── controllers/    # Lógica de negocio
│   │   │   ├── middleware/     # Auth, errores
│   │   │   ├── routes/         # Definición de rutas
│   │   │   └── utils/          # Prisma client, JWT
│   │   └── prisma/
│   │       ├── schema.prisma   # Modelos de BD
│   │       └── seed.ts         # Datos iniciales
│   └── web/                    # Frontend Next.js 15
│       └── src/
│           ├── app/            # App Router
│           │   ├── login/      # Página de login
│           │   └── dashboard/  # Dashboard principal
│           ├── lib/            # API client, Auth context
│           └── types/          # TypeScript types
├── docker/mysql/               # Config Docker
├── docker-compose.yml
├── package.json                # Root workspace
├── pnpm-workspace.yaml
└── turbo.json
```

---

## API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/logout | Cerrar sesión |
| GET | /api/auth/me | Usuario actual |

### Animales
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/animales | Listar (filtros: especie, estado, search, page) |
| GET | /api/animales/:id | Detalle con historial |
| POST | /api/animales | Crear |
| PATCH | /api/animales/:id | Actualizar |
| DELETE | /api/animales/:id | Eliminar (solo ADMIN) |
| GET | /api/animales/estadisticas | Estadísticas agregadas |

### Usuarios (solo ADMIN)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/usuarios | Listar |
| POST | /api/usuarios | Crear |
| PATCH | /api/usuarios/:id | Actualizar |
| DELETE | /api/usuarios/:id | Eliminar |

### Reportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/reportes/dashboard | Resumen general |
| GET | /api/reportes/produccion | Reporte de producción |

### Producción & Salud
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/produccion | Listado producción |
| POST | /api/produccion | Registrar producción |
| GET | /api/produccion/salud | Registros de salud |
| POST | /api/produccion/salud | Crear registro de salud |
