import api from './api'

export const promocionService = {
  async getAll(params = {}) {
    const response = await api.get('/promociones', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/promociones/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/promociones', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/promociones/${id}`, data)
    return response.data
  },

  async desactivar(id) {
    const response = await api.put(`/promociones/${id}/desactivar`)
    return response.data
  },

  async calcularPrecio(productoId, cantidad) {
    const response = await api.get('/promociones/calcular-precio', {
      params: { producto_id: productoId, cantidad }
    })
    return response.data
  }
}
