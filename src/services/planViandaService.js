const PlanVianda = require('../models/PlanVianda');
const { AppError } = require('../middleware/errorHandler');
const Cliente = require('../models/Cliente');
const PagoVianda = require('../models/PagoVianda');
const Venta = require('../models/Venta');
const Ticket = require('../models/Ticket');
const pool = require('../config/database');

class PlanViandaService {
  /**
   * Crea un nuevo plan de vianda
   * @param {Object} planData - Datos del plan
   * @returns {Object} Plan creado
   */
  static async create(planData, usuarioId) {
    const {
      cliente_id,
      cliente_nombre,
      cliente_telefono,
      cliente_email,
      fecha_inicio,
      fecha_fin,
      precio_mensual,
      dias_semana,
      viandas_incluidas,
      medio_pago,
      monto_pago
    } = planData;

    let clienteIdFinal = cliente_id;
    let cliente = null;

    // Si se proporcionan datos del cliente, buscar o crear
    if (cliente_nombre) {
      if (cliente_telefono) {
        // Buscar por teléfono
        cliente = await Cliente.findByTelefono(cliente_telefono);
      }
      
      if (!cliente) {
        // Crear cliente automáticamente
        cliente = await Cliente.create({
          nombre: cliente_nombre,
          telefono: cliente_telefono || null,
          email: cliente_email || null,
          tiene_vianda: true
        });
      } else {
        // Actualizar flag tiene_vianda
        await Cliente.update(cliente.id, { tiene_vianda: true });
      }
      clienteIdFinal = cliente.id;
    }

    // Validaciones
    if (!clienteIdFinal) {
      throw new AppError('El cliente es requerido', 400);
    }

    if (!fecha_inicio || !fecha_fin) {
      throw new AppError('Las fechas de inicio y fin son requeridas', 400);
    }

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      throw new AppError('La fecha de fin debe ser posterior a la fecha de inicio', 400);
    }

    if (!precio_mensual || precio_mensual <= 0) {
      throw new AppError('El precio mensual debe ser mayor a 0', 400);
    }

    if (!dias_semana || !Array.isArray(dias_semana) || dias_semana.length === 0) {
      throw new AppError('Debe especificar al menos un día de la semana', 400);
    }

    // Validar días de semana (1-7)
    const diasValidos = dias_semana.every(d => d >= 1 && d <= 7);
    if (!diasValidos) {
      throw new AppError('Los días de la semana deben ser números del 1 al 7 (1=lunes, 7=domingo)', 400);
    }

    if (!viandas_incluidas || viandas_incluidas <= 0) {
      throw new AppError('La cantidad de viandas incluidas debe ser mayor a 0', 400);
    }

