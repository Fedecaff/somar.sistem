# API Rotisería - Sabores de mi Tierra

Sistema de gestión completo para rotisería con control de ventas, viandas y promociones.

## 🚀 Características

- ✅ Autenticación JWT con roles (admin, cajera)
- ✅ Gestión de productos y categorías
- ✅ Menú fijo
- ✅ Sistema de ventas (mostrador y vianda)
- ✅ Gestión de planes de vianda
- ✅ Promociones automáticas
- ✅ Generación de tickets (venta y cocina)
- ✅ Reportes y consultas

## 📋 Requisitos

- Node.js 14+ 
- PostgreSQL 12+ (local o cloud)
- npm o yarn

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

Ver instrucciones detalladas en [SETUP.md](./SETUP.md)

**Resumen rápido para PostgreSQL Local:**
1. Instalar PostgreSQL
2. Crear base de datos: `CREATE DATABASE rotiseria_db;`
3. Ejecutar script: `psql -U postgres -d rotiseria_db -f database/schema.sql`

### 3. Configurar Variables de Entorno

Copiar `.env` y configurar:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rotiseria_db
DB_USER=postgres
DB_PASSWORD=tu-password
DB_SSL=false

JWT_SECRET=tu-secret-key-muy-segura
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development
```

### 4. Crear Usuario Administrador

```bash
node scripts/createAdmin.js
```

Credenciales por defecto:
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANTE:** Cambiar la contraseña después del primer login.

### 5. Iniciar Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación de API

### Documentación Interactiva (Swagger)

Una vez iniciado el servidor, accede a la documentación interactiva:
```
http://localhost:3000/api-docs
```

### Documentación Manual

Ver archivo `docs/API.md` para documentación completa de endpoints.

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Endpoints Principales

- **Productos:** `/api/productos`
- **Categorías:** `/api/categorias`
- **Clientes:** `/api/clientes`
- **Ventas:** `/api/ventas`
- **Planes Vianda:** `/api/planes-vianda`
- **Retiros Vianda:** `/api/retiros-vianda`
- **Pagos Vianda:** `/api/pagos-vianda`
- **Promociones:** `/api/promociones`
- **Reportes:** `/api/reportes`

## 🗂️ Estructura del Proyecto

```
├── database/
│   └── schema.sql          # Script SQL completo
├── scripts/
│   └── createAdmin.js      # Script para crear admin
├── src/
│   ├── config/             # Configuraciones
│   ├── controllers/        # Controladores
│   ├── models/            # Modelos de BD
│   ├── routes/            # Rutas
│   ├── services/          # Lógica de negocio
│   ├── middleware/        # Middlewares
│   ├── utils/             # Utilidades
│   └── server.js           # Servidor principal
├── .env                    # Variables de entorno
└── package.json
```

## 🔐 Roles

- **admin:** Acceso completo al sistema
- **cajera:** Puede realizar ventas y consultas básicas

## 📝 Notas

- El sistema usa soft delete (marca como inactivo, no elimina)
- Los tickets se generan automáticamente al crear ventas
- Las promociones se aplican automáticamente si cumplen condiciones

## 🐛 Troubleshooting

Ver [SETUP.md](./SETUP.md) para problemas comunes de configuración.

## 📖 Documentación Adicional

- **API:** `docs/API.md` - Documentación completa de endpoints
- **Optimizaciones:** `docs/OPTIMIZACIONES.md` - Guía de optimizaciones y performance
- **Setup:** `SETUP.md` - Guía de configuración inicial

## 📄 Licencia

ISC
