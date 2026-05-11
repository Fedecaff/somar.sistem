# Documentación de la API

## Base URL
```
http://localhost:3000/api
```

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT (JSON Web Token).

### Obtener Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Usar Token
Incluir el token en el header `Authorization`:
```
Authorization: Bearer <tu-token>
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)
  - Campos de stock simple: `tiene_control_stock`, `cantidad_disponible`, `cantidad_minima`

### Categorías
- `GET /api/categorias` - Listar categorías
- `GET /api/categorias/:id` - Obtener categoría
- `POST /api/categorias` - Crear categoría (admin)
- `PUT /api/categorias/:id` - Actualizar categoría (admin)
- `DELETE /api/categorias/:id` - Eliminar categoría (admin)

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Ventas
- `POST /api/ventas` - Crear venta
- `GET /api/ventas` - Listar ventas
- `GET /api/ventas/hoy` - Ventas del día
- `GET /api/ventas/:id` - Obtener venta

### Promociones
- `GET /api/promociones` - Listar promociones
- `POST /api/promociones` - Crear promoción (admin)
- `GET /api/promociones/calcular-precio?producto_id=1&cantidad=3` - Calcular precio con promoción

### Reportes
- `GET /api/reportes/ventas/diarias?fecha=2025-01-27` - Ventas del día
- `GET /api/reportes/ventas/periodo?fecha_inicio=2025-01-01&fecha_fin=2025-01-31` - Ventas por período
- `GET /api/reportes/vianda/planes-activos` - Planes activos

## Documentación Interactiva

Para ver la documentación completa e interactiva con Swagger UI, accede a:
```
http://localhost:3000/api-docs
```

(Disponible solo en modo desarrollo)

## Códigos de Estado HTTP

- `200` - Éxito
- `201` - Creado
- `400` - Error de validación
- `401` - No autenticado
- `403` - No autorizado
- `404` - No encontrado
- `409` - Conflicto (duplicado)
- `500` - Error interno del servidor

## Formato de Respuesta

### Éxito
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Mensaje de error",
  "error": "ERROR_CODE"
}
```

