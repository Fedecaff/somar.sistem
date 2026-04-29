const express = require('express');
const router = express.Router();
const PlanViandaController = require('../controllers/planViandaController');
const { authenticate } = require('../middleware/auth');
const { validarPlanVianda, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de planes de vianda
router.post('/', validarPlanVianda, PlanViandaController.create);
router.get('/', PlanViandaController.getAll);
router.get('/cliente/:clienteId', validarId, PlanViandaController.getPlanesActivos);
router.get('/:id', validarId, PlanViandaController.getById);
router.put('/:id', validarId, PlanViandaController.update);
router.put('/:id/cancelar', validarId, PlanViandaController.cancelar);
router.put('/:id/viandas-adicionales', validarId, PlanViandaController.agregarViandasAdicionales);

module.exports = router;

