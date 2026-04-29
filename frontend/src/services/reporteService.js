import api from './api'

export const reporteService = {
  getPrimerDiaMesActual() {
    const hoy = new Date()
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
  },

  getFechaHoy() {
    return new Date().toISOString().split('T')[0]
  },

  async getVentasDiarias(fecha) {
    const response = await api.get('/reportes/ventas/diarias', {
      params: { fecha }
    })
    return response.data
  },

  async getVentasMensuales(mes, año) {
    const mesNum = parseInt(mes, 10)
    const anioNum = parseInt(año, 10)

    if (Number.isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      throw new Error('Mes inválido')
    }

    if (Number.isNaN(anioNum) || anioNum < 2000) {
      throw new Error('Año inválido')
    }

    const primerDia = `${anioNum}-${String(mesNum).padStart(2, '0')}-01`
    const ultimoDiaDate = new Date(anioNum, mesNum, 0)
    const ultimoDia = `${anioNum}-${String(mesNum).padStart(2, '0')}-${String(ultimoDiaDate.getDate()).padStart(2, '0')}`

    const response = await api.get('/reportes/ventas/periodo', {
      params: { fecha_inicio: primerDia, fecha_fin: ultimoDia }
    })
    return response.data
  },

  async getVentasPorMedioPago(fechaInicio, fechaFin) {
    const response = await api.get('/reportes/ventas/medio-pago', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    })
    return response.data
  },

  async getVentasPorTipo(fechaInicio, fechaFin) {
    const response = await api.get('/reportes/ventas/tipo', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    })
    return response.data
  },

  async getPlanesActivos() {
    const response = await api.get('/reportes/vianda/planes-activos')
    return response.data
  },

  async getPlanesVencidos() {
    const response = await api.get('/reportes/vianda/planes-vencidos')
    return response.data
  },

  async getRetirosViandaPorDia(fecha) {
    const response = await api.get('/reportes/vianda/retiros', {
      params: { fecha }
    })
    return response.data
  }
}

