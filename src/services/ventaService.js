const Venta = require('../models/Venta');
const DetalleVenta = require('../models/DetalleVenta');
const Ticket = require('../models/Ticket');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const PlanVianda = require('../models/PlanVianda');
const RetiroVianda = require('../models/RetiroVianda');
const PromocionService = require('./promocionService');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/database');

class VentaService {
  /**
   * Crea una venta completa (venta + detalles + tickets)
   * @param {Object} ventaData - Datos de la venta
   * @param {Number} usuarioId - ID del usuario que crea la venta
   * @returns {Object} Venta completa con detalles y tickets
   */
  static async create(ventaData, usuarioId) {
    const { tipo_venta = 'mostrador', cliente_id, nombre_cliente, plan_vianda_id, medio_pago, productos, observaciones } = ventaData;

    // Validaciones b?sicas - Solo mostrador para ventas
    if (tipo_venta !== 'mostrador') {
      throw new AppError('Las ventas solo pueden ser de tipo "mostrador"', 400);
    }

    if (!medio_pago || !['efectivo', 'transferencia'].includes(medio_pago)) {
      throw new AppError('Medio de pago inv?lido. Debe ser "efectivo" o "transferencia"', 400);
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      throw new AppError('Debe incluir al menos un producto', 400);
    }

    // Unificar productos repetidos para aplicar promociones por cantidad total del mismo producto.
    const productosConsolidadosMap = new Map();
    for (const item of productos) {
      const productoId = parseInt(item.producto_id, 10);
      const cantidad = parseInt(item.cantidad, 10);

      if (!productoId || isNaN(productoId) || productoId < 1) {
        throw new AppError('Cada producto debe tener un producto_id v?lido', 400);
      }
      if (!cantidad || isNaN(cantidad) || cantidad < 1) {
        throw new AppError('Cada producto debe tener una cantidad v?lida mayor a 0', 400);
      }

      const actual = productosConsolidadosMap.get(productoId) || 0;
      productosConsolidadosMap.set(productoId, actual + cantidad);
    }

    const productosConsolidados = Array.from(productosConsolidadosMap.entries()).map(([producto_id, cantidad]) => ({
      producto_id,
      cantidad
    }));

    // Validar cliente si se proporciona cliente_id
    let cliente = null;
    let nombreClienteFinal = nombre_cliente || null;
    
    if (cliente_id) {
      cliente = await Cliente.findById(cliente_id);
      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }
      // Si hay cliente registrado, usar su nombre (a menos que se especifique otro)
      if (!nombre_cliente) {
        nombreClienteFinal = cliente.nombre;
      }
    }

    // Validar productos y calcular total
    let total = 0;
    const detalles = [];
    const productosInfo = []; // Para guardar info de productos para la descripci?n

