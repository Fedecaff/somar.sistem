const pool = require('../config/database');

class DetalleVenta {
  /**
   * Crea un detalle de venta
   * @param {Object} detalleData - Datos del detalle
   * @returns {Object} Detalle creado
   */
  static async create(detalleData) {
    const { venta_id, producto_id, cantidad, precio_unitario, subtotal } = detalleData;
    const query = `
      INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [venta_id, producto_id, cantidad, precio_unitario, subtotal]);
    return result.rows[0];
  }

  /**
   * Crea múltiples detalles de venta
   * @param {Array} detalles - Array de detalles
   * @returns {Array} Detalles creados
   */
  static async createMultiple(detalles) {
    const created = [];
    for (const detalle of detalles) {
      const creado = await this.create(detalle);
      created.push(creado);
    }
    return created;
  }
}

module.exports = DetalleVenta;

