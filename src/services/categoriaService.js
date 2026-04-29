const Categoria = require('../models/Categoria');
const { AppError } = require('../middleware/errorHandler');

class CategoriaService {
  /**
   * Crea una nueva categoría
   * @param {Object} categoriaData - Datos de la categoría
   * @returns {Object} Categoría creada
   */
  static async create(categoriaData) {
    const { nombre, descripcion } = categoriaData;

    // Validar que el nombre no esté vacío
    if (!nombre || nombre.trim() === '') {
      throw new AppError('El nombre de la categoría es requerido', 400);
    }

    // Verificar que no exista otra categoría con el mismo nombre
    const categoriaExistente = await Categoria.findByNombre(nombre);
    if (categoriaExistente) {
      throw new AppError('Ya existe una categoría con ese nombre', 409);
    }

    return await Categoria.create({
      nombre: nombre.trim(),
      descripcion: descripcion || null,
      activo: true
    });
  }

  /**
   * Obtiene todas las categorías
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de categorías
   */
  static async findAll(filters = {}) {
    return await Categoria.findAll(filters);
  }

  /**
   * Obtiene una categoría por ID
   * @param {Number} id - ID de la categoría
   * @returns {Object} Categoría
   */
  static async findById(id) {
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }
    return categoria;
  }

  /**
   * Actualiza una categoría
   * @param {Number} id - ID de la categoría
   * @param {Object} categoriaData - Datos a actualizar
   * @returns {Object} Categoría actualizada
   */
  static async update(id, categoriaData) {
    // Verificar que la categoría existe
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    // Si se actualiza el nombre, verificar que no exista otra con ese nombre
    if (categoriaData.nombre && categoriaData.nombre !== categoria.nombre) {
      const categoriaExistente = await Categoria.findByNombre(categoriaData.nombre);
      if (categoriaExistente && categoriaExistente.id !== id) {
        throw new AppError('Ya existe otra categoría con ese nombre', 409);
      }
    }

    return await Categoria.update(id, categoriaData);
  }

  /**
   * Elimina (desactiva) una categoría
   * @param {Number} id - ID de la categoría
   * @returns {Object} Categoría desactivada
   */
  static async delete(id) {
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }
    return await Categoria.delete(id);
  }

  /**
   * Elimina permanentemente una categoría
   * @param {Number} id - ID de la categoría
   * @returns {Object} Categoría eliminada
   */
  static async deletePermanent(id) {
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    const tieneProductos = await Categoria.hasProductos(id);
    if (tieneProductos) {
      throw new AppError(
        'No se puede eliminar permanentemente: la categoría tiene productos asociados',
        409
      );
    }

    const eliminada = await Categoria.deletePermanent(id);
    if (!eliminada) {
      throw new AppError('No se pudo eliminar la categoría', 400);
    }
    return eliminada;
  }

  /**
   * Obtiene productos de una categoría
   * @param {Number} categoriaId - ID de la categoría
   * @returns {Array} Lista de productos
   */
  static async getProductos(categoriaId) {
    const categoria = await Categoria.findById(categoriaId);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }
    return await Categoria.getProductos(categoriaId);
  }
}

module.exports = CategoriaService;

