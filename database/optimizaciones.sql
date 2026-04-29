-- ============================================
-- OPTIMIZACIONES ADICIONALES DE ÍNDICES
-- ============================================
-- Estos índices mejoran el rendimiento de consultas frecuentes

-- Índice compuesto para reportes de ventas por fecha y tipo
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_tipo ON ventas(fecha_venta, tipo_venta);

-- Índice compuesto para reportes de ventas por fecha y medio de pago
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_medio_pago ON ventas(fecha_venta, medio_pago);

-- Índice para búsqueda de planes activos por fecha
CREATE INDEX IF NOT EXISTS idx_planes_vianda_fechas ON planes_vianda(fecha_inicio, fecha_fin) 
  WHERE estado = 'activo';

-- Índice para consultas de retiros por plan y fecha
CREATE INDEX IF NOT EXISTS idx_retiros_plan_fecha ON retiros_vianda(plan_vianda_id, fecha_retiro);

-- Índice para productos activos por categoría
CREATE INDEX IF NOT EXISTS idx_productos_activos_categoria ON productos(categoria_id, activo) 
  WHERE activo = true;

-- Índice para promociones activas y vigentes
CREATE INDEX IF NOT EXISTS idx_promociones_vigentes ON promociones(producto_id, activa, fecha_inicio, fecha_fin) 
  WHERE activa = true;

-- ============================================
-- COMENTARIOS SOBRE OPTIMIZACIONES
-- ============================================
-- 
-- 1. Los índices compuestos mejoran consultas que filtran por múltiples columnas
-- 2. Los índices parciales (WHERE) reducen el tamaño del índice y mejoran rendimiento
-- 3. Los índices existentes ya cubren las consultas principales
-- 4. Para grandes volúmenes de datos, considerar particionamiento de tablas por fecha
-- 5. Monitorear el uso de índices con EXPLAIN ANALYZE en consultas lentas

