const AuthService = require('../services/authService');

class AuthController {
  /**
   * Login de usuario
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validaciones básicas
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      // Autenticar
      const result = await AuthService.login(username, password);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message || 'Error en el login'
      });
    }
  }

  /**
   * Verificar token (obtener usuario actual)
   * GET /api/auth/me
   */
  static async me(req, res) {
    try {
      // El usuario ya está en req.usuario gracias al middleware authenticate
      res.json({
        success: true,
        data: {
          id: req.usuario.id,
          username: req.usuario.username,
          rol: req.usuario.rol,
          nombre_completo: req.usuario.nombre_completo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener usuario'
      });
    }
  }
}

module.exports = AuthController;

