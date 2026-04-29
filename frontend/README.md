# Frontend - Sabores de mi Tierra

Frontend desarrollado con React + Vite para el sistema de gestión de rotisería.

## 🚀 Inicio Rápido

### Instalación

```bash
cd frontend
npm install
```

### Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Layout.jsx   # Layout principal con sidebar
│   │   └── PrivateRoute.jsx  # Protección de rutas
│   ├── context/         # Context API para estado global
│   │   └── AuthContext.jsx    # Contexto de autenticación
│   ├── pages/           # Páginas principales
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Productos.jsx
│   │   ├── Categorias.jsx
│   │   ├── Ventas.jsx
│   │   ├── Clientes.jsx
│   │   └── Reportes.jsx
│   ├── services/        # Servicios API
│   │   ├── api.js       # Configuración de Axios
│   │   ├── authService.js
│   │   ├── productoService.js
│   │   ├── categoriaService.js
│   │   ├── ventaService.js
│   │   ├── clienteService.js
│   │   └── reporteService.js
│   ├── App.jsx          # Componente principal
│   └── main.jsx         # Punto de entrada
├── package.json
└── vite.config.js
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del frontend (opcional):

```env
VITE_API_URL=http://localhost:3000/api
```

Si no se define, por defecto usará `http://localhost:3000/api`

### Proxy de Desarrollo

El archivo `vite.config.js` está configurado para hacer proxy de las peticiones `/api` al backend en `http://localhost:3000`

## 🎨 Características

- ✅ Autenticación con JWT
- ✅ Protección de rutas privadas
- ✅ Dashboard con estadísticas
- ✅ CRUD completo de Productos, Categorías, Clientes
- ✅ Gestión de Ventas
- ✅ Reportes básicos
- ✅ Diseño responsive y moderno

## 📝 Próximas Mejoras

- [ ] Mejoras en la UI/UX
- [ ] Filtros y búsqueda avanzada
- [ ] Paginación en tablas
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Gráficos en Dashboard
- [ ] Notificaciones en tiempo real
- [ ] Gestión de Planes de Vianda
- [ ] Gestión de Promociones

## 🔗 Backend

Asegúrate de que el backend esté corriendo en `http://localhost:3000` antes de iniciar el frontend.

