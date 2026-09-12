# Sistema de Gestión Mayorista

Sistema web MVP para gestión de almacén mayorista de frutas y verduras en Argentina.

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js (credentials provider con bcrypt)
- **Deploy**: Vercel-ready

## 📋 Funcionalidades

### Para Administradores (`/admin`)
- Dashboard con métricas clave
- Gestión de productos (CRUD completo)
- Registro de ingresos de stock
- Gestión de clientes (CRUD completo)
- Gestión de pedidos:
  - Crear pedidos con múltiples productos
  - Asignar pedidos a armadores
  - Cambiar estado de pedidos
  - Ver detalles completos

### Para Armadores/Pickers (`/picker`)
- Vista móvil optimizada con tap targets grandes
- Lista de pedidos asignados
- Detalle de pedido con checklist de productos
- Actualización de cantidades armadas
- Marcar pedidos como listos

## 🗄️ Modelo de Datos

- **User**: admin | picker
- **Product**: nombre, unidad (kg/cajón/unidad), activo
- **StockLot**: registro de ingresos de stock con fecha y cantidad
- **Customer**: clientes con teléfono y notas
- **Order**: pedidos con estado (pending/assigned/picking/ready/delivered/cancelled)
- **OrderItem**: items del pedido con cantidades solicitadas y armadas

### Regla de stock (MVP simplificado)
Stock disponible ≈ suma(StockLot.quantity) − suma(OrderItem.quantityPicked para pedidos no cancelados)

> **Nota**: Esta es una implementación MVP. Para producción se recomienda implementar un sistema más robusto de tracking de inventario con reservas y actualizaciones en tiempo real.

## 🛠️ Instalación y Configuración

### Requisitos previos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/Fedecaff/somar.sistem.git
cd somar.sistem
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y configurar:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/mayorista_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secreto-seguro-con-openssl-rand-base64-32"
```

Para generar un `NEXTAUTH_SECRET` seguro:

```bash
openssl rand -base64 32
```

### 4. Crear la base de datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE mayorista_db;

# Salir de psql
\q
```

### 5. Ejecutar migraciones de Prisma

```bash
npm run prisma:migrate
```

### 6. Cargar datos de prueba (seed)

```bash
npm run prisma:seed
```

Esto creará:
- 1 administrador
- 2 armadores (pickers)
- 8 productos (frutas y verduras)
- Stock inicial para todos los productos
- 3 clientes
- 2 pedidos de ejemplo

### 7. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 👥 Usuarios de Prueba

### Administrador
- **Email**: admin@mayorista.com
- **Contraseña**: admin123

### Armadores
- **Email**: juan@mayorista.com | **Contraseña**: picker123
- **Email**: maria@mayorista.com | **Contraseña**: picker123

> ⚠️ **IMPORTANTE**: Estas contraseñas son solo para desarrollo local. En producción, cambiar todas las contraseñas y usar credenciales seguras.

## 📦 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia el servidor de desarrollo

# Build
npm run build            # Compila la aplicación para producción
npm run start            # Inicia la aplicación en modo producción

# Base de datos
npm run prisma:migrate   # Ejecuta las migraciones
npm run prisma:seed      # Carga datos de prueba
npx prisma studio        # Abre Prisma Studio (GUI para la DB)

# Otros
npm run lint             # Ejecuta el linter
```

## 🚀 Deploy en Vercel

1. Push el código a GitHub
2. Conectar el repositorio en [Vercel](https://vercel.com)
3. Configurar las variables de entorno en Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (URL de producción)
   - `NEXTAUTH_SECRET`
4. Vercel detectará automáticamente Next.js y lo desplegará

### Base de datos en producción
Se recomienda usar servicios como:
- [Neon](https://neon.tech) (PostgreSQL serverless)
- [Supabase](https://supabase.com) (PostgreSQL managed)
- [Railway](https://railway.app) (PostgreSQL managed)

## 📱 Uso de la Aplicación

### Flujo típico:

1. **Admin** crea productos y registra stock entrante
2. **Admin** crea clientes
3. **Admin** crea un pedido para un cliente con varios productos
4. **Admin** asigna el pedido a un armador (picker)
5. **Picker** ve el pedido en su lista (`/picker`)
6. **Picker** abre el pedido y comienza a armarlo
7. **Picker** actualiza las cantidades armadas de cada producto
8. **Picker** marca el pedido como "Listo"
9. **Admin** puede cambiar el estado a "Entregado" cuando corresponda

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Autenticación con NextAuth.js (JWT)
- Rutas protegidas por rol (admin/picker)
- Validación en servidor para todas las operaciones críticas

## 🎯 Fuera de Alcance (MVP)

Esta versión MVP **NO incluye**:
- ❌ Integración con WhatsApp
- ❌ Sistema de pagos
- ❌ Multi-almacén / Multi-sucursal
- ❌ Reportes avanzados
- ❌ Gestión de proveedores
- ❌ Sistema de precios
- ❌ Facturas / Comprobantes

Estas funcionalidades pueden agregarse en iteraciones futuras.

## 📝 Estructura del Proyecto

```
/
├── prisma/
│   ├── schema.prisma      # Esquema de la base de datos
│   └── seed.ts            # Script de datos de prueba
├── src/
│   ├── app/
│   │   ├── admin/         # Páginas del panel administrativo
│   │   ├── picker/        # Páginas de armadores
│   │   ├── api/           # API routes
│   │   └── login/         # Página de login
│   ├── components/        # Componentes reutilizables
│   ├── lib/               # Utilidades (Prisma, auth helpers)
│   └── types/             # Definiciones de tipos TypeScript
├── .env.example           # Ejemplo de variables de entorno
└── package.json
```

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `DATABASE_URL`
- Verificar que la base de datos exista

### Error de autenticación
- Verificar que `NEXTAUTH_SECRET` esté configurado
- Verificar que `NEXTAUTH_URL` coincida con la URL actual
- Limpiar cookies del navegador

### Error en build
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📄 Licencia

Este proyecto es un MVP de demostración.

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

---

Desarrollado con ❤️ para mayoristas de frutas y verduras en Argentina
