import api from './api'

export const usuarioService = {
  async getAll() {
    const response = await api.get('/usuarios')
    return response.data
  },

  async create(data) {
    const response = await api.post('/usuarios', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/usuarios/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data
  }
}
