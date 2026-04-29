const Usuario = require('../models/Usuario');
const { AppError } = require('../middleware/errorHandler');
const { comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

class AuthService {
  /**
   * Autentica un usuario y genera un token
   * @param {String} username - Nombre de usuario
   * @param {String} password - Contraseña
   * @returns {Object} Token y datos del usuario
   */
  static async login(username, password) {
    // Buscar usuario
    const usuario = await Usuario.findByUsername(username);
    if (!usuario) {
      throw new AppError('Usuario o contraseña incorrectos', 401);
    }

    // Verificar contraseña
    const passwordMatch = await comparePassword(password, usuario.password_hash);
    if (!passwordMatch) {
      throw new AppError('Usuario o contraseña incorrectos', 401);
    }

    // Generar token
    const token = generateToken({
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol
    });

    // Retornar datos (sin password_hash)
    return {
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        nombre_completo: usuario.nombre_completo
      }
    };
  }

  /**
   * Verifica un token y retorna el usuario
   * @param {String} token - Token JWT
   * @returns {Object} Datos del usuario
   */
  static async verifyToken(token) {
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(token);
    
    // Buscar usuario en BD para asegurar que aún existe y está activo
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado o inactivo', 401);
    }

    return usuario;
  }
}

module.exports = AuthService;

