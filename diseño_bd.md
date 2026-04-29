# Diseño de Base de Datos - Sistema Rotisería

## Diagrama Entidad-Relación

### Entidades Principales

1. **usuarios** - Usuarios del sistema (Admin, Cajera)
2. **clientes** - Clientes (con y sin vianda)
3. **categorias** - Categorías de productos (Pollo, Ensaladas, Guarniciones, etc.)
4. **productos** - Platos/comidas disponibles
5. **historial_precios** - Historial de cambios de precios de productos
6. **promociones** - Promociones y combos
7. **planes_vianda** - Planes mensuales de vianda
8. **pagos_vianda** - Pagos de planes de vianda
9. **ventas** - Registro de ventas (mostrador y vianda)
10. **detalle_ventas** - Detalle de productos en cada venta
11. **tickets_venta** - Tickets de venta con numeración consecutiva (separada por tipo y día)
12. **tickets_cocina** - Tickets para cocina (comparten número con tickets_venta)
13. **retiros_vianda** - Registro de retiros de viandas por día

---

## Esquema de Tablas

### 1. usuarios
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'cajera')),
    nombre_completo VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. clientes
```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    tiene_vianda BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. categorias
```sql
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. productos
```sql
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    precio DECIMAL(10, 2) NOT NULL, -- Precio para venta de mostrador
    es_menu_fijo BOOLEAN DEFAULT FALSE,
    solo_mostrador BOOLEAN DEFAULT FALSE, -- TRUE para productos como gaseosas que solo se venden en mostrador
    imagen_url VARCHAR(255), -- Ruta/URL de la imagen del producto
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. historial_precios
```sql
CREATE TABLE historial_precios (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    precio_anterior DECIMAL(10, 2) NOT NULL,
    precio_nuevo DECIMAL(10, 2) NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id), -- Quién hizo el cambio
    motivo TEXT -- Opcional: razón del cambio de precio
);
```

### 6. promociones
```sql
CREATE TABLE promociones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_minima INTEGER NOT NULL, -- Cantidad mínima para aplicar la promoción
    precio_unitario_promo DECIMAL(10, 2), -- Precio unitario con promoción
    precio_total_promo DECIMAL(10, 2), -- Precio total del combo (ej: 3 guisos = 17000)
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. planes_vianda
```sql
CREATE TABLE planes_vianda (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    precio_mensual DECIMAL(10, 2) NOT NULL,
    dias_semana INTEGER[] NOT NULL, -- Array de días: [1,2,3,4,5] = lunes a viernes
    viandas_incluidas INTEGER NOT NULL, -- Cantidad de viandas del plan
    viandas_adicionales INTEGER DEFAULT 0, -- Viandas extra compradas
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'vencido', 'cancelado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. pagos_vianda
```sql
CREATE TABLE pagos_vianda (
    id SERIAL PRIMARY KEY,
    plan_vianda_id INTEGER NOT NULL REFERENCES planes_vianda(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    medio_pago VARCHAR(20) NOT NULL CHECK (medio_pago IN ('efectivo', 'transferencia')),
    fecha_pago DATE NOT NULL,
    pagado_por_adelantado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. ventas
```sql
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo_venta VARCHAR(20) NOT NULL CHECK (tipo_venta IN ('mostrador', 'vianda')),
    plan_vianda_id INTEGER REFERENCES planes_vianda(id) ON DELETE SET NULL, -- NULL si es mostrador
    medio_pago VARCHAR(20) NOT NULL CHECK (medio_pago IN ('efectivo', 'transferencia')),
    total DECIMAL(10, 2) NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);
```

### 10. detalle_ventas
```sql
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11. tickets_venta
```sql
CREATE TABLE tickets_venta (
    id SERIAL PRIMARY KEY,
    numero_ticket INTEGER NOT NULL, -- Numeración consecutiva (se reinicia por día y tipo)
    tipo_venta VARCHAR(20) NOT NULL CHECK (tipo_venta IN ('mostrador', 'vianda')),
    fecha_ticket DATE NOT NULL, -- Para controlar reinicio diario
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100),
    total DECIMAL(10, 2) NOT NULL,
    medio_pago VARCHAR(20) NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    impreso BOOLEAN DEFAULT FALSE,
    UNIQUE(numero_ticket, tipo_venta, fecha_ticket) -- Garantiza unicidad por tipo y día
);
```

### 12. tickets_cocina
```sql
CREATE TABLE tickets_cocina (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    numero_ticket INTEGER NOT NULL, -- Comparte número con tickets_venta
    tipo_venta VARCHAR(20) NOT NULL CHECK (tipo_venta IN ('mostrador', 'vianda')),
    fecha_ticket DATE NOT NULL, -- Misma fecha que tickets_venta
    cliente_nombre VARCHAR(100),
    descripcion_pedido TEXT NOT NULL, -- Descripción completa del pedido
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    impreso BOOLEAN DEFAULT FALSE,
    preparado BOOLEAN DEFAULT FALSE
);
```

### 13. retiros_vianda
```sql
CREATE TABLE retiros_vianda (
    id SERIAL PRIMARY KEY,
    plan_vianda_id INTEGER NOT NULL REFERENCES planes_vianda(id) ON DELETE CASCADE,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE SET NULL,
    fecha_retiro DATE NOT NULL,
    retirado BOOLEAN DEFAULT FALSE,
    producto_solicitado_id INTEGER REFERENCES productos(id), -- Qué pidió el cliente por WhatsApp
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- NOTA: Se eliminó UNIQUE(plan_vianda_id, fecha_retiro) para permitir múltiples retiros por día
    -- La validación del límite se hace mediante función/trigger
);
```

---

## Índices Recomendados

```sql
-- Índices para mejorar rendimiento
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_tipo ON ventas(tipo_venta);
CREATE INDEX idx_detalle_ventas_venta ON detalle_ventas(venta_id);
CREATE INDEX idx_planes_vianda_cliente ON planes_vianda(cliente_id);
CREATE INDEX idx_planes_vianda_estado ON planes_vianda(estado);
CREATE INDEX idx_retiros_vianda_fecha ON retiros_vianda(fecha_retiro);
CREATE INDEX idx_retiros_vianda_plan ON retiros_vianda(plan_vianda_id);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_promociones_fechas ON promociones(fecha_inicio, fecha_fin);
CREATE INDEX idx_promociones_activa ON promociones(activa);
CREATE INDEX idx_historial_precios_producto ON historial_precios(producto_id);
CREATE INDEX idx_historial_precios_fecha ON historial_precios(fecha_cambio);
CREATE INDEX idx_tickets_venta_fecha_tipo ON tickets_venta(fecha_ticket, tipo_venta);
CREATE INDEX idx_tickets_cocina_fecha_tipo ON tickets_cocina(fecha_ticket, tipo_venta);
```

---

## Relaciones Principales

1. **usuarios** → **ventas** (1:N) - Un usuario puede hacer muchas ventas
2. **usuarios** → **historial_precios** (1:N) - Un usuario puede cambiar precios
3. **clientes** → **ventas** (1:N) - Un cliente puede tener muchas ventas
4. **clientes** → **planes_vianda** (1:N) - Un cliente puede tener múltiples planes activos
5. **categorias** → **productos** (1:N) - Una categoría tiene muchos productos
6. **productos** → **historial_precios** (1:N) - Un producto tiene historial de precios
7. **productos** → **promociones** (1:N) - Un producto puede tener varias promociones
8. **planes_vianda** → **pagos_vianda** (1:N) - Un plan puede tener varios pagos
9. **planes_vianda** → **ventas** (1:N) - Un plan puede generar varias ventas
10. **ventas** → **detalle_ventas** (1:N) - Una venta tiene varios productos
11. **ventas** → **tickets_venta** (1:1) - Una venta genera un ticket
12. **ventas** → **tickets_cocina** (1:1) - Una venta genera un ticket de cocina
13. **planes_vianda** → **retiros_vianda** (1:N) - Un plan tiene varios registros de retiro

---

## Consideraciones de Escalabilidad

### Para Futura Integración WhatsApp
```sql
-- Tabla preparada para futuro (no se crea aún)
-- CREATE TABLE mensajes_whatsapp (
--     id SERIAL PRIMARY KEY,
--     cliente_id INTEGER REFERENCES clientes(id),
--     numero_telefono VARCHAR(20),
--     mensaje_recibido TEXT,
--     pedido_procesado BOOLEAN DEFAULT FALSE,
--     venta_id INTEGER REFERENCES ventas(id),
--     fecha_mensaje TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
```

---

## Funciones Útiles (PostgreSQL)

### Función para obtener siguiente número de ticket (por tipo y día)
```sql
CREATE OR REPLACE FUNCTION obtener_siguiente_numero_ticket(
    p_tipo_venta VARCHAR(20),
    p_fecha DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER AS $$
DECLARE
    siguiente_numero INTEGER;
BEGIN
    SELECT COALESCE(MAX(numero_ticket), 0) + 1
    INTO siguiente_numero
    FROM tickets_venta
    WHERE tipo_venta = p_tipo_venta
      AND fecha_ticket = p_fecha;
    RETURN siguiente_numero;
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers Útiles

### Trigger para registrar cambios de precio automáticamente
```sql
CREATE OR REPLACE FUNCTION registrar_cambio_precio()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.precio != NEW.precio THEN
        INSERT INTO historial_precios (
            producto_id,
            precio_anterior,
            precio_nuevo,
            usuario_id
        ) VALUES (
            NEW.id,
            OLD.precio,
            NEW.precio,
            CURRENT_USER -- O usar un campo de sesión si manejas usuario_id en sesión
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cambio_precio
    AFTER UPDATE OF precio ON productos
    FOR EACH ROW
    WHEN (OLD.precio IS DISTINCT FROM NEW.precio)
    EXECUTE FUNCTION registrar_cambio_precio();
```

### Función para validar límite de retiros de vianda por día
```sql
CREATE OR REPLACE FUNCTION validar_limite_retiros_vianda()
RETURNS TRIGGER AS $$
DECLARE
    viandas_permitidas INTEGER;
    retiros_hoy INTEGER;
BEGIN
    -- Obtener cantidad de viandas permitidas del plan
    SELECT pv.viandas_incluidas + pv.viandas_adicionales
    INTO viandas_permitidas
    FROM planes_vianda pv
    WHERE pv.id = NEW.plan_vianda_id
      AND pv.estado = 'activo';
    
    -- Contar retiros ya realizados del día (sin contar el que se está insertando)
    SELECT COUNT(*)
    INTO retiros_hoy
    FROM retiros_vianda
    WHERE plan_vianda_id = NEW.plan_vianda_id
      AND fecha_retiro = NEW.fecha_retiro
      AND retirado = TRUE
      AND id != COALESCE(NEW.id, 0); -- Excluir el registro actual si es UPDATE
    
    -- Validar que no se exceda el límite (sumando el retiro que se está por insertar)
    IF (retiros_hoy + 1) > viandas_permitidas THEN
        RAISE EXCEPTION 'Límite de viandas excedido para este plan. Máximo permitido: % viandas por día. Ya retiradas hoy: %', viandas_permitidas, retiros_hoy;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_limite_retiros
    BEFORE INSERT OR UPDATE ON retiros_vianda
    FOR EACH ROW
    WHEN (NEW.retirado = TRUE)
    EXECUTE FUNCTION validar_limite_retiros_vianda();
```

### Función para consultar retiros disponibles del día
```sql
CREATE OR REPLACE FUNCTION consultar_retiros_disponibles(
    p_plan_vianda_id INTEGER,
    p_fecha DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    viandas_permitidas INTEGER,
    retiros_realizados INTEGER,
    retiros_disponibles INTEGER
) AS $$
DECLARE
    v_permitidas INTEGER;
    v_realizados INTEGER;
BEGIN
    -- Obtener viandas permitidas del plan
    SELECT COALESCE(viandas_incluidas, 0) + COALESCE(viandas_adicionales, 0)
    INTO v_permitidas
    FROM planes_vianda
    WHERE id = p_plan_vianda_id
      AND estado = 'activo';
    
    -- Contar retiros realizados en la fecha
    SELECT COUNT(*)
    INTO v_realizados
    FROM retiros_vianda
    WHERE plan_vianda_id = p_plan_vianda_id
      AND fecha_retiro = p_fecha
      AND retirado = TRUE;
    
    RETURN QUERY SELECT 
        v_permitidas,
        v_realizados,
        GREATEST(0, v_permitidas - v_realizados);
END;
$$ LANGUAGE plpgsql;
```

---

## Notas Importantes

### Numeración de Tickets
- Los tickets tienen numeración **separada** para `mostrador` y `vianda`
- La numeración se **reinicia cada día** automáticamente
- El mismo número se comparte entre `tickets_venta` y `tickets_cocina` para la misma venta
- Ejemplo:
  - Día 1: Mostrador 1, 2, 3... | Vianda 1, 2, 3...
  - Día 2: Mostrador 1, 2, 3... | Vianda 1, 2, 3... (reinicia)

### Historial de Precios
- Se registra automáticamente cada vez que cambia el precio de un producto
- Permite consultar el historial completo de cambios
- Incluye quién hizo el cambio (si se implementa en la sesión)

### Planes de Vianda
- Un cliente puede tener **múltiples planes activos** simultáneamente
- Cada plan tiene sus propios días de semana configurados
- Los retiros se registran por plan y fecha

### Retiros de Vianda
- **Múltiples retiros por día permitidos** hasta el límite del plan
- Ejemplo: Si un cliente paga 3 viandas mensuales (para él, esposa e hija), puede retirar hasta 3 viandas por día
- Si otro cliente paga solo 1 vianda, solo puede retirar 1 por día
- **Validación automática**: El trigger `validar_limite_retiros_vianda` previene exceder el límite
- Cada retiro individual es un registro en `retiros_vianda`
- La función `consultar_retiros_disponibles` permite ver cuántas viandas quedan disponibles para retirar en un día

### Clientes con Vianda que Compran en Mostrador
- **Un cliente con plan de vianda puede comprar en mostrador** sin restricciones
- Se registran como **ventas separadas**:
  - Una venta con `tipo_venta='vianda'` (si retira su vianda del plan)
  - Una venta con `tipo_venta='mostrador'` (si compra algo adicional)
- Cada venta genera su propio ticket con numeración correspondiente
- Ejemplo: Cliente con vianda viene y retira su vianda (ticket vianda #5) y además compra 2 empanadas (ticket mostrador #12)
- El campo `plan_vianda_id` en ventas es NULL cuando es venta de mostrador, incluso si el cliente tiene plan activo

### Categorías de Productos (Dinámicas)
- **Sistema completamente dinámico**: Admin y cajera pueden crear, editar y eliminar categorías
- Los productos están organizados por categorías (Pollo, Ensaladas, Guarniciones, Bebidas, etc.)
- **Funcionalidades**:
  - ✅ Crear nueva categoría (ej: "Postres", "Bebidas Calientes")
  - ✅ Editar nombre y descripción de categorías existentes
  - ✅ Eliminar/desactivar categorías (soft delete con campo `activo`)
  - ✅ Mover productos entre categorías (cambiar `categoria_id` del producto)
  - ✅ Productos sin categoría (campo `categoria_id` puede ser NULL)
- Facilita la organización y búsqueda de productos
- Un producto pertenece a una categoría (opcional, puede ser NULL)
- **Ejemplo de uso**:
  - Admin crea categoría "Postres"
  - Asigna productos de postres a esa categoría
  - Si ya no venden postres, puede desactivar la categoría (no eliminar, para mantener historial)
  - Los productos pueden moverse a otra categoría o quedar sin categoría

### Productos Solo de Mostrador
- Campo `solo_mostrador=TRUE` para productos como gaseosas
- Estos productos **no se pueden vender como vianda**
- Solo disponibles para ventas de mostrador

### Precios de Vianda vs Mostrador
- **Vianda**: Precio fijo del plan (ej: $150.000 mensual)
  - El cliente puede elegir cualquier producto del menú fijo y del día
  - Solo puede elegir **una comida con su guarnición**
  - El precio no depende del plato elegido
- **Mostrador**: Precio individual por producto
  - Cada producto tiene su precio en la tabla `productos`
  - Se puede aplicar promoción si corresponde

### Promociones
- Sistema de promociones y combos
- Ejemplo: Guiso de arroz $7.000, si llevas 3 = $17.000
- Se configuran con cantidad mínima y precio promocional
- Tienen fechas de inicio y fin
- Se pueden activar/desactivar

### Imágenes de Productos
- Campo `imagen_url` para almacenar ruta/URL de imagen
- Permite mostrar fotos de los platos en el sistema

---

## Resumen de Funcionalidades Cubiertas

### ✅ Control de Pedidos
- Tabla `ventas` registra cada pedido
- Tabla `detalle_ventas` con productos de cada pedido
- Tabla `retiros_vianda` para control de viandas
- Validaciones automáticas de límites

### ✅ Control de Pagos
- Campo `medio_pago` en cada venta (efectivo/transferencia)
- Tabla `pagos_vianda` para pagos por adelantado
- Reportes por medio de pago disponibles

### ✅ Control de Pedidos en Cocina
- Tabla `tickets_cocina` con descripción completa del pedido
- Campo `preparado` para estado del pedido
- Numeración compartida con ticket de venta
- Listo para impresión física

### ✅ Flexibilidad de Ventas
- Clientes con vianda pueden comprar en mostrador (ventas separadas)
- Cada tipo de venta mantiene su numeración independiente
- Un cliente puede tener múltiples ventas en el mismo día (vianda + mostrador)

### ✅ Gestión de Productos
- Categorías de productos (Pollo, Ensaladas, Guarniciones, etc.)
- Menú fijo (disponible todos los días)
- Productos solo de mostrador (gaseosas, etc.)
- Imágenes de productos
- Descripción de cada plato

### ✅ Promociones
- Sistema de promociones y combos
- Configuración por cantidad mínima
- Precios promocionales
- Fechas de vigencia
- Activación/desactivación

### ✅ Precios
- Precios diferentes para vianda (fijo del plan) y mostrador (por producto)
- Historial automático de cambios de precios
- Trazabilidad de quién y cuándo cambió cada precio

