const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const { AppError } = require('../middleware/errorHandler');

class ProductoService {
  /**
   * Crea un nuevo producto
   * @param {Object} productoData - Datos del producto
   * @returns {Object} Producto creado
   */
  static async create(productoData) {
    const { nombre, precio, categoria_id } = productoData;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      throw new AppError('El nombre del producto es requerido', 400);
    }

    if (precio === undefined || precio === null) {
      throw new AppError('El precio es requerido', 400);
    }

    if (precio < 0) {
      throw new AppError('El precio no puede ser negativo', 400);
    }

    // Si tiene categoría, verificar que existe
    if (categoria_id) {
      const categoria = await Categoria.findById(categoria_id);
      if (!categoria) {
        throw new AppError('La categoría especificada no existe', 404);
      }
      if (!categoria.activo) {
        throw new AppError('La categoría especificada está inactiva', 400);
      }
    }

    return await Producto.create(productoData);
  }

  /**
   * Obtiene todos los productos
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de productos
   */
  static async findAll(filters = {}) {
    return await Producto.findAll(filters);
  }

  /**
   * Obtiene un producto por ID
   * @param {Number} id - ID del producto
   * @returns {Object} Producto
   */
  static async findById(id) {
    const producto = await Producto.findById(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return producto;
  }

  /**
   * Actualiza un producto
   * @param {Number} id - ID del producto
   * @param {Object} productoData - Datos a actualizar
   * @returns {Object} Producto actualizado
   */
  static async update(id, productoData) {
    // Verificar que el producto existe
    const producto = await Producto.findById(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    // Validar precio si se actualiza
    if (productoData.precio !== undefined && productoData.precio < 0) {
      throw new AppError('El precio no puede ser negativo', 400);
    }

    // Si se actualiza la categoría, verificar que existe
    if (productoData.categoria_id !== undefined && productoData.categoria_id) {
      const categoria = await Categoria.findById(productoData.categoria_id);
      if (!categoria) {
        throw new AppError('La categoría especificada no existe', 404);
      }
      if (!categoria.activo) {
        throw new AppError('La categoría especificada está inactiva', 400);
      }
    }

    return await Producto.update(id, productoData);
  }

  /**
   * Elimina (desactiva) un producto
   * @param {Number} id - ID del producto
   * @returns {Object} Producto desactivado
   */
  static async delete(id) {
    const producto = await Producto.findById(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return await Producto.delete(id);
  }

  /**
   * Elimina permanentemente un producto
   * @param {Number} id - ID del producto
   * @returns {Object} Producto eliminado
   */
  static async deletePermanent(id) {
    const producto = await Producto.findById(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    if (producto.activo) {
      throw new AppError(
        'Solo se puede eliminar permanentemente un producto inactivo. Primero desactívalo.',
        409
      );
    }

    const tieneDependencias = await Producto.hasDependenciasHistoricas(id);
    if (tieneDependencias) {
      throw new AppError(
        'No se puede eliminar permanentemente: el producto ya tiene historial en ventas o retiros',
        409
      );
    }

    const eliminado = await Producto.deletePermanent(id);
    if (!eliminado) {
      throw new AppError('No se pudo eliminar el producto', 400);
    }

    return eliminado;
  }

  /**
   * Obtiene el historial de precios de un producto
   * @param {Number} productoId - ID del producto
   * @returns {Array} Historial de precios
   */
  static async getHistorialPrecios(productoId) {
    const producto = await Producto.findById(productoId);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return await Producto.getHistorialPrecios(productoId);
  }
}

module.exports = ProductoService;

