-- ============================================================
-- Verificación QA: consistencia de Planes / Pagos / Retiros
-- Dataset objetivo: clientes QA-CONSISTENCIA-%
-- ============================================================
-- Ejecutar con:
-- & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d rotiseria_db -f ".\database\verificacion_consistencia_planes_pagos_retiros.sql"

-- ------------------------------------------------------------
-- 0) Base de dataset
-- ------------------------------------------------------------
SELECT
  CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'REVISAR' END AS estado,
  COUNT(*) AS clientes_qa
FROM clientes
WHERE nombre LIKE 'QA-CONSISTENCIA-%';

-- ------------------------------------------------------------
-- 1) Saldos de plan (precio_mensual - total_pagado)
-- ------------------------------------------------------------
WITH planes_qa AS (
  SELECT pv.id, pv.precio_mensual
  FROM planes_vianda pv
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
),
pagos AS (
  SELECT plan_vianda_id, COALESCE(SUM(monto), 0) AS total_pagado
  FROM pagos_vianda
  GROUP BY plan_vianda_id
),
saldo AS (
  SELECT
    p.id AS plan_id,
    p.precio_mensual,
    COALESCE(pg.total_pagado, 0) AS total_pagado,
    (p.precio_mensual - COALESCE(pg.total_pagado, 0)) AS saldo_pendiente
  FROM planes_qa p
  LEFT JOIN pagos pg ON pg.plan_vianda_id = p.id
)
SELECT
  'Saldos generales' AS bloque,
  COUNT(*) AS planes,
  SUM(CASE WHEN saldo_pendiente > 0 THEN 1 ELSE 0 END) AS saldo_positivo,
  SUM(CASE WHEN saldo_pendiente = 0 THEN 1 ELSE 0 END) AS saldo_cero,
  SUM(CASE WHEN saldo_pendiente < 0 THEN 1 ELSE 0 END) AS saldo_negativo_sobrepago
FROM saldo;

-- Muestra ejemplos de sobrepago (si existen)
WITH planes_qa AS (
  SELECT pv.id, pv.precio_mensual, c.nombre AS cliente
  FROM planes_vianda pv
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
),
pagos AS (
  SELECT plan_vianda_id, COALESCE(SUM(monto), 0) AS total_pagado
  FROM pagos_vianda
  GROUP BY plan_vianda_id
)
SELECT
  CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'INFO' END AS estado,
  COUNT(*) AS planes_con_sobrepago
FROM (
  SELECT p.id
  FROM planes_qa p
  LEFT JOIN pagos pg ON pg.plan_vianda_id = p.id
  WHERE (p.precio_mensual - COALESCE(pg.total_pagado, 0)) < 0
) t;

WITH planes_qa AS (
  SELECT pv.id, pv.precio_mensual, c.nombre AS cliente
  FROM planes_vianda pv
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
),
pagos AS (
  SELECT plan_vianda_id, COALESCE(SUM(monto), 0) AS total_pagado
  FROM pagos_vianda
  GROUP BY plan_vianda_id
)
SELECT
  p.id AS plan_id,
  p.cliente,
  p.precio_mensual,
  COALESCE(pg.total_pagado, 0) AS total_pagado,
  (p.precio_mensual - COALESCE(pg.total_pagado, 0)) AS saldo
FROM planes_qa p
LEFT JOIN pagos pg ON pg.plan_vianda_id = p.id
WHERE (p.precio_mensual - COALESCE(pg.total_pagado, 0)) < 0
ORDER BY saldo ASC
LIMIT 10;

-- ------------------------------------------------------------
-- 2) Pagos adelantados (fecha_pago < fecha_inicio)
-- ------------------------------------------------------------
WITH pagos_qa AS (
  SELECT pg.*, pv.fecha_inicio
  FROM pagos_vianda pg
  INNER JOIN planes_vianda pv ON pv.id = pg.plan_vianda_id
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
)
SELECT
  CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'REVISAR' END AS estado,
  COUNT(*) AS pagos_adelantados_flag_true
