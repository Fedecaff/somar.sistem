const pool = require('../config/database');

class ReporteService {
  /**
   * Reporte de ventas diarias
   * @param {String} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Object} Resumen de ventas del día
   */
  static async ventasDiarias(fecha) {
    const query = `
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_monto,
        COUNT(CASE WHEN medio_pago = 'efectivo' THEN 1 END) as ventas_efectivo,
        COUNT(CASE WHEN medio_pago = 'transferencia' THEN 1 END) as ventas_transferencia,
        COALESCE(SUM(CASE WHEN medio_pago = 'efectivo' THEN total ELSE 0 END), 0) as monto_efectivo,
        COALESCE(SUM(CASE WHEN medio_pago = 'transferencia' THEN total ELSE 0 END), 0) as monto_transferencia,
        COUNT(CASE WHEN tipo_venta = 'mostrador' THEN 1 END) as ventas_mostrador,
        COUNT(CASE WHEN tipo_venta = 'vianda' THEN 1 END) as ventas_vianda,
        COALESCE(SUM(CASE WHEN tipo_venta = 'mostrador' THEN total ELSE 0 END), 0) as monto_mostrador,
        COALESCE(SUM(CASE WHEN tipo_venta = 'vianda' THEN total ELSE 0 END), 0) as monto_vianda
      FROM ventas
      WHERE fecha_venta >= $1::date 
        AND fecha_venta < ($1::date + INTERVAL '1 day')
    `;
    const result = await pool.query(query, [fecha]);
    return result.rows[0];
  }

  /**
   * Reporte de ventas por período
   * @param {String} fechaInicio - Fecha inicio YYYY-MM-DD
   * @param {String} fechaFin - Fecha fin YYYY-MM-DD
   * @returns {Array} Ventas del período
   */
  static async ventasPorPeriodo(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        DATE(fecha_venta) as fecha,
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_monto,
        COUNT(CASE WHEN medio_pago = 'efectivo' THEN 1 END) as ventas_efectivo,
        COUNT(CASE WHEN medio_pago = 'transferencia' THEN 1 END) as ventas_transferencia,
        COALESCE(SUM(CASE WHEN medio_pago = 'efectivo' THEN total ELSE 0 END), 0) as monto_efectivo,
        COALESCE(SUM(CASE WHEN medio_pago = 'transferencia' THEN total ELSE 0 END), 0) as monto_transferencia
      FROM ventas
      WHERE fecha_venta >= $1::date 
        AND fecha_venta < ($2::date + INTERVAL '1 day')
      GROUP BY DATE(fecha_venta)
      ORDER BY fecha DESC
    `;
    const result = await pool.query(query, [fechaInicio, fechaFin]);
    return result.rows;
  }

  /**
   * Reporte de ventas por medio de pago
   * @param {String} fechaInicio - Fecha inicio YYYY-MM-DD
   * @param {String} fechaFin - Fecha fin YYYY-MM-DD
   * @returns {Array} Resumen por medio de pago
   */
  static async ventasPorMedioPago(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        medio_pago,
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_monto,
        COALESCE(AVG(total), 0) as promedio_venta
      FROM ventas
      WHERE fecha_venta >= $1::date 
        AND fecha_venta < ($2::date + INTERVAL '1 day')
      GROUP BY medio_pago
      ORDER BY total_monto DESC
    `;
    const result = await pool.query(query, [fechaInicio, fechaFin]);
    return result.rows;
  }

  /**
   * Reporte de ventas por tipo
   * @param {String} fechaInicio - Fecha inicio YYYY-MM-DD
   * @param {String} fechaFin - Fecha fin YYYY-MM-DD
   * @returns {Array} Resumen por tipo de venta
   */
  static async ventasPorTipo(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        tipo_venta,
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_monto,
        COALESCE(AVG(total), 0) as promedio_venta
      FROM ventas
      WHERE fecha_venta >= $1::date 
        AND fecha_venta < ($2::date + INTERVAL '1 day')
      GROUP BY tipo_venta
      ORDER BY total_monto DESC
    `;
    const result = await pool.query(query, [fechaInicio, fechaFin]);
    return result.rows;
  }

  /**
   * Reporte de ventas por horario (día/noche)
   * @param {String} fechaInicio - Fecha inicio YYYY-MM-DD
   * @param {String} fechaFin - Fecha fin YYYY-MM-DD
   * @returns {Array} Resumen por horario
   */
  static async ventasPorHorario(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        CASE 
          WHEN EXTRACT(HOUR FROM fecha_venta) >= 20 THEN 'noche'
          ELSE 'día'
        END as horario,
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_monto,
        COALESCE(AVG(total), 0) as promedio_venta
      FROM ventas
      WHERE fecha_venta >= $1::date 
        AND fecha_venta < ($2::date + INTERVAL '1 day')
      GROUP BY 
        CASE 
          WHEN EXTRACT(HOUR FROM fecha_venta) >= 20 THEN 'noche'
          ELSE 'día'
        END
      ORDER BY horario
    `;
    const result = await pool.query(query, [fechaInicio, fechaFin]);
    return result.rows;
  }

