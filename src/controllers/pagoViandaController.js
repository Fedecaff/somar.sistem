const PagoViandaService = require('../services/pagoViandaService');

class PagoViandaController {
  /**
   * Registra un pago de plan
   * POST /api/pagos-vianda
   */
  static async create(req, res) {
    try {
      const pago = await PagoViandaService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: pago
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar pago'
      });
    }
  }

  /**
   * Obtiene pagos de un plan
   * GET /api/pagos-vianda/plan/:planViandaId
   */
  static async getByPlan(req, res) {
    try {
      const { planViandaId } = req.params;
      const pagos = await PagoViandaService.findByPlan(parseInt(planViandaId));
      res.json({
        success: true,
        data: pagos
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Plan no encontrado'
      });
    }
  }

  /**
   * Calcula total pagado de un plan
   * GET /api/pagos-vianda/plan/:planViandaId/total
   */
  static async getTotalPagado(req, res) {
    try {
      const { planViandaId } = req.params;
      const total = await PagoViandaService.calcularTotalPagado(parseInt(planViandaId));
      res.json({
        success: true,
        data: {
          plan_vianda_id: parseInt(planViandaId),
          total_pagado: total
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Plan no encontrado'
      });
    }
  }

  /**
   * Obtiene un pago por ID
   * GET /api/pagos-vianda/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const pago = await PagoViandaService.findById(id);
      res.json({
        success: true,
        data: pago
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Pago no encontrado'
      });
    }
  }
}

module.exports = PagoViandaController;

