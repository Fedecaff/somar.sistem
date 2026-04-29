import api from './api'

export const pagoViandaService = {
  async getByPlan(planId) {
    const response = await api.get(`/pagos-vianda/plan/${planId}`)
    return response.data
  },

  async getTotalByPlan(planId) {
    const response = await api.get(`/pagos-vianda/plan/${planId}/total`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/pagos-vianda', data)
    return response.data
  }
}