    for (const item of productosConsolidados) {
      const producto = await Producto.findById(item.producto_id);
      if (!producto) {
        throw new AppError(`Producto con ID ${item.producto_id} no encontrado`, 404);
      }

      if (!producto.activo) {
        throw new AppError(`El producto "${producto.nombre}" est? inactivo`, 400);
      }

      if (item.cantidad <= 0) {
        throw new AppError(`La cantidad del producto "${producto.nombre}" debe ser mayor a 0`, 400);
      }

      // Verificar si hay promoci?n aplicable
      let precioUnitario = parseFloat(producto.precio);
      let subtotal = parseFloat(producto.precio) * item.cantidad;
      let promocionAplicada = null;

      try {
        const precioConPromocion = await PromocionService.calcularPrecioConPromocion(
          item.producto_id,
          item.cantidad
        );

        if (precioConPromocion.tiene_promocion) {
          subtotal = parseFloat(precioConPromocion.precio_total);
          precioUnitario = subtotal / item.cantidad;
          promocionAplicada = precioConPromocion.promocion;
        }
      } catch (error) {
        // Si hay error al calcular promoci?n, usar precio normal
        console.warn(`Error al calcular promoci?n para producto ${item.producto_id}:`, error.message);
      }

      total += subtotal;

      detalles.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        subtotal: subtotal
      });

      // Guardar info del producto para la descripci?n
      productosInfo.push({
        producto_id: item.producto_id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        tiene_promocion: promocionAplicada !== null,
        promocion: promocionAplicada
      });
    }

    // Crear venta
    const venta = await Venta.create({
      cliente_id: cliente ? cliente.id : null,
      usuario_id: usuarioId,
      tipo_venta: 'mostrador',
      plan_vianda_id: null,
      medio_pago,
      total,
      observaciones: observaciones || null
    });

    // Crear detalles de venta
    const detallesCreados = [];
    for (const detalle of detalles) {
      const detalleCreado = await DetalleVenta.create({
        venta_id: venta.id,
        ...detalle
      });
      detallesCreados.push(detalleCreado);
    }

    // Generar tickets
    const fechaTicket = new Date().toISOString().split('T')[0];
    const numeroTicket = await Ticket.getSiguienteNumero(tipo_venta, fechaTicket);

    // Generar descripci?n del pedido para cocina con tipo
    const descripcionPedido = productosInfo.map(p => {
      return `${p.cantidad}x ${p.nombre}`;
    }).join(', ');

    // Crear ticket de venta
    const ticketVenta = await Ticket.createTicketVenta({
      numero_ticket: numeroTicket,
      tipo_venta: 'mostrador',
      fecha_ticket: fechaTicket,
      venta_id: venta.id,
      cliente_nombre: nombreClienteFinal,
      total,
      medio_pago
    });

    // Crear ticket de cocina con nombre y tipo MOSTRADOR
    const descripcionCocina = nombreClienteFinal 
      ? `Cliente: ${nombreClienteFinal}\nTipo: MOSTRADOR\nPedido: ${descripcionPedido}`
      : `Tipo: MOSTRADOR\nPedido: ${descripcionPedido}`;
    
    const ticketCocina = await Ticket.createTicketCocina({
      numero_ticket: numeroTicket,
      tipo_venta: 'mostrador',
      fecha_ticket: fechaTicket,
      venta_id: venta.id,
      cliente_nombre: nombreClienteFinal,
      descripcion_pedido: descripcionCocina
    });

    // No crear retiro de vianda (solo para ventas de mostrador)
    const retiroVianda = null;

    // Obtener venta completa con detalles
    const ventaCompleta = await Venta.findById(venta.id);
    const detalleCompleto = await Venta.getDetalle(venta.id);

    return {
      venta: ventaCompleta,
      detalles: detalleCompleto,
      ticket_venta: ticketVenta,
      ticket_cocina: ticketCocina,
      retiro_vianda: retiroVianda
    };
  }

  /**
   * Obtiene una venta por ID con todos sus detalles
   * @param {Number} id - ID de la venta
   * @returns {Object} Venta completa
   */
  static async findById(id) {
    const venta = await Venta.findById(id);
    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }

    const detalles = await Venta.getDetalle(id);
    const ticketVenta = await Ticket.getTicketVentaByVentaId(id);
    const ticketCocina = await Ticket.getTicketCocinaByVentaId(id);

    return {
      venta,
      detalles,
      ticket_venta: ticketVenta,
      ticket_cocina: ticketCocina
    };
  }

  /**
   * Obtiene todas las ventas
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de ventas
   */
  static async findAll(filters = {}) {
    return await Venta.findAll(filters);
  }

  /**
   * Obtiene ventas del d?a actual
   * @returns {Array} Lista de ventas
   */
  static async getVentasHoy() {
    return await Venta.getVentasHoy();
  }

  /**
   * Marca ticket de cocina como preparado
   * @param {Number} ventaId - ID de la venta
   * @returns {Object} Ticket actualizado
   */
  static async marcarPreparado(ventaId) {
    const venta = await Venta.findById(ventaId);
    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }
    return await Ticket.marcarPreparado(ventaId);
  }

  /**
   * Obtiene el ticket formateado como texto
   * @param {Number} id - ID de la venta
   * @returns {String} Ticket formateado
   */
  static async getTicketFormateado(id) {
    const ventaCompleta = await this.findById(id);
    if (!ventaCompleta || !ventaCompleta.venta) {
      throw new AppError('Venta no encontrada', 404);
    }

    const ticketVenta = ventaCompleta.ticket_venta;
    if (!ticketVenta) {
      throw new AppError('Ticket no encontrado', 404);
    }

    let ticket = '================================\n';
    ticket += '    SABORES DE MI TIERRA\n';
    ticket += '================================\n';
    ticket += `Ticket #${ticketVenta.numero_ticket}\n`;
    ticket += `Tipo: ${ticketVenta.tipo_venta.toUpperCase()}\n`;
    ticket += `Fecha: ${new Date(ticketVenta.fecha_emision).toLocaleString('es-AR')}\n`;
    ticket += '--------------------------------\n';
    
    if (ticketVenta.cliente_nombre) {
      ticket += `Cliente: ${ticketVenta.cliente_nombre}\n`;
      ticket += '--------------------------------\n';
    }

    ticket += 'PRODUCTOS:\n';
    ventaCompleta.detalles.forEach((detalle, index) => {
      ticket += `${index + 1}. ${detalle.nombre_producto}\n`;
      ticket += `   Cantidad: ${detalle.cantidad} x $${parseFloat(detalle.precio_unitario).toLocaleString()}\n`;
      ticket += `   Subtotal: $${parseFloat(detalle.subtotal).toLocaleString()}\n`;
    });

    ticket += '--------------------------------\n';
    ticket += `TOTAL: $${parseFloat(ticketVenta.total).toLocaleString()}\n`;
    ticket += `Medio de pago: ${ticketVenta.medio_pago.toUpperCase()}\n`;
    ticket += '================================\n';
    ticket += '     ?Gracias por su compra!\n';
    ticket += '================================\n';

    return ticket;
  }
}

module.exports = VentaService;

