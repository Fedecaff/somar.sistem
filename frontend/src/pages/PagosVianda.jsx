import { useEffect, useState } from 'react'
import { planViandaService } from '../services/planViandaService'
import { pagoViandaService } from '../services/pagoViandaService'
import { getFechaHoy } from '../utils/dateUtils'
import './PagosVianda.css'

const PagosVianda = () => {
  const [planes, setPlanes] = useState([])
  const [pagos, setPagos] = useState([])
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [planDetalle, setPlanDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    plan_vianda_id: '',
    monto: '',
    medio_pago: 'efectivo',
    fecha_pago: getFechaHoy()
  })

  useEffect(() => {
    loadPlanes()
  }, [])

  useEffect(() => {
    if (planSeleccionado?.id) {
      loadPlanDetalle(planSeleccionado.id)
    } else {
      setPlanDetalle(null)
      setPagos([])
    }
  }, [planSeleccionado])

  const loadPlanes = async () => {
    try {
      const response = await planViandaService.getAll()
      const planesData = response.data || []
      const planesOrdenados = [...planesData].sort((a, b) => {
        if (a.estado === b.estado) return b.id - a.id
        return a.estado === 'activo' ? -1 : 1
      })
      setPlanes(planesOrdenados)
    } catch (error) {
      console.error('Error cargando planes:', error)
      alert('Error al cargar planes: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const loadPlanDetalle = async (planId) => {
    setLoadingPlan(true)
    try {
      const response = await planViandaService.getById(planId)
      const data = response.data || response
      setPlanDetalle(data)
      setPagos(data?.pagos || [])
    } catch (error) {
      console.error('Error cargando plan:', error)
      setPlanDetalle(null)
      setPagos([])
      alert('Error al cargar detalle del plan: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoadingPlan(false)
    }
  }

  const handlePlanChange = (planId) => {
    const plan = planes.find(p => p.id === parseInt(planId))
    setPlanSeleccionado(plan || null)
    setFormData(prev => ({
      ...prev,
      plan_vianda_id: planId
    }))
  }

  const resetForm = () => {
    setFormData({
      plan_vianda_id: planSeleccionado?.id ? String(planSeleccionado.id) : '',
      monto: '',
      medio_pago: 'efectivo',
      fecha_pago: getFechaHoy()
    })
  }

  const handleOpenModal = () => {
    resetForm()
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.plan_vianda_id) {
      alert('Debe seleccionar un plan de vianda')
      return
    }

    const monto = parseFloat(formData.monto)
    if (!monto || monto <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }

    if (!['efectivo', 'transferencia'].includes(formData.medio_pago)) {
      alert('El medio de pago debe ser "efectivo" o "transferencia"')
      return
    }

    try {
      const payload = {
        plan_vianda_id: parseInt(formData.plan_vianda_id),
        monto,
        medio_pago: formData.medio_pago,
        fecha_pago: formData.fecha_pago || getFechaHoy()
      }

      const response = await pagoViandaService.create(payload)
      if (response.success) {
        alert('Pago registrado exitosamente')
        setShowModal(false)
        resetForm()
        setPlanSeleccionado(planes.find(p => p.id === payload.plan_vianda_id) || null)
        await loadPlanDetalle(payload.plan_vianda_id)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al registrar pago')
    }
  }

  if (loading) {
    return <div className="loading">Cargando pagos...</div>
  }

  return (
    <div className="pagos-vianda">
      <div className="page-header">
        <h1>Pagos de Vianda</h1>
        <button onClick={handleOpenModal} className="btn-primary">
          + Registrar Pago
        </button>
      </div>

      <div className="pagos-controls">
        <div className="form-group">
          <label>Plan de Vianda</label>
          <select
            value={planSeleccionado?.id || ''}
            onChange={(e) => handlePlanChange(e.target.value)}
          >
            <option value="">Seleccione un plan...</option>
            {planes.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.cliente_nombre || `Cliente ${plan.cliente_id}`} - #{plan.id} ({plan.estado})
              </option>
            ))}
          </select>
        </div>

        <div className="resumen-plan">
          <h3>Resumen del Plan</h3>
          {loadingPlan && <div className="resumen-loading">Cargando resumen...</div>}
          {!loadingPlan && planDetalle && (
            <div className="resumen-grid">
              <div>
                <span className="resumen-label">Precio Mensual</span>
                <span className="resumen-value">
                  ${parseFloat(planDetalle.precio_mensual || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="resumen-label">Total Pagado</span>
                <span className="resumen-value">
                  ${parseFloat(planDetalle.total_pagado || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="resumen-label">Saldo Pendiente</span>
                <span className="resumen-value">
                  ${parseFloat(planDetalle.saldo_pendiente || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          {!loadingPlan && !planDetalle && (
            <div className="resumen-empty">Seleccione un plan para ver el resumen.</div>
          )}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Medio</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                  {planSeleccionado
                    ? 'No hay pagos registrados para este plan'
                    : 'Seleccione un plan para ver pagos'}
                </td>
              </tr>
            ) : (
              pagos.map(pago => (
                <tr key={pago.id}>
                  <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : '-'}</td>
                  <td>{planDetalle?.cliente_nombre || '-'}</td>
                  <td>${parseFloat(pago.monto || 0).toLocaleString()}</td>
                  <td>{pago.medio_pago}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Registrar Pago de Vianda</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan de Vianda *</label>
                <select
                  value={formData.plan_vianda_id}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  required
                >
                  <option value="">Seleccione un plan...</option>
                  {planes.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.cliente_nombre || `Cliente ${plan.cliente_id}`} - #{plan.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Medio de Pago *</label>
                <select
                  value={formData.medio_pago}
                  onChange={(e) => setFormData({ ...formData, medio_pago: e.target.value })}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fecha de Pago</label>
                <input
                  type="date"
                  value={formData.fecha_pago}
                  onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PagosVianda

