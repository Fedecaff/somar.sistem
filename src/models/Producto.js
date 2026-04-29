const pool = require('../config/database');

class Producto {
  /**
   * Busca un producto por ID
   * @param {Number} id - ID del producto
   * @returns {Object|null} Producto encontrado o null
   */
  static async findById(id) {
    const query = `
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todos los productos
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de productos
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.activo !== undefined) {
      query += ` AND p.activo = $${paramCount++}`;
      values.push(filters.activo);
    }

    if (filters.categoria_id) {
      query += ` AND p.categoria_id = $${paramCount++}`;
      values.push(filters.categoria_id);
    }

    if (filters.es_menu_fijo !== undefined) {
      query += ` AND p.es_menu_fijo = $${paramCount++}`;
      values.push(filters.es_menu_fijo);
    }

    if (filters.solo_mostrador !== undefined) {
      query += ` AND p.solo_mostrador = $${paramCount++}`;
      values.push(filters.solo_mostrador);
    }

    if (filters.search) {
      query += ` AND LOWER(p.nombre) LIKE LOWER($${paramCount++})`;
      values.push(`%${filters.search}%`);
    }

    query += ' ORDER BY p.nombre ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Crea un nuevo producto
   * @param {Object} productoData - Datos del producto
   * @returns {Object} Producto creado
   */
  static async create(productoData) {
    const {
      nombre,
      descripcion,
      categoria_id,
      precio,
      es_menu_fijo = false,
      solo_mostrador = false,
      imagen_url
    } = productoData;

    const query = `
      INSERT INTO productos (
        nombre, descripcion, categoria_id, precio,
        es_menu_fijo, solo_mostrador, imagen_url, activo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      RETURNING *
    `;
    const result = await pool.query(query, [
      nombre,
      descripcion,
      categoria_id || null,
      precio,
      es_menu_fijo,
      solo_mostrador,
      imagen_url || null
    ]);
    return result.rows[0];
  }

  /**
   * Actualiza un producto
   * @param {Number} id - ID del producto
   * @param {Object} productoData - Datos a actualizar
   * @returns {Object} Producto actualizado
   */
  static async update(id, productoData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (productoData.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(productoData.nombre);
    }
    if (productoData.descripcion !== undefined) {
      fields.push(`descripcion = $${paramCount++}`);
      values.push(productoData.descripcion);
    }
    if (productoData.categoria_id !== undefined) {
      fields.push(`categoria_id = $${paramCount++}`);
      values.push(productoData.categoria_id || null);
    }
    if (productoData.precio !== undefined) {
      fields.push(`precio = $${paramCount++}`);
      values.push(productoData.precio);
    }
    if (productoData.es_menu_fijo !== undefined) {
      fields.push(`es_menu_fijo = $${paramCount++}`);
      values.push(productoData.es_menu_fijo);
    }
    if (productoData.solo_mostrador !== undefined) {
      fields.push(`solo_mostrador = $${paramCount++}`);
      values.push(productoData.solo_mostrador);
    }
    if (productoData.imagen_url !== undefined) {
      fields.push(`imagen_url = $${paramCount++}`);
      values.push(productoData.imagen_url || null);
    }
    if (productoData.activo !== undefined) {
      fields.push(`activo = $${paramCount++}`);
      values.push(productoData.activo);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE productos 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Elimina (desactiva) un producto
   * @param {Number} id - ID del producto
   * @returns {Object} Producto desactivado
   */
  static async delete(id) {
    return await this.update(id, { activo: false });
  }

  /**
   * Elimina permanentemente un producto
   * @param {Number} id - ID del producto
   * @returns {Object|null} Producto eliminado
   */
  static async deletePermanent(id) {
    const query = `
      DELETE FROM productos
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Verifica si el producto tiene dependencias históricas que impiden borrado permanente
   * @param {Number} productoId - ID del producto
   * @returns {Boolean} true si tiene dependencias
   */
  static async hasDependenciasHistoricas(productoId) {
    const query = `
      SELECT EXISTS(SELECT 1 FROM detalle_ventas WHERE producto_id = $1) AS usado_en_ventas,
             EXISTS(SELECT 1 FROM retiros_vianda WHERE producto_solicitado_id = $1) AS usado_en_retiros
    `;
    const result = await pool.query(query, [productoId]);
    const row = result.rows[0] || {};
    return Boolean(row.usado_en_ventas || row.usado_en_retiros);
  }

  /**
   * Obtiene el historial de precios de un producto
   * @param {Number} productoId - ID del producto
   * @returns {Array} Historial de precios
   */
  static async getHistorialPrecios(productoId) {
    const query = `
      SELECT hp.*, u.username as usuario_username
      FROM historial_precios hp
      LEFT JOIN usuarios u ON hp.usuario_id = u.id
      WHERE hp.producto_id = $1
      ORDER BY hp.fecha_cambio DESC
    `;
    const result = await pool.query(query, [productoId]);
    return result.rows;
  }
}

module.exports = Producto;

