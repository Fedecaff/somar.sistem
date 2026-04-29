const RetiroVianda = require('../models/RetiroVianda');
const PlanVianda = require('../models/PlanVianda');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Ticket = require('../models/Ticket');
const Venta = require('../models/Venta');
const DetalleVenta = require('../models/DetalleVenta');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/database');

class RetiroViandaService {
  /**
   * Registra un retiro de vianda con múltiples productos
   * @param {Object} retiroData - Datos del retiro
   * @param {Number} usuarioId - ID del usuario que registra
   * @returns {Object} Retiros creados y ticket de cocina
   */
  static async create(retiroData, usuarioId) {
    const { plan_vianda_id, fecha_retiro, productos, observaciones } = retiroData;

    // Validar que el plan existe y está activo
    const plan = await PlanVianda.findById(plan_vianda_id);
    if (!plan) {
      throw new AppError('Plan de vianda no encontrado', 404);
    }

    if (plan.estado !== 'activo') {
      throw new AppError('El plan de vianda no está activo', 400);
    }

    // Obtener cliente
    const cliente = await Cliente.findById(plan.cliente_id);
    if (!cliente) {
      throw new AppError('Cliente del plan no encontrado', 404);
    }

    // Validar que la fecha esté dentro del rango del plan
    // Convertir fechas a strings YYYY-MM-DD para comparar solo la parte de fecha
    const fechaRetiroStr = typeof fecha_retiro === 'string' 
      ? fecha_retiro.split('T')[0] 
      : new Date(fecha_retiro).toISOString().split('T')[0];
    
    const fechaInicioStr = plan.fecha_inicio instanceof Date
      ? plan.fecha_inicio.toISOString().split('T')[0]
      : typeof plan.fecha_inicio === 'string'
      ? plan.fecha_inicio.split('T')[0]
      : new Date(plan.fecha_inicio).toISOString().split('T')[0];
    
    const fechaFinStr = plan.fecha_fin instanceof Date
      ? plan.fecha_fin.toISOString().split('T')[0]
      : typeof plan.fecha_fin === 'string'
      ? plan.fecha_fin.split('T')[0]
      : new Date(plan.fecha_fin).toISOString().split('T')[0];

    // Permitir retirar desde el día de inicio inclusive hasta el día de fin inclusive
    if (fechaRetiroStr < fechaInicioStr || fechaRetiroStr > fechaFinStr) {
      throw new AppError('La fecha de retiro está fuera del rango del plan', 400);
    }

    // Validar que el día de la semana esté en los días configurados
    const fechaRetiroDate = new Date(fechaRetiroStr + 'T00:00:00');
    const diaSemana = fechaRetiroDate.getDay() === 0 ? 7 : fechaRetiroDate.getDay(); // 1=lunes, 7=domingo
    const diasSemanaPlan = Array.isArray(plan.dias_semana)
      ? plan.dias_semana.map(dia => Number(dia))
      : [];
    if (!diasSemanaPlan.includes(diaSemana)) {
      throw new AppError('El día de retiro no está configurado en el plan', 400);
    }

    // Validar productos
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      throw new AppError('Debe incluir al menos un producto', 400);
    }

    // Validar y obtener información de productos
    const productosInfo = [];
    let cantidadTotal = 0;

