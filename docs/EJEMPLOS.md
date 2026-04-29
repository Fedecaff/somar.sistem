# Ejemplos de Uso de la API

## Autenticación

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "username": "admin",
      "rol": "admin"
    }
  }
}
```

## Productos

### 2. Crear Producto
```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{
    "nombre": "Pollo al Horno",
    "descripcion": "Pollo al horno con papas fritas",
    "categoria_id": 1,
    "precio": 5000,
    "es_menu_fijo": true,
    "solo_mostrador": false
  }'
```

### 3. Listar Productos
```bash
curl -X GET http://localhost:3000/api/productos \
  -H "Authorization: Bearer <tu-token>"
```

## Ventas

### 4. Crear Venta
```bash
curl -X POST http://localhost:3000/api/ventas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{
    "cliente_id": 1,
    "tipo_venta": "mostrador",
    "medio_pago": "efectivo",
    "productos": [
      {
        "producto_id": 1,
        "cantidad": 2
      }
    ],
    "observaciones": "Venta de prueba"
  }'
```

**Respuesta incluye:**
- Venta creada
- Detalles de venta
- Tickets generados (venta y cocina)

## Promociones

### 5. Crear Promoción
```bash
curl -X POST http://localhost:3000/api/promociones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{
    "nombre": "3x2 Guiso de Arroz",
    "descripcion": "Lleva 3 guisos de arroz por $17000",
    "producto_id": 1,
    "cantidad_minima": 3,
    "precio_promocional": 17000,
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-12-31"
  }'
```

### 6. Calcular Precio con Promoción
```bash
curl -X GET "http://localhost:3000/api/promociones/calcular-precio?producto_id=1&cantidad=3" \
  -H "Authorization: Bearer <tu-token>"
```

## Reportes

### 7. Ventas Diarias
```bash
curl -X GET "http://localhost:3000/api/reportes/ventas/diarias?fecha=2025-01-27" \
  -H "Authorization: Bearer <tu-token>"
```

### 8. Planes Activos
```bash
curl -X GET http://localhost:3000/api/reportes/vianda/planes-activos \
  -H "Authorization: Bearer <tu-token>"
```

## Planes de Vianda

### 9. Crear Plan de Vianda
```bash
curl -X POST http://localhost:3000/api/planes-vianda \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{
    "cliente_id": 1,
    "viandas_incluidas": 3,
    "viandas_adicionales": 0,
    "fecha_inicio": "2025-12-27",
    "fecha_fin": "2026-01-31",
    "dias_semana": [1, 2, 3, 4, 5],
    "precio_mensual": 45000
  }'
```

## Notas

- Reemplaza `<tu-token>` con el token obtenido del login
- Todas las fechas deben estar en formato `YYYY-MM-DD`
- Los días de la semana son: 1=Lunes, 2=Martes, ..., 7=Domingo
- Los endpoints que modifican datos requieren rol `admin`

