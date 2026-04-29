const RetiroViandaService = require('../services/retiroViandaService');

class RetiroViandaController {
  /**
   * Registra un retiro de vianda
   * POST /api/retiros-vianda
   */
  static async create(req, res) {
    try {
      const usuarioId = req.usuario.id; // Del middleware de autenticación
      const resultado = await RetiroViandaService.create(req.body, usuarioId);
      res.status(201).json({
        success: true,
        message: 'Retiro registrado exitosamente',
        data: resultado
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar retiro'
      });
    }
  }

  /**
   * Obtiene todos los retiros
   * GET /api/retiros-vianda
   */
  static async getAll(req, res) {
    try {
      const { plan_vianda_id, fecha_retiro, retirado, fecha_inicio, fecha_fin } = req.query;
      const filters = {};

      if (plan_vianda_id) filters.plan_vianda_id = parseInt(plan_vianda_id);
      if (fecha_retiro) filters.fecha_retiro = fecha_retiro;
      if (retirado !== undefined) filters.retirado = retirado === 'true';
      if (fecha_inicio) filters.fecha_inicio = fecha_inicio;
      if (fecha_fin) filters.fecha_fin = fecha_fin;

      const retiros = await RetiroViandaService.findAll(filters);
      res.json({
        success: true,
        data: retiros
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener retiros'
      });
    }
  }

  /**
   * Obtiene un retiro por ID
   * GET /api/retiros-vianda/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const retiro = await RetiroViandaService.findById(id);
      res.json({
        success: true,
        data: retiro
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Retiro no encontrado'
      });
    }
  }

  /**
   * Marca un retiro como retirado
   * PUT /api/retiros-vianda/:id/retirado
   */
  static async marcarRetirado(req, res) {
    try {
      const { id } = req.params;
      const retiro = await RetiroViandaService.marcarRetirado(id);
      res.json({
        success: true,
        message: 'Retiro marcado como retirado exitosamente',
        data: retiro
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al marcar retiro'
      });
    }
  }

  /**
   * Consulta retiros disponibles
   * GET /api/retiros-vianda/disponibles/:planViandaId
   */
  static async consultarDisponibles(req, res) {
    try {
      const { planViandaId } = req.params;
      const { fecha } = req.query;
      const info = await RetiroViandaService.consultarRetirosDisponibles(
        parseInt(planViandaId),
        fecha || null
      );
      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Plan no encontrado'
      });
    }
  }

  /**
   * Obtiene retiros de un plan por fecha
   * GET /api/retiros-vianda/plan/:planViandaId/fecha/:fecha
   */
  static async getRetirosPorFecha(req, res) {
    try {
      const { planViandaId, fecha } = req.params;
      const retiros = await RetiroViandaService.getRetirosPorFecha(
        parseInt(planViandaId),
        fecha
      );
      res.json({
        success: true,
        data: retiros
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener retiros'
      });
    }
  }
}

module.exports = RetiroViandaController;

