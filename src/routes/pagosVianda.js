const express = require('express');
const router = express.Router();
const PagoViandaController = require('../controllers/pagoViandaController');
const { authenticate } = require('../middleware/auth');
const { validarPagoVianda, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de pagos de vianda
router.post('/', validarPagoVianda, PagoViandaController.create);
router.get('/plan/:planViandaId', validarId, PagoViandaController.getByPlan);
router.get('/plan/:planViandaId/total', validarId, PagoViandaController.getTotalPagado);
router.get('/:id', validarId, PagoViandaController.getById);

module.exports = router;

