const ClienteService = require('../services/clienteService');

class ClienteController {
  /**
   * Obtiene todos los clientes
   * GET /api/clientes
   */
  static async getAll(req, res) {
    try {
      const { activo, tiene_vianda, search } = req.query;
      const filters = {};

      if (activo !== undefined) {
        filters.activo = activo === 'true';
      }
      if (tiene_vianda !== undefined) {
        filters.tiene_vianda = tiene_vianda === 'true';
      }
      if (search) {
        filters.search = search;
      }

      const clientes = await ClienteService.findAll(filters);
      res.json({
        success: true,
        data: clientes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener clientes'
      });
    }
  }

  /**
   * Obtiene un cliente por ID
   * GET /api/clientes/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const cliente = await ClienteService.findById(id);
      res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Cliente no encontrado'
      });
    }
  }

  /**
   * Crea un nuevo cliente
   * POST /api/clientes
   */
  static async create(req, res) {
    try {
      const cliente = await ClienteService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: cliente
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear cliente'
      });
    }
  }

  /**
   * Actualiza un cliente
   * PUT /api/clientes/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const cliente = await ClienteService.update(id, req.body);
      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: cliente
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar cliente'
      });
    }
  }

  /**
   * Elimina (desactiva) un cliente
   * DELETE /api/clientes/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await ClienteService.delete(id);
      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar cliente'
      });
    }
  }

  /**
   * Obtiene planes de vianda de un cliente
   * GET /api/clientes/:id/planes-vianda
   */
  static async getPlanesVianda(req, res) {
    try {
      const { id } = req.params;
      const planes = await ClienteService.getPlanesVianda(id);
      res.json({
        success: true,
        data: planes
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Cliente no encontrado'
      });
    }
  }

  /**
   * Obtiene ventas de un cliente
   * GET /api/clientes/:id/ventas
   */
  static async getVentas(req, res) {
    try {
      const { id } = req.params;
      const { fecha_inicio, fecha_fin } = req.query;
      const filters = {};
      
      if (fecha_inicio) filters.fecha_inicio = fecha_inicio;
      if (fecha_fin) filters.fecha_fin = fecha_fin;

      const ventas = await ClienteService.getVentas(id, filters);
      res.json({
        success: true,
        data: ventas
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Cliente no encontrado'
      });
    }
  }
}

module.exports = ClienteController;