  /**
   * Reporte de retiros de vianda por día
   * @param {String} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Object} Resumen de retiros del día
   */
  static async retirosViandaPorDia(fecha) {
    const query = `
      SELECT 
        COUNT(*) as total_retiros,
        COUNT(DISTINCT plan_vianda_id) as clientes_retiraron,
        COUNT(CASE WHEN retirado = true THEN 1 END) as retiros_completados,
        COUNT(CASE WHEN retirado = false THEN 1 END) as retiros_pendientes
      FROM retiros_vianda
      WHERE fecha_retiro = $1
    `;
    const result = await pool.query(query, [fecha]);
    return result.rows[0];
  }

  /**
   * Reporte de clientes que retiraron vianda
   * @param {String} fechaInicio - Fecha inicio YYYY-MM-DD
   * @param {String} fechaFin - Fecha fin YYYY-MM-DD
   * @returns {Array} Lista de clientes con retiros
   */
  static async clientesRetirosVianda(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.telefono,
        pv.id as plan_id,
        COUNT(rv.id) as total_retiros,
        COUNT(CASE WHEN rv.retirado = true THEN 1 END) as retiros_completados
      FROM retiros_vianda rv
      INNER JOIN planes_vianda pv ON rv.plan_vianda_id = pv.id
      INNER JOIN clientes c ON pv.cliente_id = c.id
      WHERE rv.fecha_retiro BETWEEN $1 AND $2
      GROUP BY c.id, c.nombre, c.telefono, pv.id
      ORDER BY total_retiros DESC
    `;
    const result = await pool.query(query, [fechaInicio, fechaFin]);
    return result.rows;
  }

  /**
   * Reporte de planes activos
   * @returns {Array} Lista de planes activos
   */
  static async planesActivos() {
    const query = `
      SELECT 
        pv.id,
        c.nombre as cliente_nombre,
        c.telefono,
        pv.viandas_incluidas,
        pv.viandas_adicionales,
        pv.fecha_inicio,
        pv.fecha_fin,
        pv.dias_semana,
        pv.estado,
        COALESCE(SUM(CASE WHEN rv.retirado = true THEN 1 ELSE 0 END), 0) as retiros_realizados
      FROM planes_vianda pv
      INNER JOIN clientes c ON pv.cliente_id = c.id
      LEFT JOIN retiros_vianda rv ON pv.id = rv.plan_vianda_id
      WHERE pv.estado = 'activo'
        AND pv.fecha_fin >= CURRENT_DATE
      GROUP BY pv.id, c.nombre, c.telefono, pv.viandas_incluidas, 
               pv.viandas_adicionales, pv.fecha_inicio, pv.fecha_fin, 
               pv.dias_semana, pv.estado
      ORDER BY pv.fecha_fin ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Reporte de planes vencidos
   * @returns {Array} Lista de planes vencidos
   */
  static async planesVencidos() {
    const query = `
      SELECT 
        pv.id,
        c.nombre as cliente_nombre,
        c.telefono,
        pv.viandas_incluidas,
        pv.viandas_adicionales,
        pv.fecha_inicio,
        pv.fecha_fin,
        pv.estado,
        COALESCE(SUM(CASE WHEN rv.retirado = true THEN 1 ELSE 0 END), 0) as retiros_realizados
      FROM planes_vianda pv
      INNER JOIN clientes c ON pv.cliente_id = c.id
      LEFT JOIN retiros_vianda rv ON pv.id = rv.plan_vianda_id
      WHERE pv.fecha_fin < CURRENT_DATE
        OR pv.estado = 'vencido'
      GROUP BY pv.id, c.nombre, c.telefono, pv.viandas_incluidas, 
               pv.viandas_adicionales, pv.fecha_inicio, pv.fecha_fin, 
               pv.estado
      ORDER BY pv.fecha_fin DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

}

module.exports = ReporteService;

