const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');

/**
 * Middleware para validar resultados de express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param || err.location,
      message: err.msg
    }));
    
    // Crear mensaje detallado con todos los errores
    const detailedMessage = errorMessages.map(e => `${e.field}: ${e.message}`).join(', ');
    
    const error = new AppError(
      `Error de validación: ${detailedMessage}`,
      400,
      'VALIDATION_ERROR'
    );
    error.details = errorMessages;
    throw error;
  }
  next();
};

/**
 * Validadores para Productos
 */
const validarProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('precio')
    .notEmpty().withMessage('El precio es requerido')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('categoria_id')
    .optional()
    .isInt({ min: 1 }).withMessage('La categoría debe ser un ID válido'),
  body('es_menu_fijo')
    .optional()
    .isBoolean().withMessage('es_menu_fijo debe ser true o false'),
  body('solo_mostrador')
    .optional()
    .isBoolean().withMessage('solo_mostrador debe ser true o false'),
  body('tiene_control_stock')
    .optional()
    .isBoolean().withMessage('tiene_control_stock debe ser true o false'),
  body('cantidad_disponible')
    .optional()
    .isInt({ min: 0 }).withMessage('cantidad_disponible debe ser un entero mayor o igual a 0'),
  body('cantidad_minima')
    .optional()
    .isInt({ min: 0 }).withMessage('cantidad_minima debe ser un entero mayor o igual a 0'),
  validate
];

const validarProductoUpdate = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('precio')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('categoria_id')
    .optional()
    .isInt({ min: 1 }).withMessage('La categoría debe ser un ID válido'),
  body('es_menu_fijo')
    .optional()
    .isBoolean().withMessage('es_menu_fijo debe ser true o false'),
  body('solo_mostrador')
    .optional()
    .isBoolean().withMessage('solo_mostrador debe ser true o false'),
  body('tiene_control_stock')
    .optional()
    .isBoolean().withMessage('tiene_control_stock debe ser true o false'),
  body('cantidad_disponible')
    .optional()
    .isInt({ min: 0 }).withMessage('cantidad_disponible debe ser un entero mayor o igual a 0'),
  body('cantidad_minima')
    .optional()
    .isInt({ min: 0 }).withMessage('cantidad_minima debe ser un entero mayor o igual a 0'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false'),
  validate
];

/**
 * Validadores para Categorías
 */
const validarCategoria = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres'),
  validate
];

const validarCategoriaUpdate = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false'),
  validate
];

/**
 * Validadores para Clientes
 */
const validarCliente = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('telefono')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true; // Permitir vacío o null
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // Validar formato solo si hay valor
    })
    .withMessage('El email debe tener un formato válido'),
  body('tiene_vianda')
    .optional()
    .isBoolean().withMessage('tiene_vianda debe ser true o false'),
  validate
];

/**
 * Validadores para Ventas
 */
const validarVenta = [
  body('tipo_venta')
    .optional()
    .isIn(['mostrador']).withMessage('Las ventas solo pueden ser de tipo "mostrador"'),
  body('medio_pago')
    .notEmpty().withMessage('El medio de pago es requerido')
    .isIn(['efectivo', 'transferencia']).withMessage('El medio de pago debe ser "efectivo" o "transferencia"'),
  body('productos')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto')
    .custom((productos) => {
      for (const producto of productos) {
        const productoId = parseInt(producto.producto_id);
        const cantidad = parseInt(producto.cantidad);
        
        if (!producto.producto_id || isNaN(productoId) || productoId < 1) {
          throw new Error('Cada producto debe tener un producto_id válido');
        }
        if (!producto.cantidad || isNaN(cantidad) || cantidad < 1) {
          throw new Error('Cada producto debe tener una cantidad válida mayor a 0');
        }
      }
      return true;
    }),
  body('nombre_cliente')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre del cliente no puede exceder 100 caracteres'),
  body('cliente_id')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir null, undefined o vacío
      }
      const clienteId = parseInt(value);
      if (isNaN(clienteId) || clienteId < 1) {
        throw new Error('El cliente_id debe ser un número entero positivo');
      }
      return true;
    }),
  validate
];

/**
 * Validadores para Promociones
 */