    for (const item of productos) {
      const producto = await Producto.findById(item.producto_id);
      if (!producto) {
        throw new AppError(`Producto con ID ${item.producto_id} no encontrado`, 404);
      }
      if (!producto.activo) {
        throw new AppError(`El producto "${producto.nombre}" está inactivo`, 400);
      }
      const cantidad = parseInt(item.cantidad) || 1;
      cantidadTotal += cantidad;
      productosInfo.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad
      });
    }

    // Contar retiros ya realizados hoy
    const retirosHoy = await RetiroVianda.contarRetirosRealizados(plan_vianda_id, fecha_retiro);
    const viandasDisponibles = plan.viandas_incluidas - retirosHoy;

    // Separar productos en viandas incluidas y extras
    let productosVianda = [];
    let productosExtras = [];
    let cantidadVianda = 0;
    let cantidadExtras = 0;

    for (const producto of productosInfo) {
      if (cantidadVianda < viandasDisponibles) {
        const cantidadParaVianda = Math.min(producto.cantidad, viandasDisponibles - cantidadVianda);
        if (cantidadParaVianda > 0) {
          productosVianda.push({ ...producto, cantidad: cantidadParaVianda });
          cantidadVianda += cantidadParaVianda;
        }
        const cantidadRestante = producto.cantidad - cantidadParaVianda;
        if (cantidadRestante > 0) {
          productosExtras.push({ ...producto, cantidad: cantidadRestante });
          cantidadExtras += cantidadRestante;
        }
      } else {
        productosExtras.push(producto);
        cantidadExtras += producto.cantidad;
      }
    }

    // Crear retiros de vianda (uno por producto)
    const retirosCreados = [];
    for (const producto of productosVianda) {
      for (let i = 0; i < producto.cantidad; i++) {
        const retiro = await RetiroVianda.create({
          plan_vianda_id,
          venta_id: null,
          fecha_retiro,
          producto_solicitado_id: producto.producto_id,
          observaciones: observaciones || null
        });
        retirosCreados.push(retiro);
      }
    }

    // Si hay productos extras, crear venta de mostrador
    let ventaExtra = null;
    let ticketCocinaExtra = null;
    if (productosExtras.length > 0) {
      // Calcular total de la venta extra
      let totalExtra = 0;
      const detallesExtra = [];
      
      for (const producto of productosExtras) {
        const productoInfo = await Producto.findById(producto.producto_id);
        const precio = parseFloat(productoInfo.precio);
        const subtotal = precio * producto.cantidad;
        totalExtra += subtotal;
        
        detallesExtra.push({
          producto_id: producto.producto_id,
          cantidad: producto.cantidad,
          precio_unitario: precio,
          subtotal
        });
      }

      // Crear venta de mostrador para los extras
      ventaExtra = await Venta.create({
        cliente_id: plan.cliente_id,
        usuario_id: usuarioId,
        tipo_venta: 'mostrador',
        plan_vianda_id: null,
        medio_pago: 'efectivo', // Por defecto, se puede cambiar después
        total: totalExtra,
        observaciones: `Viandas extras del plan #${plan.id}`
      });

      // Crear detalles de venta
      for (const detalle of detallesExtra) {
        await DetalleVenta.create({
          venta_id: ventaExtra.id,
          ...detalle
        });
      }

      // Generar ticket de cocina para extras
      const fechaTicket = new Date().toISOString().split('T')[0];
      const numeroTicketExtra = await Ticket.getSiguienteNumero('mostrador', fechaTicket);
      
      const descripcionExtra = productosExtras.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
      const descripcionCocinaExtra = `Cliente: ${cliente.nombre}\nTipo: MOSTRADOR (Extras)\nPedido: ${descripcionExtra}`;
      
      ticketCocinaExtra = await Ticket.createTicketCocina({
        numero_ticket: numeroTicketExtra,
        tipo_venta: 'mostrador',
        fecha_ticket: fechaTicket,
        venta_id: ventaExtra.id,
        cliente_nombre: cliente.nombre,
        descripcion_pedido: descripcionCocinaExtra
      });
    }

    // Generar ticket de cocina para viandas (un solo ticket con todos los productos)
    const fechaTicket = new Date().toISOString().split('T')[0];
    const numeroTicket = await Ticket.getSiguienteNumero('vianda', fechaTicket);
    
    const descripcionPedido = productosInfo.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
    // Para viandas, no incluir el nombre del cliente en el cuerpo (ya está en la cabecera)
    const descripcionCocina = `Pedido: ${descripcionPedido}`;
    
    // Crear ticket de cocina (sin venta_id porque no hay venta para retiros de vianda)
    const ticketCocina = await Ticket.createTicketCocina({
      numero_ticket: numeroTicket,
      tipo_venta: 'vianda',
      fecha_ticket: fechaTicket,
      venta_id: null, // No hay venta para retiros de vianda
      cliente_nombre: cliente.nombre,
      descripcion_pedido: descripcionCocina
    });

    return {
      retiros: retirosCreados,
      ticket_cocina: ticketCocina,
      venta_extra: ventaExtra,
      ticket_cocina_extra: ticketCocinaExtra,
      productos_vianda: productosVianda.length,
      productos_extras: productosExtras.length
    };
  }

  /**
   * Marca un retiro como retirado (esto activa la validación del límite)
   * @param {Number} id - ID del retiro
   * @returns {Object} Retiro actualizado
   */
  static async marcarRetirado(id) {
    const retiro = await RetiroVianda.findById(id);
    if (!retiro) {
      throw new AppError('Retiro no encontrado', 404);
    }

    if (retiro.retirado) {
      throw new AppError('El retiro ya fue marcado como retirado', 400);
    }

    // Al actualizar retirado = TRUE, el trigger validará el límite
    return await RetiroVianda.marcarRetirado(id);
  }

  /**
   * Obtiene todos los retiros
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de retiros
   */
  static async findAll(filters = {}) {
    return await RetiroVianda.findAll(filters);
  }

  /**
   * Obtiene un retiro por ID
   * @param {Number} id - ID del retiro
   * @returns {Object} Retiro
   */
  static async findById(id) {
    const retiro = await RetiroVianda.findById(id);
    if (!retiro) {
      throw new AppError('Retiro no encontrado', 404);
    }
    return retiro;
  }

  /**
   * Consulta retiros disponibles de un plan
   * @param {Number} planViandaId - ID del plan
   * @param {Date} fecha - Fecha (opcional, por defecto hoy)
   * @returns {Object} Información de retiros disponibles
   */
  static async consultarRetirosDisponibles(planViandaId, fecha = null) {
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    const query = 'SELECT * FROM consultar_retiros_disponibles($1, $2)';
    const result = await pool.query(query, [planViandaId, fechaConsulta]);
    return result.rows[0];
  }

  /**
   * Obtiene retiros de un plan por fecha
   * @param {Number} planViandaId - ID del plan
   * @param {Date} fecha - Fecha
   * @returns {Array} Lista de retiros
   */
  static async getRetirosPorFecha(planViandaId, fecha) {
    return await RetiroVianda.getRetirosPorFecha(planViandaId, fecha);
  }
}

module.exports = RetiroViandaService;

