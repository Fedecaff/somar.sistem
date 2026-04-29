const express = require('express');
const router = express.Router();
const VentaController = require('../controllers/ventaController');
const { authenticate } = require('../middleware/auth');
const { validarVenta, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Crear una nueva venta
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo_venta
 *               - medio_pago
 *               - productos
 *             properties:
 *               tipo_venta:
 *                 type: string
 *                 enum: [mostrador, vianda]
 *               medio_pago:
 *                 type: string
 *                 enum: [efectivo, transferencia]
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     producto_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *               cliente_id:
 *                 type: integer
 *               plan_vianda_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Venta creada con tickets generados
 */
router.post('/', validarVenta, VentaController.create);

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Listar todas las ventas
 *     tags: [Ventas]
 *     responses:
 *       200:
 *         description: Lista de ventas
 */
router.get('/', VentaController.getAll);

/**
 * @swagger
 * /api/ventas/hoy:
 *   get:
 *     summary: Obtener ventas del día actual
 *     tags: [Ventas]
 *     responses:
 *       200:
 *         description: Ventas del día
 */
router.get('/hoy', VentaController.getVentasHoy);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener una venta por ID con detalles
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta encontrada
 */
router.get('/:id', validarId, VentaController.getById);

/**
 * @swagger
 * /api/ventas/{id}/preparado:
 *   put:
 *     summary: Marcar ticket de cocina como preparado
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket marcado como preparado
 */
router.put('/:id/preparado', validarId, VentaController.marcarPreparado);

/**
 * @swagger
 * /api/ventas/{id}/ticket:
 *   get:
 *     summary: Obtener ticket formateado de una venta
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket formateado
 */
router.get('/:id/ticket', validarId, VentaController.getTicket);

module.exports = router;

