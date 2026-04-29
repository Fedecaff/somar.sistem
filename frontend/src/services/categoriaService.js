import api from './api'

export const categoriaService = {
  async getAll() {
    const response = await api.get('/categorias')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/categorias/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/categorias', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/categorias/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/categorias/${id}`)
    return response.data
  },

  async deletePermanent(id) {
    const response = await api.delete(`/categorias/${id}/permanente`)
    return response.data
  }
}

