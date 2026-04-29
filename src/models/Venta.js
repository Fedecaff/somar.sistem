const pool = require('../config/database');

class Venta {
  /**
   * Busca una venta por ID
   * @param {Number} id - ID de la venta
   * @returns {Object|null} Venta encontrada o null
   */
  static async findById(id) {
    const query = `
      SELECT v.*, 
             c.nombre as cliente_nombre,
             u.username as usuario_username,
             u.nombre_completo as usuario_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todas las ventas
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de ventas
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT v.*, 
             c.nombre as cliente_nombre_registrado,
             COALESCE(tv.cliente_nombre, c.nombre) as cliente_nombre,
             u.username as usuario_username
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN tickets_venta tv ON v.id = tv.venta_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.tipo_venta) {
      query += ` AND v.tipo_venta = $${paramCount++}`;
      values.push(filters.tipo_venta);
    }

    if (filters.cliente_id) {
      query += ` AND v.cliente_id = $${paramCount++}`;
      values.push(filters.cliente_id);
    }

    if (filters.medio_pago) {
      query += ` AND v.medio_pago = $${paramCount++}`;
      values.push(filters.medio_pago);
    }

    if (filters.fecha_inicio) {
      query += ` AND DATE(v.fecha_venta) >= $${paramCount++}`;
      values.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      query += ` AND DATE(v.fecha_venta) <= $${paramCount++}`;
      values.push(filters.fecha_fin);
    }

    if (filters.fecha) {
      query += ` AND DATE(v.fecha_venta) = $${paramCount++}`;
      values.push(filters.fecha);
    }

    query += ' ORDER BY v.fecha_venta DESC LIMIT 100';

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Crea una nueva venta
   * @param {Object} ventaData - Datos de la venta
   * @returns {Object} Venta creada
   */
  static async create(ventaData) {
    const {
      cliente_id,
      usuario_id,
      tipo_venta,
      plan_vianda_id,
      medio_pago,
      total,
      observaciones
    } = ventaData;

    const query = `
      INSERT INTO ventas (
        cliente_id, usuario_id, tipo_venta, plan_vianda_id,
        medio_pago, total, observaciones
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      cliente_id || null,
      usuario_id,
      tipo_venta,
      plan_vianda_id || null,
      medio_pago,
      total,
      observaciones || null
    ]);
    return result.rows[0];
  }

  /**
   * Obtiene el detalle de una venta
   * @param {Number} ventaId - ID de la venta
   * @returns {Array} Lista de productos de la venta
   */
  static async getDetalle(ventaId) {
    const query = `
      SELECT dv.*, p.nombre as producto_nombre, p.descripcion
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = $1
      ORDER BY dv.id ASC
    `;
    const result = await pool.query(query, [ventaId]);
    return result.rows;
  }

  /**
   * Obtiene ventas del día actual
   * @returns {Array} Lista de ventas
   */
  static async getVentasHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    return await this.findAll({ fecha: hoy });
  }
}

module.exports = Venta;

