const express = require('express');
const router = express.Router();
const ReporteController = require('../controllers/reporteController');
const { authenticate, authorize } = require('../middleware/auth');
const { validarFechasReporte, validarId } = require('../validators/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/reportes/ventas/diarias:
 *   get:
 *     summary: Reporte de ventas diarias
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen de ventas del día
 */
router.get('/ventas/diarias', validarFechasReporte, ReporteController.ventasDiarias);

/**
 * @swagger
 * /api/reportes/ventas/periodo:
 *   get:
 *     summary: Reporte de ventas por período
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Ventas del período
 */
router.get('/ventas/periodo', validarFechasReporte, ReporteController.ventasPorPeriodo);

/**
 * @swagger
 * /api/reportes/ventas/medio-pago:
 *   get:
 *     summary: Reporte de ventas por medio de pago
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen por medio de pago
 */
router.get('/ventas/medio-pago', validarFechasReporte, ReporteController.ventasPorMedioPago);

/**
 * @swagger
 * /api/reportes/ventas/tipo:
 *   get:
 *     summary: Reporte de ventas por tipo
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen por tipo de venta
 */
router.get('/ventas/tipo', validarFechasReporte, ReporteController.ventasPorTipo);

/**
 * @swagger
 * /api/reportes/ventas/horario:
 *   get:
 *     summary: Reporte de ventas por horario (día/noche)
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen por horario
 */
router.get('/ventas/horario', validarFechasReporte, ReporteController.ventasPorHorario);

/**
 * @swagger
 * /api/reportes/vianda/retiros:
 *   get:
 *     summary: Reporte de retiros de vianda por día
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen de retiros
 */
router.get('/vianda/retiros', validarFechasReporte, ReporteController.retirosViandaPorDia);

/**
 * @swagger
 * /api/reportes/vianda/clientes:
 *   get:
 *     summary: Reporte de clientes que retiraron vianda
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de clientes con retiros
 */
router.get('/vianda/clientes', validarFechasReporte, ReporteController.clientesRetirosVianda);

/**
 * @swagger
 * /api/reportes/vianda/planes-activos:
 *   get:
 *     summary: Reporte de planes de vianda activos
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de planes activos
 */
router.get('/vianda/planes-activos', ReporteController.planesActivos);

/**
 * @swagger
 * /api/reportes/vianda/planes-vencidos:
 *   get:
 *     summary: Reporte de planes de vianda vencidos
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de planes vencidos
 */
router.get('/vianda/planes-vencidos', ReporteController.planesVencidos);

module.exports = router;

