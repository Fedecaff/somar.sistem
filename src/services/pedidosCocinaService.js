const Ticket = require('../models/Ticket');
const pool = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class PedidosCocinaService {
  /**
   * Obtiene todos los pedidos de cocina del día
   * @param {Date} fecha - Fecha (opcional, por defecto hoy)
   * @returns {Array} Lista de pedidos
   */
  static async getPedidosDelDia(fecha = null) {
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        tc.id,
        tc.numero_ticket,
        tc.tipo_venta,
        tc.fecha_ticket,
        tc.cliente_nombre,
        tc.descripcion_pedido,
        tc.fecha_emision,
        tc.preparado,
        tc.venta_id,
        CASE 
          WHEN tc.venta_id IS NOT NULL THEN v.total
          ELSE NULL
        END as total_venta
      FROM tickets_cocina tc
      LEFT JOIN ventas v ON tc.venta_id = v.id
      WHERE tc.fecha_ticket = $1
      ORDER BY tc.fecha_emision ASC
    `;
    
    const result = await pool.query(query, [fechaConsulta]);
    return result.rows;
  }

  /**
   * Obtiene un pedido por ID
   * @param {Number} id - ID del ticket de cocina
   * @returns {Object} Pedido
   */
  static async getPedidoById(id) {
    const query = `
      SELECT 
        tc.*,
        v.total as total_venta,
        v.medio_pago
      FROM tickets_cocina tc
      LEFT JOIN ventas v ON tc.venta_id = v.id
      WHERE tc.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new AppError('Pedido no encontrado', 404);
    }
    return result.rows[0];
  }

  /**
   * Marca un pedido como preparado/entregado
   * @param {Number} id - ID del ticket de cocina
   * @returns {Object} Pedido actualizado
   */
  static async marcarPreparado(id) {
    const query = `
      UPDATE tickets_cocina
      SET preparado = TRUE
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new AppError('Pedido no encontrado', 404);
    }
    return result.rows[0];
  }

  /**
   * Obtiene estadísticas del día
   * @param {Date} fecha - Fecha (opcional, por defecto hoy)
   * @returns {Object} Estadísticas
   */
  static async getEstadisticasDelDia(fecha = null) {
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE preparado = TRUE) as pedidos_preparados,
        COUNT(*) FILTER (WHERE preparado = FALSE) as pedidos_pendientes,
        COUNT(*) FILTER (WHERE tipo_venta = 'mostrador') as pedidos_mostrador,
        COUNT(*) FILTER (WHERE tipo_venta = 'vianda') as pedidos_vianda
      FROM tickets_cocina
      WHERE fecha_ticket = $1
    `;
    
    const result = await pool.query(query, [fechaConsulta]);
    return result.rows[0];
  }

  /**
   * Obtiene el ticket de cocina formateado para impresión
   * @param {Number} id - ID del ticket de cocina
   * @returns {String} Ticket formateado
   */
  static async getTicketFormateado(id) {
    const pedido = await this.getPedidoById(id);
    
    if (!pedido) {
      throw new AppError('Pedido no encontrado', 404);
    }

    // Formatear el ticket
    let ticketText = `
----------------------------------------
        SABORES DE MI TIERRA
----------------------------------------
Ticket Cocina #${pedido.numero_ticket} - ${pedido.tipo_venta.toUpperCase()}
Fecha: ${new Date(pedido.fecha_emision).toLocaleString()}
`;

    if (pedido.cliente_nombre) {
      ticketText += `Cliente: ${pedido.cliente_nombre}\n`;
    }

    ticketText += `
----------------------------------------
${pedido.descripcion_pedido}
----------------------------------------
`;

    if (pedido.total_venta) {
      ticketText += `Total: $${parseFloat(pedido.total_venta).toFixed(2)}\n`;
      if (pedido.medio_pago) {
        ticketText += `Medio de Pago: ${pedido.medio_pago.toUpperCase()}\n`;
      }
    }

    ticketText += `
Estado: ${pedido.preparado ? 'PREPARADO' : 'PENDIENTE'}
----------------------------------------
`;

    return ticketText;
  }
}

module.exports = PedidosCocinaService;

