const Promocion = require('../models/Promocion');
const Producto = require('../models/Producto');
const { AppError } = require('../middleware/errorHandler');

class PromocionService {
  static _getTipoPromocion(promocion) {
    return promocion.precio_total_promo ? 'x_por_y' : 'precio_unitario';
  }

  static _calcularPrecioPromocion(productoPrecio, cantidad, promocion) {
    const cantidadMinima = parseInt(promocion.cantidad_minima, 10);
    const precioUnitarioPromo =
      promocion.precio_unitario_promo !== null && promocion.precio_unitario_promo !== undefined
        ? parseFloat(promocion.precio_unitario_promo)
        : null;
    const precioTotalPromo =
      promocion.precio_total_promo !== null && promocion.precio_total_promo !== undefined
        ? parseFloat(promocion.precio_total_promo)
        : null;

    if (precioTotalPromo !== null) {
      // Promo tipo combo (ej: 3x2): cada bloque de cantidad_minima paga precio_total_promo.
      const bloques = Math.floor(cantidad / cantidadMinima);
      const resto = cantidad % cantidadMinima;
      const total = (bloques * precioTotalPromo) + (resto * productoPrecio);
      return {
        total,
        unitarioEfectivo: total / cantidad,
        tipo_promocion: 'x_por_y'
      };
    }

    if (precioUnitarioPromo !== null) {
      const total = precioUnitarioPromo * cantidad;
      return {
        total,
        unitarioEfectivo: precioUnitarioPromo,
        tipo_promocion: 'precio_unitario'
      };
    }

    return null;
  }

  /**
   * Crea una nueva promoci?n
   * @param {Object} promocionData - Datos de la promoci?n
   * @returns {Object} Promoci?n creada
   */
  static async create(promocionData) {
    const {
      nombre,
      descripcion,
      producto_id,
      cantidad_minima,
      precio_unitario_promo,
      precio_total_promo,
      cantidad_paga,
      fecha_inicio,
      fecha_fin
    } = promocionData;

    if (!nombre || nombre.trim() === '') {
      throw new AppError('El nombre de la promoci?n es requerido', 400);
    }

    if (!producto_id) {
      throw new AppError('El producto es requerido', 400);
    }

    const producto = await Producto.findById(producto_id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    if (!cantidad_minima || cantidad_minima <= 0) {
      throw new AppError('La cantidad m?nima debe ser mayor a 0', 400);
    }

    if (!fecha_inicio || !fecha_fin) {
      throw new AppError('Las fechas de inicio y fin son requeridas', 400);
    }

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      throw new AppError('La fecha de fin debe ser posterior a la fecha de inicio', 400);
    }

    let precioUnitarioPromoFinal = precio_unitario_promo ?? null;
    let precioTotalPromoFinal = precio_total_promo ?? null;

    // Compatibilidad con payload legacy
    if (promocionData.precio_promocional !== undefined && promocionData.precio_promocional !== null) {
      precioUnitarioPromoFinal = promocionData.precio_promocional;
    }

    // Permitir crear promo X por Y sin mandar precio_total, enviando solo cantidad_paga.
    if (cantidad_paga !== undefined && cantidad_paga !== null && cantidad_paga !== '') {
      const cantidadPagaNum = parseInt(cantidad_paga, 10);
      if (isNaN(cantidadPagaNum) || cantidadPagaNum < 1) {
        throw new AppError('cantidad_paga debe ser un entero positivo', 400);
      }
      if (cantidadPagaNum >= cantidad_minima) {
        throw new AppError('En promo X por Y, la cantidad pagada debe ser menor a la cantidad m?nima', 400);
      }
      precioTotalPromoFinal = parseFloat(producto.precio) * cantidadPagaNum;
      precioUnitarioPromoFinal = null;
    }

    if (precioUnitarioPromoFinal === null && precioTotalPromoFinal === null) {
      throw new AppError('Debe indicar precio_unitario_promo o configurar promo X por Y', 400);
    }

    if (precioUnitarioPromoFinal !== null) {
      const precioUnitarioNum = parseFloat(precioUnitarioPromoFinal);
      if (isNaN(precioUnitarioNum) || precioUnitarioNum <= 0) {
        throw new AppError('El precio unitario promocional debe ser mayor a 0', 400);
      }
      if (precioUnitarioNum >= parseFloat(producto.precio)) {
        throw new AppError('El precio unitario promocional debe ser menor al precio normal del producto', 400);
      }
      precioUnitarioPromoFinal = precioUnitarioNum;
      precioTotalPromoFinal = null;
    }

    if (precioTotalPromoFinal !== null) {
      const precioTotalNum = parseFloat(precioTotalPromoFinal);
      const precioNormalBloque = parseFloat(producto.precio) * parseInt(cantidad_minima, 10);
      if (isNaN(precioTotalNum) || precioTotalNum <= 0) {
        throw new AppError('El precio total promocional debe ser mayor a 0', 400);
      }
      if (precioTotalNum >= precioNormalBloque) {
        throw new AppError('El precio total promocional debe ser menor al precio normal del bloque', 400);
      }
      precioTotalPromoFinal = precioTotalNum;
      precioUnitarioPromoFinal = null;
    }

    return await Promocion.create({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      producto_id,
      cantidad_minima,
      precio_unitario_promo: precioUnitarioPromoFinal,
      precio_total_promo: precioTotalPromoFinal,
      fecha_inicio,
      fecha_fin,
      activa: true
    });
  }

