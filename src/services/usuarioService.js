const Usuario = require('../models/Usuario');
const { AppError } = require('../middleware/errorHandler');
const { hashPassword } = require('../utils/bcrypt');

class UsuarioService {
  /**
   * Crea un nuevo usuario
   * @param {Object} usuarioData - Datos del usuario
   * @returns {Object} Usuario creado
   */
  static async create(usuarioData) {
    const { username, password, rol, nombre_completo } = usuarioData;

    // Verificar que el username no exista
    const usuarioExistente = await Usuario.findByUsername(username);
    if (usuarioExistente) {
      throw new AppError('El username ya está en uso', 409);
    }

    // Hashear contraseña
    const password_hash = await hashPassword(password);

    // Crear usuario
    return await Usuario.create({
      username,
      password_hash,
      rol,
      nombre_completo
    });
  }

  /**
   * Obtiene todos los usuarios
   * @returns {Array} Lista de usuarios
   */
  static async findAll() {
    return await Usuario.findAll();
  }

  /**
   * Obtiene un usuario por ID
   * @param {Number} id - ID del usuario
   * @returns {Object} Usuario
   */
  static async findById(id) {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return usuario;
  }

  /**
   * Actualiza un usuario
   * @param {Number} id - ID del usuario
   * @param {Object} usuarioData - Datos a actualizar
   * @returns {Object} Usuario actualizado
   */
  static async update(id, usuarioData) {
    const updateData = { ...usuarioData };

    // Si se actualiza la contraseña, hashearla
    if (updateData.password) {
      updateData.password_hash = await hashPassword(updateData.password);
      delete updateData.password;
    }

    return await Usuario.update(id, updateData);
  }

  /**
   * Elimina (desactiva) un usuario
   * @param {Number} id - ID del usuario
   * @returns {Object} Usuario desactivado
   */
  static async delete(id) {
    return await Usuario.delete(id);
  }
}

module.exports = UsuarioService;

