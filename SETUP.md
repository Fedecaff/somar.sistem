# Guía de Configuración Inicial

## ✅ Fase 1 Completada - Configuración del Proyecto

### Archivos Creados

1. **package.json** - Dependencias del proyecto
2. **.gitignore** - Archivos a ignorar en Git
3. **README.md** - Documentación del proyecto
4. **database/schema.sql** - Script completo de creación de BD
5. **src/server.js** - Servidor Express básico
6. **src/config/database.js** - Configuración de conexión a PostgreSQL
7. **src/config/config.js** - Configuración general

### Estructura del Proyecto

```
Sabores de mi Tierra/
├── database/
│   └── schema.sql          # Script SQL completo
├── src/
│   ├── config/             # Configuraciones
│   │   ├── database.js
│   │   └── config.js
│   ├── controllers/        # (Por crear)
│   ├── models/            # (Por crear)
│   ├── routes/            # (Por crear)
│   ├── services/          # (Por crear)
│   ├── middleware/        # (Por crear)
│   ├── utils/             # (Por crear)
│   └── server.js           # Servidor principal
├── .env                    # (Crear desde .env.example)
├── .gitignore
├── package.json
└── README.md
```

## Próximos Pasos

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

#### Opción A: PostgreSQL Local (Recomendado para Desarrollo)

**Instalación:**
1. Descargar e instalar PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Durante la instalación, recordar la contraseña del usuario `postgres`
3. Verificar que el servicio esté corriendo (Services > postgresql-x64)

**Crear Base de Datos:**
1. Abrir pgAdmin o usar psql desde la línea de comandos
2. Conectarse al servidor PostgreSQL
3. Crear la base de datos:
```sql
CREATE DATABASE rotiseria_db;
```

**Ejecutar Script SQL:**
- **Opción 1: Desde pgAdmin**
  1. Click derecho en `rotiseria_db` > Query Tool
  2. Abrir el archivo `database/schema.sql`
  3. Ejecutar (F5)

- **Opción 2: Desde línea de comandos**
```bash
psql -U postgres -d rotiseria_db -f database/schema.sql
```

- **Opción 3: Desde PowerShell (si psql está en PATH)**
```powershell
psql -U postgres -d rotiseria_db -f database\schema.sql
```

#### Opción B: Supabase (Para Producción)

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a "SQL Editor"
4. Copiar y pegar el contenido de `database/schema.sql`
5. Ejecutar el script
6. Ir a "Settings" > "Database" y copiar las credenciales
7. **Nota:** Si tienes problemas con IPv6, considera usar un servicio alternativo o habilitar IPv6 en Windows

### 3. Configurar Variables de Entorno

1. Crear archivo `.env` (copiar de `.env.example`):
```bash
cp .env.example .env
```

2. Editar `.env` con tus credenciales:

**Para PostgreSQL Local (Desarrollo):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rotiseria_db
DB_USER=postgres
DB_PASSWORD=tu-password-postgres-local
DB_SSL=false

JWT_SECRET=tu-secret-key-muy-segura-cambiar-en-produccion
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development

CORS_ORIGIN=http://localhost:3000
```

**Para Supabase (Producción):**
```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password
DB_SSL=true
# O usar connection string:
# DB_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

JWT_SECRET=tu-secret-key-muy-segura-cambiar-en-produccion
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=production

CORS_ORIGIN=https://tu-dominio.com
```

### 4. Probar la Conexión

```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
📝 Ambiente: development
✅ Conectado a la base de datos PostgreSQL
```

### 5. Probar Endpoint de Health

Abrir en el navegador o Postman:
```
GET http://localhost:3000/health
```

Debería responder:
```json
{
  "status": "OK",
  "message": "Servidor funcionando correctamente",
  "database": "Conectado",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Verificación

- [ ] Dependencias instaladas (`npm install`)
- [ ] Base de datos creada (Supabase o local)
- [ ] Script SQL ejecutado correctamente
- [ ] Archivo `.env` configurado
- [ ] Servidor inicia sin errores
- [ ] Endpoint `/health` responde correctamente

## Siguiente Fase

Una vez completada la verificación, continuar con:
- **Fase 2**: Backend - Estructura Base (Autenticación)

## Notas

- El script SQL crea todas las tablas, índices, funciones y triggers
- No hay datos iniciales (se crearán con el sistema)
- El usuario admin se puede crear después desde la API
- Todas las funciones de PostgreSQL están incluidas

