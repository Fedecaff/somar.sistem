-- Migracion para soportar promociones tipo X por Y
-- Ejecutar sobre una base existente si aun usa precio_promocional.

ALTER TABLE promociones
  ADD COLUMN IF NOT EXISTS precio_unitario_promo DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS precio_total_promo DECIMAL(10, 2);

DO $$
DECLARE
  tiene_columna_legacy BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'promociones'
      AND column_name = 'precio_promocional'
  ) INTO tiene_columna_legacy;

  IF tiene_columna_legacy THEN
    -- Migrar datos legacy a precio_unitario_promo si aun no estaba seteado.
    EXECUTE '
      UPDATE promociones
      SET precio_unitario_promo = precio_promocional
      WHERE precio_unitario_promo IS NULL
        AND precio_promocional IS NOT NULL
    ';
  END IF;
END $$;
