const UsuarioService = require('../services/usuarioService');

class UsuarioController {
  /**
   * Obtiene todos los usuarios
   * GET /api/usuarios
   */
  static async getAll(req, res) {
    try {
      const usuarios = await UsuarioService.findAll();
      res.json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener usuarios'
      });
    }
  }

  /**
   * Obtiene un usuario por ID
   * GET /api/usuarios/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.findById(id);
      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Usuario no encontrado'
      });
    }
  }

  /**
   * Crea un nuevo usuario
   * POST /api/usuarios
   */
  static async create(req, res) {
    try {
      const { username, password, rol, nombre_completo } = req.body;

      // Validaciones
      if (!username || !password || !rol || !nombre_completo) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      if (!['admin', 'cajera'].includes(rol)) {
        return res.status(400).json({
          success: false,
          message: 'El rol debe ser "admin" o "cajera"'
        });
      }

      const usuario = await UsuarioService.create({
        username,
        password,
        rol,
        nombre_completo
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear usuario'
      });
    }
  }

  /**
   * Actualiza un usuario
   * PUT /api/usuarios/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.update(id, req.body);
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar usuario'
      });
    }
  }

  /**
   * Elimina (desactiva) un usuario
   * DELETE /api/usuarios/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await UsuarioService.delete(id);
      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar usuario'
      });
    }
  }
}

module.exports = UsuarioController;

