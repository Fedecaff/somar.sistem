const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/productoController');
const { authenticate, authorize } = require('../middleware/auth');
const { validarProducto, validarProductoUpdate, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', ProductoController.getAll);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', validarId, ProductoController.getById);

/**
 * @swagger
 * /api/productos/{id}/historial-precios:
 *   get:
 *     summary: Obtener historial de precios de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial de precios
 */
router.get('/:id/historial-precios', validarId, ProductoController.getHistorialPrecios);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               categoria_id:
 *                 type: integer
 *               es_menu_fijo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Error de validación
 */
router.post('/', authorize('admin'), validarProducto, ProductoController.create);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               categoria_id:
 *                 type: integer
 *               es_menu_fijo:
 *                 type: boolean
 *               solo_mostrador:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.put('/:id', authorize('admin'), validarId, validarProductoUpdate, ProductoController.update);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 */
router.delete('/:id', authorize('admin'), validarId, ProductoController.delete);
router.delete('/:id/permanente', authorize('admin'), validarId, ProductoController.deletePermanent);

module.exports = router;