FROM pagos_qa
WHERE pagado_por_adelantado = TRUE
  AND fecha_pago < fecha_inicio;

-- Inconsistencias del flag pagado_por_adelantado
WITH pagos_qa AS (
  SELECT pg.*, pv.fecha_inicio
  FROM pagos_vianda pg
  INNER JOIN planes_vianda pv ON pv.id = pg.plan_vianda_id
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
)
SELECT
  CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'REVISAR' END AS estado,
  COUNT(*) AS inconsistencias_flag_adelantado
FROM pagos_qa
WHERE (fecha_pago < fecha_inicio AND pagado_por_adelantado = FALSE)
   OR (fecha_pago >= fecha_inicio AND pagado_por_adelantado = TRUE);

-- ------------------------------------------------------------
-- 3) Límite diario de retiros confirmados (trigger)
-- ------------------------------------------------------------
WITH retiros_por_dia AS (
  SELECT
    rv.plan_vianda_id,
    rv.fecha_retiro,
    COUNT(*) FILTER (WHERE rv.retirado = TRUE) AS retiros_confirmados
  FROM retiros_vianda rv
  INNER JOIN planes_vianda pv ON pv.id = rv.plan_vianda_id
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
  GROUP BY rv.plan_vianda_id, rv.fecha_retiro
),
limites AS (
  SELECT
    pv.id AS plan_vianda_id,
    (pv.viandas_incluidas + pv.viandas_adicionales) AS max_dia
  FROM planes_vianda pv
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
)
SELECT
  CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'REVISAR' END AS estado,
  COUNT(*) AS dias_excedidos
FROM retiros_por_dia r
INNER JOIN limites l ON l.plan_vianda_id = r.plan_vianda_id
WHERE r.retiros_confirmados > l.max_dia;

-- Días al límite (útil para probar bordes)
WITH retiros_por_dia AS (
  SELECT
    rv.plan_vianda_id,
    rv.fecha_retiro,
    COUNT(*) FILTER (WHERE rv.retirado = TRUE) AS retiros_confirmados
  FROM retiros_vianda rv
  INNER JOIN planes_vianda pv ON pv.id = rv.plan_vianda_id
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
  GROUP BY rv.plan_vianda_id, rv.fecha_retiro
),
limites AS (
  SELECT
    pv.id AS plan_vianda_id,
    (pv.viandas_incluidas + pv.viandas_adicionales) AS max_dia
  FROM planes_vianda pv
  INNER JOIN clientes c ON c.id = pv.cliente_id
  WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
)
SELECT
  r.plan_vianda_id,
  r.fecha_retiro,
  r.retiros_confirmados,
  l.max_dia
FROM retiros_por_dia r
INNER JOIN limites l ON l.plan_vianda_id = r.plan_vianda_id
WHERE r.retiros_confirmados = l.max_dia
ORDER BY r.fecha_retiro DESC, r.plan_vianda_id
LIMIT 20;

-- ------------------------------------------------------------
-- 4) Retiros fuera de rango del plan (debería ser 0)
-- ------------------------------------------------------------
SELECT
  CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'REVISAR' END AS estado,
  COUNT(*) AS retiros_fuera_de_rango
FROM retiros_vianda rv
INNER JOIN planes_vianda pv ON pv.id = rv.plan_vianda_id
INNER JOIN clientes c ON c.id = pv.cliente_id
WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
  AND (rv.fecha_retiro < pv.fecha_inicio OR rv.fecha_retiro > pv.fecha_fin);

-- ------------------------------------------------------------
-- 5) Dashboard rápido de estados de planes QA
-- ------------------------------------------------------------
SELECT
  estado,
  COUNT(*) AS cantidad
FROM planes_vianda pv
INNER JOIN clientes c ON c.id = pv.cliente_id
WHERE c.nombre LIKE 'QA-CONSISTENCIA-%'
GROUP BY estado
ORDER BY estado;
