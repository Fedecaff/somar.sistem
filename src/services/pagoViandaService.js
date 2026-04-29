const PagoVianda = require('../models/PagoVianda');
const PlanVianda = require('../models/PlanVianda');
const { AppError } = require('../middleware/errorHandler');

class PagoViandaService {
  /**
   * Registra un pago de plan
   * @param {Object} pagoData - Datos del pago
   * @returns {Object} Pago creado
   */
  static async create(pagoData) {
    const { plan_vianda_id, monto, medio_pago, fecha_pago, pagado_por_adelantado } = pagoData;

    // Validaciones
    if (!plan_vianda_id) {
      throw new AppError('El plan de vianda es requerido', 400);
    }

    if (!monto || monto <= 0) {
      throw new AppError('El monto debe ser mayor a 0', 400);
    }

    if (!medio_pago || !['efectivo', 'transferencia'].includes(medio_pago)) {
      throw new AppError('Medio de pago inválido. Debe ser "efectivo" o "transferencia"', 400);
    }

    // Verificar que el plan existe
    const plan = await PlanVianda.findById(plan_vianda_id);
    if (!plan) {
      throw new AppError('Plan de vianda no encontrado', 404);
    }

    return await PagoVianda.create({
      plan_vianda_id,
      monto,
      medio_pago,
      fecha_pago: fecha_pago || new Date().toISOString().split('T')[0],
      pagado_por_adelantado: pagado_por_adelantado || false
    });
  }

  /**
   * Obtiene pagos de un plan
   * @param {Number} planViandaId - ID del plan
   * @returns {Array} Lista de pagos
   */
  static async findByPlan(planViandaId) {
    const plan = await PlanVianda.findById(planViandaId);
    if (!plan) {
      throw new AppError('Plan de vianda no encontrado', 404);
    }
    return await PagoVianda.findByPlan(planViandaId);
  }

  /**
   * Calcula el total pagado de un plan
   * @param {Number} planViandaId - ID del plan
   * @returns {Number} Total pagado
   */
  static async calcularTotalPagado(planViandaId) {
    return await PagoVianda.calcularTotalPagado(planViandaId);
  }

  /**
   * Obtiene un pago por ID
   * @param {Number} id - ID del pago
   * @returns {Object} Pago
   */
  static async findById(id) {
    const pago = await PagoVianda.findById(id);
    if (!pago) {
      throw new AppError('Pago no encontrado', 404);
    }
    return pago;
  }
}

module.exports = PagoViandaService;