    // Verificar que el cliente existe
    if (!cliente) {
      cliente = await Cliente.findById(clienteIdFinal);
      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }
    }

    // Crear plan
    const plan = await PlanVianda.create({
      cliente_id: clienteIdFinal,
      fecha_inicio,
      fecha_fin,
      precio_mensual,
      dias_semana,
      viandas_incluidas,
      viandas_adicionales: 0
    });

    // Actualizar flag tiene_vianda del cliente
    await Cliente.update(clienteIdFinal, { tiene_vianda: true });

    // Si se proporciona pago, registrarlo y generar ticket de venta
    let pago = null;
    let venta = null;
    let ticketVenta = null;

    if (medio_pago && monto_pago) {
      // Registrar pago
      pago = await PagoVianda.create({
        plan_vianda_id: plan.id,
        monto: monto_pago,
        medio_pago,
        fecha_pago: new Date().toISOString().split('T')[0],
        pagado_por_adelantado: false
      });

      // Crear venta para el ticket (tipo vianda para diferenciar)
      venta = await Venta.create({
        cliente_id: clienteIdFinal,
        usuario_id: usuarioId,
        tipo_venta: 'vianda',
        plan_vianda_id: plan.id,
        medio_pago,
        total: monto_pago,
        observaciones: `Pago plan de vianda #${plan.id}`
      });

      // Generar ticket de venta
      const fechaTicket = new Date().toISOString().split('T')[0];
      const numeroTicket = await Ticket.getSiguienteNumero('vianda', fechaTicket);
      
      ticketVenta = await Ticket.createTicketVenta({
        numero_ticket: numeroTicket,
        tipo_venta: 'vianda',
        fecha_ticket: fechaTicket,
        venta_id: venta.id,
        cliente_nombre: cliente.nombre,
        total: monto_pago,
        medio_pago
      });
    }

    return {
      plan,
      pago,
      venta,
      ticket_venta: ticketVenta
    };
  }

  /**
   * Obtiene todos los planes
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de planes
   */
  static async findAll(filters = {}) {
    return await PlanVianda.findAll(filters);
  }

  /**
   * Obtiene un plan por ID
   * @param {Number} id - ID del plan
   * @returns {Object} Plan
   */
  static async findById(id) {
    const plan = await PlanVianda.findById(id);
    if (!plan) {
      throw new AppError('Plan de vianda no encontrado', 404);
    }
    return plan;
  }

  /**
   * Actualiza un plan
   * @param {Number} id - ID del plan
   * @param {Object} planData - Datos a actualizar
   * @returns {Object} Plan actualizado
   */
  static async update(id, planData) {
    const plan = await PlanVianda.findById(id);
    if (!plan) {
      throw new AppError('Plan de vianda no encontrado', 404);
    }

    // Validar días de semana si se actualiza
    if (planData.dias_semana) {
      if (!Array.isArray(planData.dias_semana) || planData.dias_semana.length === 0) {
        throw new AppError('Debe especificar al menos un día de la semana', 400);
      }
      const diasValidos = planData.dias_semana.every(d => d >= 1 && d <= 7);
      if (!diasValidos) {
        throw new AppError('Los días de la semana deben ser números del 1 al 7 (1=lunes, 7=domingo)', 400);
      }
    }

    return await PlanVianda.update(id, planData);
  }

  /**
   * Cancela un plan
   * @param {Number} id - ID del plan
   * @returns {Object} Plan cancelado
   */
  static async cancelar(id) {
    return await this.update(id, { estado: 'cancelado' });
  }

  /**
   * Obtiene planes activos de un cliente
   * @param {Number} clienteId - ID del cliente
   * @returns {Array} Lista de planes activos
   */
  static async getPlanesActivos(clienteId) {
    return await PlanVianda.getPlanesActivos(clienteId);
  }

  /**
   * Agrega viandas adicionales a un plan
   * @param {Number} id - ID del plan
   * @param {Number} cantidad - Cantidad de viandas adicionales
   * @returns {Object} Plan actualizado
   */
  static async agregarViandasAdicionales(id, cantidad) {
    if (cantidad <= 0) {
      throw new AppError('La cantidad de viandas adicionales debe ser mayor a 0', 400);
    }

    const plan = await PlanVianda.findById(id);
    if (!plan) {
      throw new AppError('Plan de vianda no encontrado', 404);
    }

    const nuevasViandasAdicionales = (plan.viandas_adicionales || 0) + cantidad;
    return await PlanVianda.update(id, {
      viandas_adicionales: nuevasViandasAdicionales
    });
  }

  /**
   * Obtiene información completa de un plan (con pagos)
   * @param {Number} id - ID del plan
   * @returns {Object} Plan con información de pagos
   */
  static async getPlanCompleto(id) {
    const plan = await this.findById(id);
    const pagos = await PagoVianda.findByPlan(id);
    const totalPagado = await PagoVianda.calcularTotalPagado(id);

    return {
      ...plan,
      pagos,
      total_pagado: totalPagado,
      saldo_pendiente: plan.precio_mensual - totalPagado
    };
  }
}

module.exports = PlanViandaService;

