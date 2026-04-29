const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/clienteController');
const { authenticate } = require('../middleware/auth');
const { validarCliente, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación (admin y cajera pueden ver)
router.use(authenticate);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Listar todos los clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/', ClienteController.getAll);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente encontrado
 */
router.get('/:id', validarId, ClienteController.getById);

/**
 * @swagger
 * /api/clientes/{id}/planes-vianda:
 *   get:
 *     summary: Obtener planes de vianda de un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de planes
 */
router.get('/:id/planes-vianda', validarId, ClienteController.getPlanesVianda);

/**
 * @swagger
 * /api/clientes/{id}/ventas:
 *   get:
 *     summary: Obtener ventas de un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ventas
 */
router.get('/:id/ventas', validarId, ClienteController.getVentas);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
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
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               tiene_vianda:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Cliente creado
 */
router.post('/', validarCliente, ClienteController.create);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clientes]
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
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               tiene_vianda:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.put('/:id', validarId, validarCliente, ClienteController.update);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente eliminado
 */
router.delete('/:id', validarId, ClienteController.delete);

module.exports = router;

