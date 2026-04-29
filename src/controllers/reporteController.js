const ReporteService = require('../services/reporteService');

class ReporteController {
  /**
   * Reporte de ventas diarias
   * GET /api/reportes/ventas/diarias?fecha=2025-01-27
   */
  static async ventasDiarias(req, res) {
    try {
      const { fecha } = req.query;
      const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

      const reporte = await ReporteService.ventasDiarias(fechaConsulta);
      res.json({
        success: true,
        data: {
          fecha: fechaConsulta,
          ...reporte
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte de ventas diarias'
      });
    }
  }

  /**
   * Reporte de ventas por período
   * GET /api/reportes/ventas/periodo?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
   */
  static async ventasPorPeriodo(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'fecha_inicio y fecha_fin son requeridos'
        });
      }

      const reporte = await ReporteService.ventasPorPeriodo(fecha_inicio, fecha_fin);
      res.json({
        success: true,
        data: reporte,
        periodo: {
          fecha_inicio,
          fecha_fin
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte de ventas por período'
      });
    }
  }

  /**
   * Reporte de ventas por medio de pago
   * GET /api/reportes/ventas/medio-pago?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
   */
  static async ventasPorMedioPago(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'fecha_inicio y fecha_fin son requeridos'
        });
      }

      const reporte = await ReporteService.ventasPorMedioPago(fecha_inicio, fecha_fin);
      res.json({
        success: true,
        data: reporte,
        periodo: {
          fecha_inicio,
          fecha_fin
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte por medio de pago'
      });
    }
  }

  /**
   * Reporte de ventas por tipo
   * GET /api/reportes/ventas/tipo?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
   */
  static async ventasPorTipo(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'fecha_inicio y fecha_fin son requeridos'
        });
      }

      const reporte = await ReporteService.ventasPorTipo(fecha_inicio, fecha_fin);
      res.json({
        success: true,
        data: reporte,
        periodo: {
          fecha_inicio,
          fecha_fin
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte por tipo de venta'
      });
    }
  }

  /**
   * Reporte de ventas por horario
   * GET /api/reportes/ventas/horario?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
   */
  static async ventasPorHorario(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'fecha_inicio y fecha_fin son requeridos'
        });
      }

      const reporte = await ReporteService.ventasPorHorario(fecha_inicio, fecha_fin);
      res.json({
        success: true,
        data: reporte,
        periodo: {
          fecha_inicio,
          fecha_fin
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte por horario'
      });
    }
  }

  /**
   * Reporte de retiros de vianda por día
   * GET /api/reportes/vianda/retiros?fecha=2025-01-27
   */
  static async retirosViandaPorDia(req, res) {
    try {
      const { fecha } = req.query;
      const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

      const reporte = await ReporteService.retirosViandaPorDia(fechaConsulta);
      res.json({
        success: true,
        data: {
          fecha: fechaConsulta,
          ...reporte
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte de retiros'
      });
    }
  }

  /**
   * Reporte de clientes que retiraron vianda
   * GET /api/reportes/vianda/clientes?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
   */
  static async clientesRetirosVianda(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'fecha_inicio y fecha_fin son requeridos'
        });
      }

      const reporte = await ReporteService.clientesRetirosVianda(fecha_inicio, fecha_fin);
      res.json({
        success: true,
        data: reporte,
        periodo: {
          fecha_inicio,
          fecha_fin
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte de clientes'
      });
    }
  }

  /**
   * Reporte de planes activos
   * GET /api/reportes/vianda/planes-activos
   */
  static async planesActivos(req, res) {
    try {
      const reporte = await ReporteService.planesActivos();
      res.json({
        success: true,
        data: reporte
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte de planes activos'
      });
    }
  }

  /**
   * Reporte de planes vencidos
   * GET /api/reportes/vianda/planes-vencidos
   */
  static async planesVencidos(req, res) {
    try {
      const reporte = await ReporteService.planesVencidos();
      res.json({
        success: true,
        data: reporte
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte de planes vencidos'
      });
    }
  }

}

module.exports = ReporteController;

