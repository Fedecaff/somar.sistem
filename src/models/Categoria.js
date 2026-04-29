const pool = require('../config/database');

class Categoria {
  /**
   * Busca una categoría por ID
   * @param {Number} id - ID de la categoría
   * @returns {Object|null} Categoría encontrada o null
   */
  static async findById(id) {
    const query = 'SELECT * FROM categorias WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca una categoría por nombre
   * @param {String} nombre - Nombre de la categoría
   * @returns {Object|null} Categoría encontrada o null
   */
  static async findByNombre(nombre) {
    const query = 'SELECT * FROM categorias WHERE LOWER(nombre) = LOWER($1)';
    const result = await pool.query(query, [nombre]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todas las categorías
   * @param {Object} filters - Filtros opcionales (activo)
   * @returns {Array} Lista de categorías
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM categorias WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.activo !== undefined) {
      query += ` AND activo = $${paramCount++}`;
      values.push(filters.activo);
    }

    if (filters.search) {
      query += ` AND LOWER(nombre) LIKE LOWER($${paramCount++})`;
      values.push(`%${filters.search}%`);
    }

    query += ' ORDER BY nombre ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Crea una nueva categoría
   * @param {Object} categoriaData - Datos de la categoría
   * @returns {Object} Categoría creada
   */
  static async create(categoriaData) {
    const { nombre, descripcion, activo = true } = categoriaData;
    const query = `
      INSERT INTO categorias (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo]);
    return result.rows[0];
  }

  /**
   * Actualiza una categoría
   * @param {Number} id - ID de la categoría
   * @param {Object} categoriaData - Datos a actualizar
   * @returns {Object} Categoría actualizada
   */
  static async update(id, categoriaData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (categoriaData.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(categoriaData.nombre);
    }
    if (categoriaData.descripcion !== undefined) {
      fields.push(`descripcion = $${paramCount++}`);
      values.push(categoriaData.descripcion);
    }
    if (categoriaData.activo !== undefined) {
      fields.push(`activo = $${paramCount++}`);
      values.push(categoriaData.activo);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE categorias 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Elimina (desactiva) una categoría
   * @param {Number} id - ID de la categoría
   * @returns {Object} Categoría desactivada
   */
  static async delete(id) {
    return await this.update(id, { activo: false });
  }

  /**
   * Elimina permanentemente una categoría
   * @param {Number} id - ID de la categoría
   * @returns {Object|null} Categoría eliminada
   */
  static async deletePermanent(id) {
    const query = `
      DELETE FROM categorias
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Verifica si la categoría tiene productos asociados
   * @param {Number} categoriaId - ID de la categoría
   * @returns {Boolean} true si tiene productos
   */
  static async hasProductos(categoriaId) {
    const query = `
      SELECT COUNT(*)::int AS total
      FROM productos
      WHERE categoria_id = $1
    `;
    const result = await pool.query(query, [categoriaId]);
    return (result.rows[0]?.total || 0) > 0;
  }

  /**
   * Obtiene productos de una categoría
   * @param {Number} categoriaId - ID de la categoría
   * @returns {Array} Lista de productos
   */
  static async getProductos(categoriaId) {
    const query = `
      SELECT id, nombre, precio, descripcion, activo
      FROM productos
      WHERE categoria_id = $1 AND activo = TRUE
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query, [categoriaId]);
    return result.rows;
  }
}

module.exports = Categoria;

