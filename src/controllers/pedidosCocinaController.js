const PedidosCocinaService = require('../services/pedidosCocinaService');

class PedidosCocinaController {
  /**
   * Obtiene todos los pedidos del día
   * GET /api/pedidos-cocina
   */
  static async getPedidosDelDia(req, res) {
    try {
      const { fecha } = req.query;
      const pedidos = await PedidosCocinaService.getPedidosDelDia(fecha);
      res.json({
        success: true,
        data: pedidos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener pedidos'
      });
    }
  }

  /**
   * Obtiene un pedido por ID
   * GET /api/pedidos-cocina/:id
   */
  static async getPedidoById(req, res) {
    try {
      const { id } = req.params;
      const pedido = await PedidosCocinaService.getPedidoById(id);
      res.json({
        success: true,
        data: pedido
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener pedido'
      });
    }
  }

  /**
   * Marca un pedido como preparado/entregado
   * PUT /api/pedidos-cocina/:id/preparado
   */
  static async marcarPreparado(req, res) {
    try {
      const { id } = req.params;
      const pedido = await PedidosCocinaService.marcarPreparado(id);
      res.json({
        success: true,
        message: 'Pedido marcado como preparado',
        data: pedido
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al marcar pedido como preparado'
      });
    }
  }

  /**
   * Obtiene estadísticas del día
   * GET /api/pedidos-cocina/estadisticas
   */
  static async getEstadisticas(req, res) {
    try {
      const { fecha } = req.query;
      const estadisticas = await PedidosCocinaService.getEstadisticasDelDia(fecha);
      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas'
      });
    }
  }

  /**
   * Obtiene el ticket de cocina formateado para impresión
   * GET /api/pedidos-cocina/:id/ticket
   */
  static async getTicket(req, res) {
    try {
      const { id } = req.params;
      const ticketText = await PedidosCocinaService.getTicketFormateado(id);
      res.json({
        success: true,
        ticket: ticketText
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener ticket'
      });
    }
  }
}

module.exports = PedidosCocinaController;

