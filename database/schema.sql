-- ============================================
-- Script de Creación de Base de Datos
-- Sistema Rotisería - Sabores de mi Tierra
-- ============================================

-- Crear base de datos (ejecutar manualmente si es necesario)
-- CREATE DATABASE rotiseria_db;

-- ============================================
-- TABLAS
-- ============================================

-- 1. usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'cajera')),
    nombre_completo VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    tiene_vianda BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    precio DECIMAL(10, 2) NOT NULL,
    es_menu_fijo BOOLEAN DEFAULT FALSE,
    solo_mostrador BOOLEAN DEFAULT FALSE,
    tiene_control_stock BOOLEAN DEFAULT FALSE,
    cantidad_disponible INTEGER DEFAULT 0,
    cantidad_minima INTEGER DEFAULT 0,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. historial_precios
CREATE TABLE IF NOT EXISTS historial_precios (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    precio_anterior DECIMAL(10, 2) NOT NULL,
    precio_nuevo DECIMAL(10, 2) NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id),
    motivo TEXT
);

-- 6. promociones
CREATE TABLE IF NOT EXISTS promociones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_minima INTEGER NOT NULL,
    precio_unitario_promo DECIMAL(10, 2),
    precio_total_promo DECIMAL(10, 2),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. planes_vianda
