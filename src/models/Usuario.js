const pool = require('../config/database');

class Usuario {
  /**
   * Busca un usuario por username
   * @param {String} username - Nombre de usuario
   * @returns {Object|null} Usuario encontrado o null
   */
  static async findByUsername(username) {
    const query = 'SELECT * FROM usuarios WHERE username = $1 AND activo = TRUE';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  /**
   * Busca un usuario por ID
   * @param {Number} id - ID del usuario
   * @returns {Object|null} Usuario encontrado o null
   */
  static async findById(id) {
    const query = 'SELECT id, username, rol, nombre_completo, activo FROM usuarios WHERE id = $1 AND activo = TRUE';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} usuarioData - Datos del usuario
   * @returns {Object} Usuario creado
   */
  static async create(usuarioData) {
    const { username, password_hash, rol, nombre_completo } = usuarioData;
    const query = `
      INSERT INTO usuarios (username, password_hash, rol, nombre_completo)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, rol, nombre_completo, activo, created_at
    `;
    const result = await pool.query(query, [username, password_hash, rol, nombre_completo]);
    return result.rows[0];
  }

  /**
   * Obtiene todos los usuarios activos
   * @returns {Array} Lista de usuarios
   */
  static async findAll() {
    const query = 'SELECT id, username, rol, nombre_completo, activo, created_at FROM usuarios WHERE activo = TRUE ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Actualiza un usuario
   * @param {Number} id - ID del usuario
   * @param {Object} usuarioData - Datos a actualizar
   * @returns {Object} Usuario actualizado
   */
  static async update(id, usuarioData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (usuarioData.nombre_completo !== undefined) {
      fields.push(`nombre_completo = $${paramCount++}`);
      values.push(usuarioData.nombre_completo);
    }
    if (usuarioData.rol !== undefined) {
      fields.push(`rol = $${paramCount++}`);
      values.push(usuarioData.rol);
    }
    if (usuarioData.password_hash !== undefined) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(usuarioData.password_hash);
    }
    if (usuarioData.activo !== undefined) {
      fields.push(`activo = $${paramCount++}`);
      values.push(usuarioData.activo);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE usuarios 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, rol, nombre_completo, activo, updated_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Desactiva un usuario (soft delete)
   * @param {Number} id - ID del usuario
   * @returns {Object} Usuario desactivado
   */
  static async delete(id) {
    return await this.update(id, { activo: false });
  }
}

module.exports = Usuario;

