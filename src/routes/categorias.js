const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/categoriaController');
const { authenticate, authorize } = require('../middleware/auth');
const { validarCategoria, validarCategoriaUpdate, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Listar todas las categorías
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/', CategoriaController.getAll);

/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría encontrada
 */
router.get('/:id', validarId, CategoriaController.getById);

/**
 * @swagger
 * /api/categorias/{id}/productos:
 *   get:
 *     summary: Obtener productos de una categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/:id/productos', validarId, CategoriaController.getProductos);

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorías]
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
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.post('/', authorize('admin'), validarCategoria, CategoriaController.create);

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categorías]
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
 *                 example: "Pollo Actualizado"
 *               descripcion:
 *                 type: string
 *                 example: "Nueva descripción"
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.put('/:id', authorize('admin'), validarId, validarCategoriaUpdate, CategoriaController.update);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) una categoría
 *     tags: [Categorías]
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
 *         description: Categoría eliminada
 */
router.delete('/:id', authorize('admin'), validarId, CategoriaController.delete);
router.delete('/:id/permanente', authorize('admin'), validarId, CategoriaController.deletePermanent);

module.exports = router;

