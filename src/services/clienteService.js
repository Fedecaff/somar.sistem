const Cliente = require('../models/Cliente');
const { AppError } = require('../middleware/errorHandler');

class ClienteService {
  /**
   * Crea un nuevo cliente
   * @param {Object} clienteData - Datos del cliente
   * @returns {Object} Cliente creado
   */
  static async create(clienteData) {
    const { nombre, telefono, email, tiene_vianda } = clienteData;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      throw new AppError('El nombre del cliente es requerido', 400);
    }

    // Si tiene teléfono, verificar formato básico
    if (telefono && telefono.trim() !== '') {
      // Validación básica: al menos 8 caracteres
      if (telefono.trim().length < 8) {
        throw new AppError('El teléfono debe tener al menos 8 caracteres', 400);
      }
    }

    // Si tiene email, validar formato básico
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('El formato del email no es válido', 400);
      }
    }

    return await Cliente.create({
      nombre: nombre.trim(),
      telefono: telefono ? telefono.trim() : null,
      email: email ? email.trim() : null,
      tiene_vianda: tiene_vianda || false
    });
  }

  /**
   * Obtiene todos los clientes
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de clientes
   */
  static async findAll(filters = {}) {
    return await Cliente.findAll(filters);
  }

  /**
   * Obtiene un cliente por ID
   * @param {Number} id - ID del cliente
   * @returns {Object} Cliente
   */
  static async findById(id) {
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return cliente;
  }

  /**
   * Actualiza un cliente
   * @param {Number} id - ID del cliente
   * @param {Object} clienteData - Datos a actualizar
   * @returns {Object} Cliente actualizado
   */
  static async update(id, clienteData) {
    // Verificar que el cliente existe
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Validar email si se actualiza
    if (clienteData.email && clienteData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clienteData.email)) {
        throw new AppError('El formato del email no es válido', 400);
      }
    }

    return await Cliente.update(id, clienteData);
  }

  /**
   * Elimina (desactiva) un cliente
   * @param {Number} id - ID del cliente
   * @returns {Object} Cliente desactivado
   */
  static async delete(id) {
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return await Cliente.delete(id);
  }

  /**
   * Obtiene planes de vianda de un cliente
   * @param {Number} clienteId - ID del cliente
   * @returns {Array} Lista de planes
   */
  static async getPlanesVianda(clienteId) {
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return await Cliente.getPlanesVianda(clienteId);
  }

  /**
   * Obtiene ventas de un cliente
   * @param {Number} clienteId - ID del cliente
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de ventas
   */
  static async getVentas(clienteId, filters = {}) {
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return await Cliente.getVentas(clienteId, filters);
  }
}

module.exports = ClienteService;

