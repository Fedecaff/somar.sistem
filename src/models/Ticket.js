const pool = require('../config/database');

class Ticket {
  /**
   * Obtiene el siguiente número de ticket
   * @param {String} tipoVenta - 'mostrador' o 'vianda'
   * @param {Date} fecha - Fecha del ticket
   * @returns {Number} Siguiente número de ticket
   */
  static async getSiguienteNumero(tipoVenta, fecha) {
    const query = `
      SELECT obtener_siguiente_numero_ticket($1, $2) as siguiente_numero
    `;
    const result = await pool.query(query, [tipoVenta, fecha]);
    return result.rows[0].siguiente_numero;
  }

  /**
   * Crea un ticket de venta
   * @param {Object} ticketData - Datos del ticket
   * @returns {Object} Ticket creado
   */
  static async createTicketVenta(ticketData) {
    const {
      numero_ticket,
      tipo_venta,
      fecha_ticket,
      venta_id,
      cliente_nombre,
      total,
      medio_pago
    } = ticketData;

    const query = `
      INSERT INTO tickets_venta (
        numero_ticket, tipo_venta, fecha_ticket, venta_id,
        cliente_nombre, total, medio_pago
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      numero_ticket,
      tipo_venta,
      fecha_ticket,
      venta_id,
      cliente_nombre || null,
      total,
      medio_pago
    ]);
    return result.rows[0];
  }

  /**
   * Crea un ticket de cocina
   * @param {Object} ticketData - Datos del ticket
   * @returns {Object} Ticket creado
   */
  static async createTicketCocina(ticketData) {
    const {
      numero_ticket,
      tipo_venta,
      fecha_ticket,
      venta_id,
      cliente_nombre,
      descripcion_pedido
    } = ticketData;

    const query = `
      INSERT INTO tickets_cocina (
        numero_ticket, tipo_venta, fecha_ticket, venta_id,
        cliente_nombre, descripcion_pedido
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      numero_ticket,
      tipo_venta,
      fecha_ticket,
      venta_id,
      cliente_nombre || null,
      descripcion_pedido
    ]);
    return result.rows[0];
  }

  /**
   * Obtiene un ticket de venta por ID de venta
   * @param {Number} ventaId - ID de la venta
   * @returns {Object|null} Ticket encontrado o null
   */
  static async getTicketVentaByVentaId(ventaId) {
    const query = 'SELECT * FROM tickets_venta WHERE venta_id = $1';
    const result = await pool.query(query, [ventaId]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene un ticket de cocina por ID de venta
   * @param {Number} ventaId - ID de la venta
   * @returns {Object|null} Ticket encontrado o null
   */
  static async getTicketCocinaByVentaId(ventaId) {
    const query = 'SELECT * FROM tickets_cocina WHERE venta_id = $1';
    const result = await pool.query(query, [ventaId]);
    return result.rows[0] || null;
  }

  /**
   * Marca un ticket de cocina como preparado
   * @param {Number} ventaId - ID de la venta
   * @returns {Object} Ticket actualizado
   */
  static async marcarPreparado(ventaId) {
    const query = `
      UPDATE tickets_cocina
      SET preparado = TRUE
      WHERE venta_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [ventaId]);
    return result.rows[0];
  }
}

module.exports = Ticket;

