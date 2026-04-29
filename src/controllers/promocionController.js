const PromocionService = require('../services/promocionService');

class PromocionController {
  /**
   * Crea una nueva promoción
   * POST /api/promociones
   */
  static async create(req, res) {
    try {
      const promocion = await PromocionService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Promoción creada exitosamente',
        data: promocion
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear promoción'
      });
    }
  }

  /**
   * Obtiene todas las promociones
   * GET /api/promociones
   */
  static async getAll(req, res) {
    try {
      const { activa, producto_id, vigente } = req.query;
      const filters = {};

      if (activa !== undefined) {
        filters.activa = activa === 'true';
      }
      if (producto_id) {
        filters.producto_id = parseInt(producto_id);
      }
      if (vigente === 'true') {
        filters.vigente = true;
      }

      const promociones = await PromocionService.findAll(filters);
      res.json({
        success: true,
        data: promociones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener promociones'
      });
    }
  }

  /**
   * Obtiene una promoción por ID
   * GET /api/promociones/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const promocion = await PromocionService.findById(id);
      res.json({
        success: true,
        data: promocion
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Promoción no encontrada'
      });
    }
  }

  /**
   * Actualiza una promoción
   * PUT /api/promociones/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const promocion = await PromocionService.update(id, req.body);
      res.json({
        success: true,
        message: 'Promoción actualizada exitosamente',
        data: promocion
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar promoción'
      });
    }
  }

  /**
   * Elimina una promoción
   * DELETE /api/promociones/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await PromocionService.delete(id);
      res.json({
        success: true,
        message: 'Promoción eliminada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar promoción'
      });
    }
  }

  /**
   * Desactiva una promoción
   * PUT /api/promociones/:id/desactivar
   */
  static async desactivar(req, res) {
    try {
      const { id } = req.params;
      const promocion = await PromocionService.desactivar(id);
      res.json({
        success: true,
        message: 'Promoción desactivada exitosamente',
        data: promocion
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al desactivar promoción'
      });
    }
  }

  /**
   * Obtiene promociones aplicables para un producto
   * GET /api/promociones/aplicables?producto_id=1&cantidad=3
   */
  static async getAplicables(req, res) {
    try {
      const { producto_id, cantidad } = req.query;

      if (!producto_id || !cantidad) {
        return res.status(400).json({
          success: false,
          message: 'producto_id y cantidad son requeridos'
        });
      }

      const promociones = await PromocionService.getPromocionesAplicables(
        parseInt(producto_id),
        parseInt(cantidad)
      );
      res.json({
        success: true,
        data: promociones
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener promociones aplicables'
      });
    }
  }

  /**
   * Calcula precio con promoción
   * GET /api/promociones/calcular-precio?producto_id=1&cantidad=3
   */
  static async calcularPrecio(req, res) {
    try {
      const { producto_id, cantidad } = req.query;

      if (!producto_id || !cantidad) {
        return res.status(400).json({
          success: false,
          message: 'producto_id y cantidad son requeridos'
        });
      }

      const resultado = await PromocionService.calcularPrecioConPromocion(
        parseInt(producto_id),
        parseInt(cantidad)
      );
      res.json({
        success: true,
        data: resultado
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al calcular precio'
      });
    }
  }
}

module.exports = PromocionController;

