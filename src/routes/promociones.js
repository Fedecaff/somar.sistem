const express = require('express');
const router = express.Router();
const PromocionController = require('../controllers/promocionController');
const { authenticate, authorize } = require('../middleware/auth');
const { validarPromocion, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/promociones:
 *   get:
 *     summary: Listar todas las promociones
 *     tags: [Promociones]
 *     parameters:
 *       - in: query
 *         name: activa
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: vigente
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de promociones
 */
router.get('/', PromocionController.getAll);

/**
 * @swagger
 * /api/promociones/aplicables:
 *   get:
 *     summary: Obtener promociones aplicables para un producto
 *     tags: [Promociones]
 *     parameters:
 *       - in: query
 *         name: producto_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cantidad
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promociones aplicables
 */
router.get('/aplicables', PromocionController.getAplicables);

/**
 * @swagger
 * /api/promociones/calcular-precio:
 *   get:
 *     summary: Calcular precio con promoción aplicada
 *     tags: [Promociones]
 *     parameters:
 *       - in: query
 *         name: producto_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cantidad
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Precio calculado con promoción
 */
router.get('/calcular-precio', PromocionController.calcularPrecio);

/**
 * @swagger
 * /api/promociones/{id}:
 *   get:
 *     summary: Obtener una promoción por ID
 *     tags: [Promociones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción encontrada
 */
router.get('/:id', validarId, PromocionController.getById);

// POST, PUT, DELETE - Solo admin puede modificar promociones
router.post('/', authorize('admin'), validarPromocion, PromocionController.create);
router.put('/:id', authorize('admin'), validarId, PromocionController.update);
router.put('/:id/desactivar', authorize('admin'), validarId, PromocionController.desactivar);
router.delete('/:id', authorize('admin'), validarId, PromocionController.delete);

module.exports = router;

