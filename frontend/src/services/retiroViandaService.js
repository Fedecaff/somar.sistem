import api from './api'

export const retiroViandaService = {
  async getAll() {
    const response = await api.get('/retiros-vianda')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/retiros-vianda/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/retiros-vianda', data)
    return response.data
  },

  async marcarRetirado(id) {
    const response = await api.put(`/retiros-vianda/${id}/retirado`)
    return response.data
  },

  async getRetirosPorFecha(planViandaId, fecha) {
    const response = await api.get(`/retiros-vianda/plan/${planViandaId}/fecha/${fecha}`)
    return response.data
  }
}

