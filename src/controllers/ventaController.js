const VentaService = require('../services/ventaService');

class VentaController {
  /**
   * Crea una nueva venta
   * POST /api/ventas
   */
  static async create(req, res) {
    try {
      const usuarioId = req.usuario.id; // Del middleware de autenticación
      const venta = await VentaService.create(req.body, usuarioId);
      
      res.status(201).json({
        success: true,
        message: 'Venta creada exitosamente',
        data: venta
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear venta'
      });
    }
  }

  /**
   * Obtiene todas las ventas
   * GET /api/ventas
   */
  static async getAll(req, res) {
    try {
      const { tipo_venta, cliente_id, medio_pago, fecha_inicio, fecha_fin, fecha } = req.query;
      const filters = {};

      if (tipo_venta) filters.tipo_venta = tipo_venta;
      if (cliente_id) filters.cliente_id = parseInt(cliente_id);
      if (medio_pago) filters.medio_pago = medio_pago;
      if (fecha_inicio) filters.fecha_inicio = fecha_inicio;
      if (fecha_fin) filters.fecha_fin = fecha_fin;
      if (fecha) filters.fecha = fecha;

      const ventas = await VentaService.findAll(filters);
      res.json({
        success: true,
        data: ventas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener ventas'
      });
    }
  }

  /**
   * Obtiene una venta por ID
   * GET /api/ventas/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const venta = await VentaService.findById(id);
      res.json({
        success: true,
        data: venta
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Venta no encontrada'
      });
    }
  }

  /**
   * Obtiene ventas del día actual
   * GET /api/ventas/hoy
   */
  static async getVentasHoy(req, res) {
    try {
      const ventas = await VentaService.getVentasHoy();
      res.json({
        success: true,
        data: ventas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener ventas del día'
      });
    }
  }

  /**
   * Marca ticket de cocina como preparado
   * PUT /api/ventas/:id/preparado
   */
  static async marcarPreparado(req, res) {
    try {
      const { id } = req.params;
      const ticket = await VentaService.marcarPreparado(id);
      res.json({
        success: true,
        message: 'Ticket marcado como preparado',
        data: ticket
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Venta no encontrada'
      });
    }
  }

  /**
   * Obtiene el ticket formateado
   * GET /api/ventas/:id/ticket
   */
  static async getTicket(req, res) {
    try {
      const { id } = req.params;
      const ticket = await VentaService.getTicketFormateado(id);
      res.json({
        success: true,
        data: { ticket }
      });
    } catch (error) {
      res.status(error.statusCode || 404).json({
        success: false,
        message: error.message || 'Error al obtener ticket'
      });
    }
  }
}

module.exports = VentaController;