CREATE TABLE IF NOT EXISTS planes_vianda (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    precio_mensual DECIMAL(10, 2) NOT NULL,
    dias_semana INTEGER[] NOT NULL,
    viandas_incluidas INTEGER NOT NULL,
    viandas_adicionales INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'vencido', 'cancelado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. pagos_vianda
CREATE TABLE IF NOT EXISTS pagos_vianda (
    id SERIAL PRIMARY KEY,
    plan_vianda_id INTEGER NOT NULL REFERENCES planes_vianda(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    medio_pago VARCHAR(20) NOT NULL CHECK (medio_pago IN ('efectivo', 'transferencia')),
    fecha_pago DATE NOT NULL,
    pagado_por_adelantado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ventas
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo_venta VARCHAR(20) NOT NULL CHECK (tipo_venta IN ('mostrador', 'vianda')),
    plan_vianda_id INTEGER REFERENCES planes_vianda(id) ON DELETE SET NULL,
    medio_pago VARCHAR(20) NOT NULL CHECK (medio_pago IN ('efectivo', 'transferencia')),
    total DECIMAL(10, 2) NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

-- 10. detalle_ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. tickets_venta
CREATE TABLE IF NOT EXISTS tickets_venta (
    id SERIAL PRIMARY KEY,
    numero_ticket INTEGER NOT NULL,
    tipo_venta VARCHAR(20) NOT NULL CHECK (tipo_venta IN ('mostrador', 'vianda')),
    fecha_ticket DATE NOT NULL,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100),
    total DECIMAL(10, 2) NOT NULL,
    medio_pago VARCHAR(20) NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    impreso BOOLEAN DEFAULT FALSE,
    UNIQUE(numero_ticket, tipo_venta, fecha_ticket)
);

-- 12. tickets_cocina
CREATE TABLE IF NOT EXISTS tickets_cocina (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    numero_ticket INTEGER NOT NULL,
    tipo_venta VARCHAR(20) NOT NULL CHECK (tipo_venta IN ('mostrador', 'vianda')),
    fecha_ticket DATE NOT NULL,
    cliente_nombre VARCHAR(100),
    descripcion_pedido TEXT NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    impreso BOOLEAN DEFAULT FALSE,
    preparado BOOLEAN DEFAULT FALSE
);

-- 13. retiros_vianda
CREATE TABLE IF NOT EXISTS retiros_vianda (
    id SERIAL PRIMARY KEY,
    plan_vianda_id INTEGER NOT NULL REFERENCES planes_vianda(id) ON DELETE CASCADE,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE SET NULL,
    fecha_retiro DATE NOT NULL,
    retirado BOOLEAN DEFAULT FALSE,
    producto_solicitado_id INTEGER REFERENCES productos(id),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_tipo ON ventas(tipo_venta);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta ON detalle_ventas(venta_id);
CREATE INDEX IF NOT EXISTS idx_planes_vianda_cliente ON planes_vianda(cliente_id);
CREATE INDEX IF NOT EXISTS idx_planes_vianda_estado ON planes_vianda(estado);
CREATE INDEX IF NOT EXISTS idx_retiros_vianda_fecha ON retiros_vianda(fecha_retiro);
CREATE INDEX IF NOT EXISTS idx_retiros_vianda_plan ON retiros_vianda(plan_vianda_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_promociones_fechas ON promociones(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_promociones_activa ON promociones(activa);
CREATE INDEX IF NOT EXISTS idx_historial_precios_producto ON historial_precios(producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_precios_fecha ON historial_precios(fecha_cambio);
CREATE INDEX IF NOT EXISTS idx_tickets_venta_fecha_tipo ON tickets_venta(fecha_ticket, tipo_venta);
CREATE INDEX IF NOT EXISTS idx_tickets_cocina_fecha_tipo ON tickets_cocina(fecha_ticket, tipo_venta);

-- ============================================
-- FUNCIONES
-- ============================================

-- Función para obtener siguiente número de ticket
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

-- Función para consultar retiros disponibles
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
    SELECT COALESCE(viandas_incluidas, 0) + COALESCE(viandas_adicionales, 0)
    INTO v_permitidas
    FROM planes_vianda
    WHERE id = p_plan_vianda_id
      AND estado = 'activo';
    
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

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_planes_vianda_updated_at ON planes_vianda;
CREATE TRIGGER update_planes_vianda_updated_at
    BEFORE UPDATE ON planes_vianda
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promociones_updated_at ON promociones;
CREATE TRIGGER update_promociones_updated_at
    BEFORE UPDATE ON promociones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar cambios de precio
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
            NULL -- Se puede obtener del contexto de sesión
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cambio_precio ON productos;
CREATE TRIGGER trigger_cambio_precio
    AFTER UPDATE OF precio ON productos
    FOR EACH ROW
    WHEN (OLD.precio IS DISTINCT FROM NEW.precio)
    EXECUTE FUNCTION registrar_cambio_precio();

-- Trigger para validar límite de retiros de vianda
CREATE OR REPLACE FUNCTION validar_limite_retiros_vianda()
RETURNS TRIGGER AS $$
DECLARE
    viandas_permitidas INTEGER;
    retiros_hoy INTEGER;
BEGIN
    SELECT pv.viandas_incluidas + pv.viandas_adicionales
    INTO viandas_permitidas
    FROM planes_vianda pv
    WHERE pv.id = NEW.plan_vianda_id
      AND pv.estado = 'activo';
    
    SELECT COUNT(*)
    INTO retiros_hoy
    FROM retiros_vianda
    WHERE plan_vianda_id = NEW.plan_vianda_id
      AND fecha_retiro = NEW.fecha_retiro
      AND retirado = TRUE
      AND id != COALESCE(NEW.id, 0);
    
    IF (retiros_hoy + 1) > viandas_permitidas THEN
        RAISE EXCEPTION 'Límite de viandas excedido para este plan. Máximo permitido: % viandas por día. Ya retiradas hoy: %', viandas_permitidas, retiros_hoy;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_limite_retiros ON retiros_vianda;
CREATE TRIGGER trigger_validar_limite_retiros
    BEFORE INSERT OR UPDATE ON retiros_vianda
    FOR EACH ROW
    WHEN (NEW.retirado = TRUE)
    EXECUTE FUNCTION validar_limite_retiros_vianda();

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Usuario administrador inicial (password: admin123 - cambiar después)
-- INSERT INTO usuarios (username, password_hash, rol, nombre_completo)
-- VALUES ('admin', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'admin', 'Administrador');

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

