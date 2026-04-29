const express = require('express');
const router = express.Router();
const RetiroViandaController = require('../controllers/retiroViandaController');
const { authenticate } = require('../middleware/auth');
const { validarRetiroVianda, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de retiros de vianda
router.post('/', validarRetiroVianda, RetiroViandaController.create);
router.get('/', RetiroViandaController.getAll);
router.get('/disponibles/:planViandaId', validarId, RetiroViandaController.consultarDisponibles);
router.get('/plan/:planViandaId/fecha/:fecha', RetiroViandaController.getRetirosPorFecha);
router.get('/:id', validarId, RetiroViandaController.getById);
router.put('/:id/retirado', validarId, RetiroViandaController.marcarRetirado);

module.exports = router;

