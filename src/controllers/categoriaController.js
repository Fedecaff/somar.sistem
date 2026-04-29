const CategoriaService = require('../services/categoriaService');

class CategoriaController {
  /**
   * Obtiene todas las categorías
   * GET /api/categorias
   */
  static async getAll(req, res) {
    try {
      const { activo, search } = req.query;
      const filters = {};
      
      if (activo !== undefined) {
        filters.activo = activo === 'true';
      }
      if (search) {
        filters.search = search;
      }

      const categorias = await CategoriaService.findAll(filters);
      res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener categorías'
      });
    }
  }

  /**
   * Obtiene una categoría por ID
   * GET /api/categorias/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const categoria = await CategoriaService.findById(id);
      res.json({
        success: true,
        data: categoria
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Categoría no encontrada'
      });
    }
  }

  /**
   * Crea una nueva categoría
   * POST /api/categorias
   */
  static async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre es requerido'
        });
      }

      const categoria = await CategoriaService.create({
        nombre,
        descripcion
      });

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: categoria
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear categoría'
      });
    }
  }

  /**
   * Actualiza una categoría
   * PUT /api/categorias/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const categoria = await CategoriaService.update(id, req.body);
      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: categoria
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar categoría'
      });
    }
  }

  /**
   * Elimina (desactiva) una categoría
   * DELETE /api/categorias/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await CategoriaService.delete(id);
      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar categoría'
      });
    }
  }

  /**
   * Elimina permanentemente una categoría
   * DELETE /api/categorias/:id/permanente
   */
  static async deletePermanent(req, res) {
    try {
      const { id } = req.params;
      await CategoriaService.deletePermanent(id);
      res.json({
        success: true,
        message: 'Categoría eliminada permanentemente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar permanentemente la categoría'
      });
    }
  }

  /**
   * Obtiene productos de una categoría
   * GET /api/categorias/:id/productos
   */
  static async getProductos(req, res) {
    try {
      const { id } = req.params;
      const productos = await CategoriaService.getProductos(id);
      res.json({
        success: true,
        data: productos
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Categoría no encontrada'
      });
    }
  }
}

module.exports = CategoriaController;

