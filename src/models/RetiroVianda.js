const pool = require('../config/database');

class RetiroVianda {
  /**
   * Busca un retiro por ID
   * @param {Number} id - ID del retiro
   * @returns {Object|null} Retiro encontrado o null
   */
  static async findById(id) {
    const query = `
      SELECT rv.*, 
             pv.cliente_id,
             c.nombre as cliente_nombre,
             p.nombre as producto_nombre
      FROM retiros_vianda rv
      INNER JOIN planes_vianda pv ON rv.plan_vianda_id = pv.id
      INNER JOIN clientes c ON pv.cliente_id = c.id
      LEFT JOIN productos p ON rv.producto_solicitado_id = p.id
      WHERE rv.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todos los retiros
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de retiros
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT rv.*, 
             pv.cliente_id,
             c.nombre as cliente_nombre,
             p.nombre as producto_nombre
      FROM retiros_vianda rv
      INNER JOIN planes_vianda pv ON rv.plan_vianda_id = pv.id
      INNER JOIN clientes c ON pv.cliente_id = c.id
      LEFT JOIN productos p ON rv.producto_solicitado_id = p.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.plan_vianda_id) {
      query += ` AND rv.plan_vianda_id = $${paramCount++}`;
      values.push(filters.plan_vianda_id);
    }

    if (filters.fecha_retiro) {
      query += ` AND rv.fecha_retiro = $${paramCount++}`;
      values.push(filters.fecha_retiro);
    }

    if (filters.retirado !== undefined) {
      query += ` AND rv.retirado = $${paramCount++}`;
      values.push(filters.retirado);
    }

    if (filters.fecha_inicio) {
      query += ` AND rv.fecha_retiro >= $${paramCount++}`;
      values.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      query += ` AND rv.fecha_retiro <= $${paramCount++}`;
      values.push(filters.fecha_fin);
    }

    query += ' ORDER BY rv.fecha_retiro DESC, rv.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Crea un nuevo retiro
   * @param {Object} retiroData - Datos del retiro
   * @returns {Object} Retiro creado
   */
  static async create(retiroData) {
    const {
      plan_vianda_id,
      venta_id,
      fecha_retiro,
      producto_solicitado_id,
      observaciones
    } = retiroData;

    const query = `
      INSERT INTO retiros_vianda (
        plan_vianda_id, venta_id, fecha_retiro, producto_solicitado_id, observaciones, retirado
      )
      VALUES ($1, $2, $3, $4, $5, FALSE)
      RETURNING *
    `;
    const result = await pool.query(query, [
      plan_vianda_id,
      venta_id || null,
      fecha_retiro,
      producto_solicitado_id || null,
      observaciones || null
    ]);
    return result.rows[0];
  }

  /**
   * Marca un retiro como retirado
   * @param {Number} id - ID del retiro
   * @returns {Object} Retiro actualizado
   */
  static async marcarRetirado(id) {
    const query = `
      UPDATE retiros_vianda
      SET retirado = TRUE
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Obtiene retiros de un plan en una fecha
   * @param {Number} planViandaId - ID del plan
   * @param {Date} fecha - Fecha
   * @returns {Array} Lista de retiros
   */
  static async getRetirosPorFecha(planViandaId, fecha) {
    const query = `
      SELECT * FROM retiros_vianda
      WHERE plan_vianda_id = $1 AND fecha_retiro = $2
      ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [planViandaId, fecha]);
    return result.rows;
  }

  /**
   * Cuenta retiros realizados de un plan en una fecha
   * @param {Number} planViandaId - ID del plan
   * @param {Date} fecha - Fecha
   * @returns {Number} Cantidad de retiros
   */
  static async contarRetirosRealizados(planViandaId, fecha) {
    const query = `
      SELECT COUNT(*) as cantidad
      FROM retiros_vianda
      WHERE plan_vianda_id = $1 
        AND fecha_retiro = $2
        AND retirado = TRUE
    `;
    const result = await pool.query(query, [planViandaId, fecha]);
    return parseInt(result.rows[0].cantidad);
  }
}

module.exports = RetiroVianda;

