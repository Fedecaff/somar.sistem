import api from './api'

export const ventaService = {
  async getAll() {
    const response = await api.get('/ventas')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/ventas/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/ventas', data)
    return response.data
  },

  async getTicket(id) {
    const response = await api.get(`/ventas/${id}/ticket`)
    return response.data
  }
}

