const pool = require('../config/database');

class Promocion {
  /**
   * Busca una promoción por ID
   * @param {Number} id - ID de la promoción
   * @returns {Object|null} Promoción encontrada o null
   */
  static async findById(id) {
    const query = 'SELECT * FROM promociones WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todas las promociones
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de promociones
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM promociones WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.activa !== undefined) {
      query += ` AND activa = $${paramCount++}`;
      values.push(filters.activa);
    }

    if (filters.producto_id) {
      query += ` AND producto_id = $${paramCount++}`;
      values.push(filters.producto_id);
    }

    if (filters.vigente !== undefined && filters.vigente === true) {
      query += ` AND activa = TRUE 
                 AND fecha_inicio <= CURRENT_DATE 
                 AND fecha_fin >= CURRENT_DATE`;
    }

    query += ' ORDER BY fecha_inicio DESC, nombre ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Obtiene promociones activas y vigentes para un producto
   * @param {Number} productoId - ID del producto
   * @param {Number} cantidad - Cantidad a comprar
   * @returns {Array} Lista de promociones aplicables
   */
  static async findAplicables(productoId, cantidad) {
    const query = `
      SELECT * FROM promociones
      WHERE producto_id = $1
        AND activa = TRUE
        AND fecha_inicio <= CURRENT_DATE
        AND fecha_fin >= CURRENT_DATE
        AND cantidad_minima <= $2
      ORDER BY cantidad_minima DESC
    `;
    const result = await pool.query(query, [productoId, cantidad]);
    return result.rows;
  }

  /**
   * Crea una nueva promoción
   * @param {Object} promocionData - Datos de la promoción
   * @returns {Object} Promoción creada
   */
  static async create(promocionData) {
    const {
      nombre,
      descripcion,
      producto_id,
      cantidad_minima,
      precio_unitario_promo,
      precio_total_promo,
      fecha_inicio,
      fecha_fin,
      activa = true
    } = promocionData;

    const query = `
      INSERT INTO promociones (
        nombre, descripcion, producto_id, cantidad_minima,
        precio_unitario_promo, precio_total_promo, fecha_inicio, fecha_fin, activa
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await pool.query(query, [
      nombre,
      descripcion || null,
      producto_id,
      cantidad_minima,
      precio_unitario_promo ?? null,
      precio_total_promo ?? null,
      fecha_inicio,
      fecha_fin,
      activa
    ]);
    return result.rows[0];
  }

  /**
   * Actualiza una promoción
   * @param {Number} id - ID de la promoción
   * @param {Object} promocionData - Datos a actualizar
   * @returns {Object} Promoción actualizada
   */
  static async update(id, promocionData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (promocionData.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(promocionData.nombre);
    }
    if (promocionData.descripcion !== undefined) {
      fields.push(`descripcion = $${paramCount++}`);
      values.push(promocionData.descripcion || null);
    }
    if (promocionData.producto_id !== undefined) {
      fields.push(`producto_id = $${paramCount++}`);
      values.push(promocionData.producto_id);
    }
    if (promocionData.cantidad_minima !== undefined) {
      fields.push(`cantidad_minima = $${paramCount++}`);
      values.push(promocionData.cantidad_minima);
    }
    if (promocionData.precio_unitario_promo !== undefined) {
      fields.push(`precio_unitario_promo = $${paramCount++}`);
      values.push(promocionData.precio_unitario_promo);
    }
    if (promocionData.precio_total_promo !== undefined) {
      fields.push(`precio_total_promo = $${paramCount++}`);
      values.push(promocionData.precio_total_promo);
    }
    if (promocionData.fecha_inicio !== undefined) {
      fields.push(`fecha_inicio = $${paramCount++}`);
      values.push(promocionData.fecha_inicio);
    }
    if (promocionData.fecha_fin !== undefined) {
      fields.push(`fecha_fin = $${paramCount++}`);
      values.push(promocionData.fecha_fin);
    }
    if (promocionData.activa !== undefined) {
      fields.push(`activa = $${paramCount++}`);
      values.push(promocionData.activa);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE promociones 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Elimina una promoción
   * @param {Number} id - ID de la promoción
   * @returns {Boolean} True si se eliminó
   */
  static async delete(id) {
    const query = 'DELETE FROM promociones WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Desactiva una promoción
   * @param {Number} id - ID de la promoción
   * @returns {Object} Promoción desactivada
   */
  static async desactivar(id) {
    return await this.update(id, { activa: false });
  }
}

module.exports = Promocion;

