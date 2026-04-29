const pool = require('../config/database');

class Cliente {
  /**
   * Busca un cliente por ID
   * @param {Number} id - ID del cliente
   * @returns {Object|null} Cliente encontrado o null
   */
  static async findById(id) {
    const query = 'SELECT * FROM clientes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca un cliente por teléfono
   * @param {String} telefono - Teléfono del cliente
   * @returns {Object|null} Cliente encontrado o null
   */
  static async findByTelefono(telefono) {
    const query = 'SELECT * FROM clientes WHERE telefono = $1';
    const result = await pool.query(query, [telefono]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todos los clientes
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de clientes
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM clientes WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.activo !== undefined) {
      query += ` AND activo = $${paramCount++}`;
      values.push(filters.activo);
    }

    if (filters.tiene_vianda !== undefined) {
      query += ` AND tiene_vianda = $${paramCount++}`;
      values.push(filters.tiene_vianda);
    }

    if (filters.search) {
      query += ` AND (LOWER(nombre) LIKE LOWER($${paramCount}) OR telefono LIKE $${paramCount++})`;
      values.push(`%${filters.search}%`);
    }

    query += ' ORDER BY nombre ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Crea un nuevo cliente
   * @param {Object} clienteData - Datos del cliente
   * @returns {Object} Cliente creado
   */
  static async create(clienteData) {
    const { nombre, telefono, email, tiene_vianda = false } = clienteData;
    const query = `
      INSERT INTO clientes (nombre, telefono, email, tiene_vianda, activo)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, telefono || null, email || null, tiene_vianda]);
    return result.rows[0];
  }

  /**
   * Actualiza un cliente
   * @param {Number} id - ID del cliente
   * @param {Object} clienteData - Datos a actualizar
   * @returns {Object} Cliente actualizado
   */
  static async update(id, clienteData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (clienteData.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(clienteData.nombre);
    }
    if (clienteData.telefono !== undefined) {
      fields.push(`telefono = $${paramCount++}`);
      values.push(clienteData.telefono || null);
    }
    if (clienteData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(clienteData.email || null);
    }
    if (clienteData.tiene_vianda !== undefined) {
      fields.push(`tiene_vianda = $${paramCount++}`);
      values.push(clienteData.tiene_vianda);
    }
    if (clienteData.activo !== undefined) {
      fields.push(`activo = $${paramCount++}`);
      values.push(clienteData.activo);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE clientes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Elimina (desactiva) un cliente
   * @param {Number} id - ID del cliente
   * @returns {Object} Cliente desactivado
   */
  static async delete(id) {
    return await this.update(id, { activo: false });
  }

  /**
   * Obtiene planes de vianda de un cliente
   * @param {Number} clienteId - ID del cliente
   * @returns {Array} Lista de planes
   */
  static async getPlanesVianda(clienteId) {
    const query = `
      SELECT * FROM planes_vianda
      WHERE cliente_id = $1
      ORDER BY fecha_inicio DESC
    `;
    const result = await pool.query(query, [clienteId]);
    return result.rows;
  }

  /**
   * Obtiene ventas de un cliente
   * @param {Number} clienteId - ID del cliente
   * @param {Object} filters - Filtros opcionales (fecha_inicio, fecha_fin)
   * @returns {Array} Lista de ventas
   */
  static async getVentas(clienteId, filters = {}) {
    let query = `
      SELECT * FROM ventas
      WHERE cliente_id = $1
    `;
    const values = [clienteId];
    let paramCount = 2;

    if (filters.fecha_inicio) {
      query += ` AND DATE(fecha_venta) >= $${paramCount++}`;
      values.push(filters.fecha_inicio);
    }
    if (filters.fecha_fin) {
      query += ` AND DATE(fecha_venta) <= $${paramCount++}`;
      values.push(filters.fecha_fin);
    }

    query += ' ORDER BY fecha_venta DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Cliente;

