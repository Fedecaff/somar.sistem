-- ============================================================
-- Carga masiva QA: consistencia de Planes / Pagos / Retiros
-- ============================================================
-- Ejecutar con:
-- & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d rotiseria_db -f ".\database\carga_masiva_consistencia_planes_pagos_retiros.sql"

BEGIN;

-- Limpieza idempotente del dataset QA
WITH clientes_qa AS (
  SELECT id FROM clientes WHERE nombre LIKE 'QA-CONSISTENCIA-%'
), planes_qa AS (
  SELECT pv.id FROM planes_vianda pv INNER JOIN clientes_qa c ON c.id = pv.cliente_id
)
DELETE FROM retiros_vianda rv USING planes_qa p WHERE rv.plan_vianda_id = p.id;

WITH clientes_qa AS (
  SELECT id FROM clientes WHERE nombre LIKE 'QA-CONSISTENCIA-%'
), planes_qa AS (
  SELECT pv.id FROM planes_vianda pv INNER JOIN clientes_qa c ON c.id = pv.cliente_id
)
DELETE FROM pagos_vianda pg USING planes_qa p WHERE pg.plan_vianda_id = p.id;

DELETE FROM planes_vianda WHERE cliente_id IN (SELECT id FROM clientes WHERE nombre LIKE 'QA-CONSISTENCIA-%');
DELETE FROM clientes WHERE nombre LIKE 'QA-CONSISTENCIA-%';

DO $$
DECLARE
  v_i INTEGER;
  v_j INTEGER;
  v_k INTEGER;
  v_cliente_id INTEGER;
  v_plan_id INTEGER;
  v_producto_id INTEGER;
  v_fecha_inicio DATE;
  v_fecha_fin DATE;
  v_fecha_pago DATE;
  v_fecha_retiro DATE;
  v_estado VARCHAR(20);
  v_dias_semana INTEGER[];
  v_viandas_incluidas INTEGER;
  v_viandas_adicionales INTEGER;
  v_max_retiros_dia INTEGER;
  v_precio_mensual NUMERIC(10,2);
  v_monto_base NUMERIC(10,2);
  v_monto NUMERIC(10,2);
  v_productos_ids INTEGER[];
  v_retiros_confirmados INTEGER;
