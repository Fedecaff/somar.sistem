const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const { authenticate, authorize } = require('../middleware/auth');
const { validarUsuario, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo admin puede gestionar usuarios
router.get('/', authorize('admin'), UsuarioController.getAll);
router.get('/:id', authorize('admin'), validarId, UsuarioController.getById);
router.post('/', authorize('admin'), validarUsuario, UsuarioController.create);
router.put('/:id', authorize('admin'), validarId, validarUsuario, UsuarioController.update);
router.delete('/:id', authorize('admin'), validarId, UsuarioController.delete);

module.exports = router;

