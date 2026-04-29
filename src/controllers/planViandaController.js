const PlanViandaService = require('../services/planViandaService');

class PlanViandaController {
  /**
   * Crea un nuevo plan de vianda
   * POST /api/planes-vianda
   */
  static async create(req, res) {
    try {
      const usuarioId = req.usuario.id; // Del middleware de autenticación
      const resultado = await PlanViandaService.create(req.body, usuarioId);
      res.status(201).json({
        success: true,
        message: 'Plan de vianda creado exitosamente',
        data: resultado
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear plan de vianda'
      });
    }
  }

  /**
   * Obtiene todos los planes
   * GET /api/planes-vianda
   */
  static async getAll(req, res) {
    try {
      const { cliente_id, estado, activo } = req.query;
      const filters = {};

      if (cliente_id) filters.cliente_id = parseInt(cliente_id);
      if (estado) filters.estado = estado;
      if (activo === 'true') filters.activo = true;

      const planes = await PlanViandaService.findAll(filters);
      res.json({
        success: true,
        data: planes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener planes de vianda'
      });
    }
  }

  /**
   * Obtiene un plan por ID
   * GET /api/planes-vianda/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const plan = await PlanViandaService.getPlanCompleto(id);
      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Plan de vianda no encontrado'
      });
    }
  }

  /**
   * Actualiza un plan
   * PUT /api/planes-vianda/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const plan = await PlanViandaService.update(id, req.body);
      res.json({
        success: true,
        message: 'Plan actualizado exitosamente',
        data: plan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar plan'
      });
    }
  }

  /**
   * Cancela un plan
   * PUT /api/planes-vianda/:id/cancelar
   */
  static async cancelar(req, res) {
    try {
      const { id } = req.params;
      const plan = await PlanViandaService.cancelar(id);
      res.json({
        success: true,
        message: 'Plan cancelado exitosamente',
        data: plan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al cancelar plan'
      });
    }
  }

  /**
   * Obtiene planes activos de un cliente
   * GET /api/planes-vianda/cliente/:clienteId
   */
  static async getPlanesActivos(req, res) {
    try {
      const { clienteId } = req.params;
      const planes = await PlanViandaService.getPlanesActivos(parseInt(clienteId));
      res.json({
        success: true,
        data: planes
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Cliente no encontrado'
      });
    }
  }

  /**
   * Agrega viandas adicionales
   * PUT /api/planes-vianda/:id/viandas-adicionales
   */
  static async agregarViandasAdicionales(req, res) {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;

      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser mayor a 0'
        });
      }

      const plan = await PlanViandaService.agregarViandasAdicionales(id, cantidad);
      res.json({
        success: true,
        message: 'Viandas adicionales agregadas exitosamente',
        data: plan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al agregar viandas adicionales'
      });
    }
  }
}

module.exports = PlanViandaController;

