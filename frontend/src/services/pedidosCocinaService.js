import api from './api'

export const pedidosCocinaService = {
  async getPedidosDelDia(fecha = null) {
    const params = fecha ? { fecha } : {}
    const response = await api.get('/pedidos-cocina', { params })
    return response.data
  },

  async getPedidoById(id) {
    const response = await api.get(`/pedidos-cocina/${id}`)
    return response.data
  },

  async marcarPreparado(id) {
    const response = await api.put(`/pedidos-cocina/${id}/preparado`)
    return response.data
  },

  async getEstadisticas(fecha = null) {
    const params = fecha ? { fecha } : {}
    const response = await api.get('/pedidos-cocina/estadisticas', { params })
    return response.data
  },

  async getTicket(id) {
    const response = await api.get(`/pedidos-cocina/${id}/ticket`)
    return response.data
  }
}