  /**
   * Obtiene todas las promociones
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} Lista de promociones
   */
  static async findAll(filters = {}) {
    return await Promocion.findAll(filters);
  }

  /**
   * Obtiene una promoci?n por ID
   * @param {Number} id - ID de la promoci?n
   * @returns {Object} Promoci?n
   */
  static async findById(id) {
    const promocion = await Promocion.findById(id);
    if (!promocion) {
      throw new AppError('Promoci?n no encontrada', 404);
    }
    return promocion;
  }

  /**
   * Actualiza una promoci?n
   * @param {Number} id - ID de la promoci?n
   * @param {Object} promocionData - Datos a actualizar
   * @returns {Object} Promoci?n actualizada
   */
  static async update(id, promocionData) {
    const promocion = await Promocion.findById(id);
    if (!promocion) {
      throw new AppError('Promoci?n no encontrada', 404);
    }

    const dataToUpdate = { ...promocionData };
    const productoId = dataToUpdate.producto_id || promocion.producto_id;
    const producto = await Producto.findById(productoId);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    const cantidadMinima = dataToUpdate.cantidad_minima || promocion.cantidad_minima;

    // Compatibilidad con payload legacy
    if (dataToUpdate.precio_promocional !== undefined && dataToUpdate.precio_promocional !== null) {
      dataToUpdate.precio_unitario_promo = dataToUpdate.precio_promocional;
      delete dataToUpdate.precio_promocional;
    }

    if (dataToUpdate.cantidad_paga !== undefined && dataToUpdate.cantidad_paga !== null && dataToUpdate.cantidad_paga !== '') {
      const cantidadPagaNum = parseInt(dataToUpdate.cantidad_paga, 10);
      if (isNaN(cantidadPagaNum) || cantidadPagaNum < 1) {
        throw new AppError('cantidad_paga debe ser un entero positivo', 400);
      }
      if (cantidadPagaNum >= cantidadMinima) {
        throw new AppError('En promo X por Y, la cantidad pagada debe ser menor a la cantidad m?nima', 400);
      }
      dataToUpdate.precio_total_promo = parseFloat(producto.precio) * cantidadPagaNum;
      dataToUpdate.precio_unitario_promo = null;
      delete dataToUpdate.cantidad_paga;
    }

    if (dataToUpdate.precio_unitario_promo !== undefined && dataToUpdate.precio_unitario_promo !== null) {
      const precioUnitarioNum = parseFloat(dataToUpdate.precio_unitario_promo);
      if (isNaN(precioUnitarioNum) || precioUnitarioNum <= 0) {
        throw new AppError('El precio unitario promocional debe ser mayor a 0', 400);
      }
      if (precioUnitarioNum >= parseFloat(producto.precio)) {
        throw new AppError('El precio unitario promocional debe ser menor al precio normal del producto', 400);
      }
      dataToUpdate.precio_unitario_promo = precioUnitarioNum;
      dataToUpdate.precio_total_promo = null;
    }

    if (dataToUpdate.precio_total_promo !== undefined && dataToUpdate.precio_total_promo !== null) {
      const precioTotalNum = parseFloat(dataToUpdate.precio_total_promo);
      const precioNormalBloque = parseFloat(producto.precio) * parseInt(cantidadMinima, 10);
      if (isNaN(precioTotalNum) || precioTotalNum <= 0) {
        throw new AppError('El precio total promocional debe ser mayor a 0', 400);
      }
      if (precioTotalNum >= precioNormalBloque) {
        throw new AppError('El precio total promocional debe ser menor al precio normal del bloque', 400);
      }
      dataToUpdate.precio_total_promo = precioTotalNum;
      dataToUpdate.precio_unitario_promo = null;
    }

    return await Promocion.update(id, dataToUpdate);
  }

