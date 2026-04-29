import api from './api'

export const planViandaService = {
  async getAll() {
    const response = await api.get('/planes-vianda')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/planes-vianda/${id}`)
    return response.data
  },

  async getPlanesActivos(clienteId) {
    const response = await api.get(`/planes-vianda/cliente/${clienteId}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/planes-vianda', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/planes-vianda/${id}`, data)
    return response.data
  },

  async cancelar(id) {
    const response = await api.put(`/planes-vianda/${id}/cancelar`)
    return response.data
  }
}

