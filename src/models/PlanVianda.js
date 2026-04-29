const pool = require('../config/database');

class PlanVianda {
  /**
   * Busca un plan por ID
   * @param {Number} id - ID del plan
   * @returns {Object|null} Plan encontrado o null
   */
  static async findById(id) {
    const query = `
      SELECT pv.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono
      FROM planes_vianda pv
      INNER JOIN clientes c ON pv.cliente_id = c.id
      WHERE pv.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todos los planes
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de planes
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT pv.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono
      FROM planes_vianda pv
      INNER JOIN clientes c ON pv.cliente_id = c.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.cliente_id) {
      query += ` AND pv.cliente_id = $${paramCount++}`;
      values.push(filters.cliente_id);
    }

    if (filters.estado) {
      query += ` AND pv.estado = $${paramCount++}`;
      values.push(filters.estado);
    }

    if (filters.activo !== undefined && filters.activo === true) {
      query += ` AND pv.estado = 'activo' AND pv.fecha_fin >= CURRENT_DATE`;
    }

    query += ' ORDER BY pv.fecha_inicio DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Crea un nuevo plan
   * @param {Object} planData - Datos del plan
   * @returns {Object} Plan creado
   */
  static async create(planData) {
    const {
      cliente_id,
      fecha_inicio,
      fecha_fin,
      precio_mensual,
      dias_semana,
      viandas_incluidas,
      viandas_adicionales = 0
    } = planData;

    const query = `
      INSERT INTO planes_vianda (
        cliente_id, fecha_inicio, fecha_fin, precio_mensual,
        dias_semana, viandas_incluidas, viandas_adicionales, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'activo')
      RETURNING *
    `;
    const result = await pool.query(query, [
      cliente_id,
      fecha_inicio,
      fecha_fin,
      precio_mensual,
      dias_semana,
      viandas_incluidas,
      viandas_adicionales
    ]);
    return result.rows[0];
  }

  /**
   * Actualiza un plan
   * @param {Number} id - ID del plan
   * @param {Object} planData - Datos a actualizar
   * @returns {Object} Plan actualizado
   */
  static async update(id, planData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (planData.fecha_fin !== undefined) {
      fields.push(`fecha_fin = $${paramCount++}`);
      values.push(planData.fecha_fin);
    }
    if (planData.precio_mensual !== undefined) {
      fields.push(`precio_mensual = $${paramCount++}`);
      values.push(planData.precio_mensual);
    }
    if (planData.dias_semana !== undefined) {
      fields.push(`dias_semana = $${paramCount++}`);
      values.push(planData.dias_semana);
    }
    if (planData.viandas_incluidas !== undefined) {
      fields.push(`viandas_incluidas = $${paramCount++}`);
      values.push(planData.viandas_incluidas);
    }
    if (planData.viandas_adicionales !== undefined) {
      fields.push(`viandas_adicionales = $${paramCount++}`);
      values.push(planData.viandas_adicionales);
    }
    if (planData.estado !== undefined) {
      fields.push(`estado = $${paramCount++}`);
      values.push(planData.estado);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE planes_vianda 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Obtiene planes activos de un cliente
   * @param {Number} clienteId - ID del cliente
   * @returns {Array} Lista de planes activos
   */
  static async getPlanesActivos(clienteId) {
    const query = `
      SELECT * FROM planes_vianda
      WHERE cliente_id = $1 
        AND estado = 'activo'
        AND fecha_fin >= CURRENT_DATE
      ORDER BY fecha_inicio DESC
    `;
    const result = await pool.query(query, [clienteId]);
    return result.rows;
  }

  /**
   * Actualiza planes vencidos automáticamente
   * @returns {Number} Cantidad de planes actualizados
   */
  static async actualizarPlanesVencidos() {
    const query = `
      UPDATE planes_vianda
      SET estado = 'vencido', updated_at = CURRENT_TIMESTAMP
      WHERE estado = 'activo' AND fecha_fin < CURRENT_DATE
      RETURNING id
    `;
    const result = await pool.query(query);
    return result.rowCount;
  }
}

module.exports = PlanVianda;