  /**
   * Elimina una promoci?n
   * @param {Number} id - ID de la promoci?n
   * @returns {Boolean} True si se elimin?
   */
  static async delete(id) {
    const promocion = await Promocion.findById(id);
    if (!promocion) {
      throw new AppError('Promoci?n no encontrada', 404);
    }
    return await Promocion.delete(id);
  }

  /**
   * Desactiva una promoci?n
   * @param {Number} id - ID de la promoci?n
   * @returns {Object} Promoci?n desactivada
   */
  static async desactivar(id) {
    return await this.update(id, { activa: false });
  }

  /**
   * Obtiene promociones aplicables para un producto y cantidad
   * @param {Number} productoId - ID del producto
   * @param {Number} cantidad - Cantidad a comprar
   * @returns {Array} Lista de promociones aplicables
   */
  static async getPromocionesAplicables(productoId, cantidad) {
    return await Promocion.findAplicables(productoId, cantidad);
  }

  /**
   * Calcula el precio con promoci?n aplicada
   * @param {Number} productoId - ID del producto
   * @param {Number} cantidad - Cantidad a comprar
   * @returns {Object} Informaci?n de precio y promoci?n aplicada
   */
  static async calcularPrecioConPromocion(productoId, cantidad) {
    const producto = await Producto.findById(productoId);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    const promociones = await Promocion.findAplicables(productoId, cantidad);
    const precioNormalTotal = parseFloat(producto.precio) * cantidad;

    if (promociones.length === 0) {
      return {
        tiene_promocion: false,
        precio_unitario: parseFloat(producto.precio),
        precio_total: precioNormalTotal,
        promocion: null
      };
    }

    let mejorPrecio = precioNormalTotal;
    let mejorResultado = null;

    for (const promo of promociones) {
      const calculo = this._calcularPrecioPromocion(parseFloat(producto.precio), cantidad, promo);
      if (!calculo) continue;

      if (calculo.total < mejorPrecio) {
        mejorPrecio = calculo.total;
        mejorResultado = { promo, calculo };
      }
    }

    if (!mejorResultado) {
      return {
        tiene_promocion: false,
        precio_unitario: parseFloat(producto.precio),
        precio_total: precioNormalTotal,
        promocion: null
      };
    }

    return {
      tiene_promocion: true,
      precio_unitario: mejorResultado.calculo.unitarioEfectivo,
      precio_total: mejorResultado.calculo.total,
      precio_normal: precioNormalTotal,
      ahorro: precioNormalTotal - mejorResultado.calculo.total,
      promocion: {
        id: mejorResultado.promo.id,
        nombre: mejorResultado.promo.nombre,
        cantidad_minima: mejorResultado.promo.cantidad_minima,
        tipo_promocion: this._getTipoPromocion(mejorResultado.promo),
        precio_unitario_promo: mejorResultado.promo.precio_unitario_promo,
        precio_total_promo: mejorResultado.promo.precio_total_promo
      }
    };
  }
}

module.exports = PromocionService;

