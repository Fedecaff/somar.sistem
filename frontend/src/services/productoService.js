import api from './api'

export const productoService = {
  async getAll() {
    const response = await api.get('/productos')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/productos/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/productos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/productos/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/productos/${id}`)
    return response.data
  },

  async deletePermanent(id) {
    const response = await api.delete(`/productos/${id}/permanente`)
    return response.data
  }
}

