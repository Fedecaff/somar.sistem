const pool = require('../config/database');

class PagoVianda {
  /**
   * Busca un pago por ID
   * @param {Number} id - ID del pago
   * @returns {Object|null} Pago encontrado o null
   */
  static async findById(id) {
    const query = 'SELECT * FROM pagos_vianda WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todos los pagos de un plan
   * @param {Number} planViandaId - ID del plan
   * @returns {Array} Lista de pagos
   */
  static async findByPlan(planViandaId) {
    const query = `
      SELECT * FROM pagos_vianda
      WHERE plan_vianda_id = $1
      ORDER BY fecha_pago DESC
    `;
    const result = await pool.query(query, [planViandaId]);
    return result.rows;
  }

  /**
   * Crea un nuevo pago
   * @param {Object} pagoData - Datos del pago
   * @returns {Object} Pago creado
   */
  static async create(pagoData) {
    const {
      plan_vianda_id,
      monto,
      medio_pago,
      fecha_pago,
      pagado_por_adelantado = false
    } = pagoData;

    const query = `
      INSERT INTO pagos_vianda (
        plan_vianda_id, monto, medio_pago, fecha_pago, pagado_por_adelantado
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      plan_vianda_id,
      monto,
      medio_pago,
      fecha_pago,
      pagado_por_adelantado
    ]);
    return result.rows[0];
  }

  /**
   * Calcula el total pagado de un plan
   * @param {Number} planViandaId - ID del plan
   * @returns {Number} Total pagado
   */
  static async calcularTotalPagado(planViandaId) {
    const query = `
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pagos_vianda
      WHERE plan_vianda_id = $1
    `;
    const result = await pool.query(query, [planViandaId]);
    return parseFloat(result.rows[0].total);
  }
}

module.exports = PagoVianda;