BEGIN
  SELECT ARRAY_AGG(id ORDER BY id) INTO v_productos_ids FROM productos WHERE activo = TRUE;
  IF v_productos_ids IS NULL OR array_length(v_productos_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No hay productos activos. Creá al menos un producto para asociar retiros.';
  END IF;

  FOR v_i IN 1..45 LOOP
    INSERT INTO clientes (nombre, telefono, email, tiene_vianda, activo)
    VALUES (
      'QA-CONSISTENCIA-' || LPAD(v_i::TEXT, 3, '0'),
      '299' || LPAD((1000000 + v_i)::TEXT, 7, '0'),
      'qa.consistencia.' || v_i::TEXT || '@mail.test',
      TRUE,
      TRUE
    )
    RETURNING id INTO v_cliente_id;

    v_fecha_inicio := CURRENT_DATE - ((random() * 120)::INT);
    v_fecha_fin := v_fecha_inicio + (20 + (random() * 55)::INT);
    v_viandas_incluidas := 1 + (random() * 3)::INT;
    v_viandas_adicionales := (random() * 2)::INT;
    v_max_retiros_dia := v_viandas_incluidas + v_viandas_adicionales;
    v_precio_mensual := ROUND((24000 + random() * 52000)::NUMERIC, 2);

    IF random() < 0.33 THEN
      v_dias_semana := ARRAY[1,2,3,4,5];
    ELSIF random() < 0.66 THEN
      v_dias_semana := ARRAY[1,3,5];
    ELSE
      v_dias_semana := ARRAY[2,4,6];
    END IF;

    IF v_fecha_fin < CURRENT_DATE THEN
      v_estado := 'vencido';
    ELSIF random() < 0.18 THEN
      v_estado := 'cancelado';
    ELSE
      v_estado := 'activo';
    END IF;

    INSERT INTO planes_vianda (
      cliente_id, fecha_inicio, fecha_fin, precio_mensual,
      dias_semana, viandas_incluidas, viandas_adicionales, estado
    )
    VALUES (
      v_cliente_id, v_fecha_inicio, v_fecha_fin, v_precio_mensual,
      v_dias_semana, v_viandas_incluidas, v_viandas_adicionales, v_estado
    )
    RETURNING id INTO v_plan_id;

    v_monto_base := ROUND((v_precio_mensual / 4)::NUMERIC, 2);
    FOR v_j IN 1..(2 + (random() * 3)::INT) LOOP
      IF v_j = 1 AND random() < 0.35 THEN
        v_fecha_pago := v_fecha_inicio - (1 + (random() * 20)::INT);
      ELSE
        v_fecha_pago := v_fecha_inicio + ((random() * GREATEST(1, (v_fecha_fin - v_fecha_inicio)))::INT);
      END IF;

      v_monto := ROUND((v_monto_base * (0.55 + random() * 0.90))::NUMERIC, 2);
      INSERT INTO pagos_vianda (plan_vianda_id, monto, medio_pago, fecha_pago, pagado_por_adelantado)
      VALUES (
        v_plan_id,
        GREATEST(500, v_monto),
        CASE WHEN random() < 0.5 THEN 'efectivo' ELSE 'transferencia' END,
        v_fecha_pago,
        (v_fecha_pago < v_fecha_inicio)
      );
    END LOOP;

    IF random() < 0.28 THEN
      INSERT INTO pagos_vianda (plan_vianda_id, monto, medio_pago, fecha_pago, pagado_por_adelantado)
      VALUES (
        v_plan_id,
        ROUND((v_precio_mensual * (0.20 + random() * 0.60))::NUMERIC, 2),
        CASE WHEN random() < 0.5 THEN 'efectivo' ELSE 'transferencia' END,
        v_fecha_inicio + ((random() * GREATEST(1, (v_fecha_fin - v_fecha_inicio)))::INT),
        FALSE
      );
    END IF;

    IF v_estado IN ('activo', 'vencido') THEN
      FOR v_k IN 1..(4 + (random() * 10)::INT) LOOP
        v_fecha_retiro := v_fecha_inicio + ((random() * GREATEST(1, (LEAST(v_fecha_fin, CURRENT_DATE) - v_fecha_inicio)))::INT);

        FOR v_j IN 1..LEAST(v_max_retiros_dia, 1 + (random() * GREATEST(1, v_max_retiros_dia))::INT) LOOP
          SELECT COUNT(*) INTO v_retiros_confirmados
          FROM retiros_vianda
          WHERE plan_vianda_id = v_plan_id
            AND fecha_retiro = v_fecha_retiro
            AND retirado = TRUE;

          EXIT WHEN v_retiros_confirmados >= v_max_retiros_dia;

          v_producto_id := v_productos_ids[1 + (random() * (array_length(v_productos_ids, 1) - 1))::INT];
          INSERT INTO retiros_vianda (plan_vianda_id, fecha_retiro, retirado, producto_solicitado_id, observaciones)
          VALUES (v_plan_id, v_fecha_retiro, TRUE, v_producto_id, 'QA retiro confirmado');
        END LOOP;

        IF random() < 0.5 THEN
          v_producto_id := v_productos_ids[1 + (random() * (array_length(v_productos_ids, 1) - 1))::INT];
          INSERT INTO retiros_vianda (plan_vianda_id, fecha_retiro, retirado, producto_solicitado_id, observaciones)
          VALUES (v_plan_id, v_fecha_retiro, FALSE, v_producto_id, 'QA retiro pendiente');
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;

COMMIT;

SELECT
  (SELECT COUNT(*) FROM clientes WHERE nombre LIKE 'QA-CONSISTENCIA-%') AS clientes_qa,
  (SELECT COUNT(*) FROM planes_vianda pv INNER JOIN clientes c ON c.id = pv.cliente_id WHERE c.nombre LIKE 'QA-CONSISTENCIA-%') AS planes_qa,
  (SELECT COUNT(*) FROM pagos_vianda pg INNER JOIN planes_vianda pv ON pv.id = pg.plan_vianda_id INNER JOIN clientes c ON c.id = pv.cliente_id WHERE c.nombre LIKE 'QA-CONSISTENCIA-%') AS pagos_qa,
  (SELECT COUNT(*) FROM retiros_vianda rv INNER JOIN planes_vianda pv ON pv.id = rv.plan_vianda_id INNER JOIN clientes c ON c.id = pv.cliente_id WHERE c.nombre LIKE 'QA-CONSISTENCIA-%') AS retiros_qa;
