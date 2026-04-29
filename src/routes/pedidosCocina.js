const express = require('express');
const router = express.Router();
const PedidosCocinaController = require('../controllers/pedidosCocinaController');
const { authenticate } = require('../middleware/auth');
const { validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/pedidos-cocina:
 *   get:
 *     summary: Obtener todos los pedidos de cocina del día
 *     tags: [Pedidos Cocina]
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de pedidos del día
 */
router.get('/', PedidosCocinaController.getPedidosDelDia);

/**
 * @swagger
 * /api/pedidos-cocina/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de pedidos del día
 *     tags: [Pedidos Cocina]
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estadísticas del día
 */
router.get('/estadisticas', PedidosCocinaController.getEstadisticas);

/**
 * @swagger
 * /api/pedidos-cocina/{id}:
 *   get:
 *     summary: Obtener un pedido por ID
 *     tags: [Pedidos Cocina]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado
 */
router.get('/:id', validarId, PedidosCocinaController.getPedidoById);

/**
 * @swagger
 * /api/pedidos-cocina/{id}/preparado:
 *   put:
 *     summary: Marcar un pedido como preparado/entregado
 *     tags: [Pedidos Cocina]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido marcado como preparado
 */
router.put('/:id/preparado', validarId, PedidosCocinaController.marcarPreparado);

/**
 * @swagger
 * /api/pedidos-cocina/{id}/ticket:
 *   get:
 *     summary: Obtener ticket de cocina formateado por ID
 *     tags: [Pedidos Cocina]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket de cocina formateado
 */
router.get('/:id/ticket', validarId, PedidosCocinaController.getTicket);

module.exports = router;

