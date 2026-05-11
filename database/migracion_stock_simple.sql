-- ============================================
-- Migración: Stock simple en productos
-- ============================================

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS tiene_control_stock BOOLEAN DEFAULT FALSE;

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS cantidad_disponible INTEGER DEFAULT 0;

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS cantidad_minima INTEGER DEFAULT 0;

-- Normalizar posibles NULLs existentes
UPDATE productos
SET tiene_control_stock = COALESCE(tiene_control_stock, FALSE),
    cantidad_disponible = COALESCE(cantidad_disponible, 0),
    cantidad_minima = COALESCE(cantidad_minima, 0);