const validarPromocion = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('producto_id')
    .notEmpty().withMessage('El producto es requerido')
    .isInt({ min: 1 }).withMessage('El producto_id debe ser un número entero positivo'),
  body('cantidad_minima')
    .notEmpty().withMessage('La cantidad mínima es requerida')
    .isInt({ min: 1 }).withMessage('La cantidad mínima debe ser mayor a 0'),
  body('precio_unitario_promo')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('El precio unitario promocional debe ser un número positivo'),
  body('precio_total_promo')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('El precio total promocional debe ser un número positivo'),
  body('cantidad_paga')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('cantidad_paga debe ser un entero positivo'),
  body()
    .custom((value) => {
      const tieneUnitario = value.precio_unitario_promo !== undefined && value.precio_unitario_promo !== null && value.precio_unitario_promo !== '';
      const tieneTotal = value.precio_total_promo !== undefined && value.precio_total_promo !== null && value.precio_total_promo !== '';
      const tieneCantidadPaga = value.cantidad_paga !== undefined && value.cantidad_paga !== null && value.cantidad_paga !== '';
      const tieneLegacy = value.precio_promocional !== undefined && value.precio_promocional !== null && value.precio_promocional !== '';

      if (!(tieneUnitario || tieneTotal || tieneCantidadPaga || tieneLegacy)) {
        throw new Error('Debe indicar precio_unitario_promo o configurar promo X por Y');
      }
      return true;
    }),
  body('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es requerida')
    .isISO8601().withMessage('La fecha de inicio debe tener formato YYYY-MM-DD'),
  body('fecha_fin')
    .notEmpty().withMessage('La fecha de fin es requerida')
    .isISO8601().withMessage('La fecha de fin debe tener formato YYYY-MM-DD')
    .custom((fechaFin, { req }) => {
      if (req.body.fecha_inicio && new Date(fechaFin) <= new Date(req.body.fecha_inicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  validate
];

/**
 * Validadores para Planes de Vianda
 */
const validarPlanVianda = [
  body('cliente_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('El cliente_id debe ser un número entero positivo'),
  body('cliente_nombre')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value, { req }) => {
      // Si se proporciona cliente_nombre, debe tener longitud válida
      if (value && value !== '') {
        if (value.length < 2 || value.length > 100) {
          throw new Error('El nombre del cliente debe tener entre 2 y 100 caracteres');
        }
      }
      // Validar que haya cliente_id o cliente_nombre
      if (!req.body.cliente_id && (!value || value === '')) {
        throw new Error('Debe proporcionar cliente_id o datos del cliente (cliente_nombre)');
      }
      return true;
    }),
  body('cliente_telefono')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('cliente_email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true; // Permitir vacío o null
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // Validar formato solo si hay valor
    })
    .withMessage('El email debe tener un formato válido'),
  body('medio_pago')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['efectivo', 'transferencia']).withMessage('El medio de pago debe ser "efectivo" o "transferencia"'),
  body('monto_pago')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('El monto del pago debe ser un número positivo'),
  body('viandas_incluidas')
    .notEmpty().withMessage('Las viandas incluidas son requeridas')
    .isInt({ min: 1 }).withMessage('Las viandas incluidas deben ser mayor a 0'),
  body('viandas_adicionales')
    .optional()
    .isInt({ min: 0 }).withMessage('Las viandas adicionales no pueden ser negativas'),
  body('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es requerida')
    .isISO8601().withMessage('La fecha de inicio debe tener formato YYYY-MM-DD'),
  body('fecha_fin')
    .notEmpty().withMessage('La fecha de fin es requerida')
    .isISO8601().withMessage('La fecha de fin debe tener formato YYYY-MM-DD')
    .custom((fechaFin, { req }) => {
      if (req.body.fecha_inicio && new Date(fechaFin) <= new Date(req.body.fecha_inicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('dias_semana')
    .isArray({ min: 1 }).withMessage('Debe especificar al menos un día de la semana')
    .custom((dias) => {
      const diasValidos = [1, 2, 3, 4, 5, 6, 7];
      for (const dia of dias) {
        if (!diasValidos.includes(dia)) {
          throw new Error('Los días de la semana deben ser números del 1 al 7');
        }
      }
      return true;
    }),
  body('precio_mensual')
    .notEmpty().withMessage('El precio mensual es requerido')
    .isFloat({ min: 0 }).withMessage('El precio mensual debe ser un número positivo'),
  validate
];

/**
 * Validadores para parámetros de ID
 */
const validarId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  validate
];

/**
 * Validadores para fechas en reportes
 */
const validarFechasReporte = [
  query('fecha_inicio')
    .optional()
    .isISO8601().withMessage('La fecha de inicio debe tener formato YYYY-MM-DD'),
  query('fecha_fin')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe tener formato YYYY-MM-DD'),
  query('fecha')
    .optional()
    .isISO8601().withMessage('La fecha debe tener formato YYYY-MM-DD'),
  validate
];

/**
 * Validadores para Login
 */
const validarLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('El usuario es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate
];

/**
 * Validadores para Usuarios
 */
const validarUsuario = [
  body('username')
    .trim()
    .notEmpty().withMessage('El usuario es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['admin', 'cajera']).withMessage('El rol debe ser "admin" o "cajera"'),
  body('nombre_completo')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre completo no puede exceder 100 caracteres'),
  validate
];

/**
 * Validadores para Pagos de Vianda
 */
const validarPagoVianda = [
  body('plan_vianda_id')
    .notEmpty().withMessage('El plan de vianda es requerido')
    .isInt({ min: 1 }).withMessage('El plan_vianda_id debe ser un número entero positivo'),
  body('monto')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('fecha_pago')
    .optional()
    .isISO8601().withMessage('La fecha de pago debe tener formato YYYY-MM-DD'),
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Las observaciones no pueden exceder 500 caracteres'),
  validate
];

/**
 * Validadores para Retiros de Vianda
 */
const validarRetiroVianda = [
  body('productos')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto')
    .custom((productos) => {
      for (const producto of productos) {
        if (!producto.producto_id || !Number.isInteger(producto.producto_id) || producto.producto_id < 1) {
          throw new Error('Cada producto debe tener un producto_id válido');
        }
        if (!producto.cantidad || !Number.isInteger(producto.cantidad) || producto.cantidad < 1) {
          throw new Error('Cada producto debe tener una cantidad válida mayor a 0');
        }
      }
      return true;
    }),
  body('plan_vianda_id')
    .notEmpty().withMessage('El plan de vianda es requerido')
    .isInt({ min: 1 }).withMessage('El plan_vianda_id debe ser un número entero positivo'),
  body('fecha_retiro')
    .notEmpty().withMessage('La fecha de retiro es requerida')
    .isISO8601().withMessage('La fecha debe tener formato YYYY-MM-DD'),
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Las observaciones no pueden exceder 500 caracteres'),
  validate
];

module.exports = {
  validate,
  validarProducto,
  validarCategoria,
  validarCliente,
  validarVenta,
  validarPromocion,
  validarPlanVianda,
  validarId,
  validarFechasReporte,
  validarLogin,
  validarUsuario,
  validarPagoVianda,
  validarRetiroVianda,
  validarCategoriaUpdate,
  validarProductoUpdate
};

