const ProductoService = require('../services/productoService');

class ProductoController {
  /**
   * Obtiene todos los productos
   * GET /api/productos
   */
  static async getAll(req, res) {
    try {
      const { activo, categoria_id, es_menu_fijo, solo_mostrador, search } = req.query;
      const filters = {};

      if (activo !== undefined) {
        filters.activo = activo === 'true';
      }
      if (categoria_id) {
        filters.categoria_id = parseInt(categoria_id);
      }
      if (es_menu_fijo !== undefined) {
        filters.es_menu_fijo = es_menu_fijo === 'true';
      }
      if (solo_mostrador !== undefined) {
        filters.solo_mostrador = solo_mostrador === 'true';
      }
      if (search) {
        filters.search = search;
      }

      const productos = await ProductoService.findAll(filters);
      res.json({
        success: true,
        data: productos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener productos'
      });
    }
  }

  /**
   * Obtiene un producto por ID
   * GET /api/productos/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await ProductoService.findById(id);
      res.json({
        success: true,
        data: producto
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Producto no encontrado'
      });
    }
  }

  /**
   * Crea un nuevo producto
   * POST /api/productos
   */
  static async create(req, res) {
    try {
      const producto = await ProductoService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: producto
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear producto'
      });
    }
  }

  /**
   * Actualiza un producto
   * PUT /api/productos/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const producto = await ProductoService.update(id, req.body);
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: producto
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar producto'
      });
    }
  }

  /**
   * Elimina (desactiva) un producto
   * DELETE /api/productos/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await ProductoService.delete(id);
      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar producto'
      });
    }
  }

  /**
   * Elimina permanentemente un producto
   * DELETE /api/productos/:id/permanente
   */
  static async deletePermanent(req, res) {
    try {
      const { id } = req.params;
      await ProductoService.deletePermanent(id);
      res.json({
        success: true,
        message: 'Producto eliminado permanentemente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar permanentemente el producto'
      });
    }
  }

  /**
   * Obtiene historial de precios de un producto
   * GET /api/productos/:id/historial-precios
   */
  static async getHistorialPrecios(req, res) {
    try {
      const { id } = req.params;
      const historial = await ProductoService.getHistorialPrecios(id);
      res.json({
        success: true,
        data: historial
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Producto no encontrado'
      });
    }
  }
}

module.exports = ProductoController;

