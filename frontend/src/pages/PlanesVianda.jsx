import { useEffect, useState } from 'react'
import { planViandaService } from '../services/planViandaService'
import { clienteService } from '../services/clienteService'
import { getFechaHoy, calcularFechaFin } from '../utils/dateUtils'
import './PlanesVianda.css'

const PlanesVianda = () => {
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [planEditando, setPlanEditando] = useState(null)
  const [clienteSearch, setClienteSearch] = useState('')
  const [clientesFiltrados, setClientesFiltrados] = useState([])
  const [showClienteDropdown, setShowClienteDropdown] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [esRenovacion, setEsRenovacion] = useState(false)
  const [formData, setFormData] = useState({
      cliente_nombre: '',
      cliente_telefono: '',
      cliente_email: '',
      fecha_inicio: getFechaHoy(),
      fecha_fin: '',
      precio_mensual: '',
      dias_semana: [],
      viandas_incluidas: '',
      medio_pago: 'efectivo',
      monto_pago: ''
    })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (planEditando) return

    if (clienteSearch.length > 2) {
      buscarClientes()
    } else {
      setClientesFiltrados([])
      setShowClienteDropdown(false)
    }
  }, [clienteSearch, planEditando])

  const loadData = async () => {
    try {
      const response = await planViandaService.getAll()
      setPlanes(response.data || [])
    } catch (error) {
      console.error('Error cargando planes:', error)
    } finally {
      setLoading(false)
    }
  }

  const buscarClientes = async () => {
    try {
      const response = await clienteService.search(clienteSearch)
      setClientesFiltrados((response.data || []).slice(0, 10))
      setShowClienteDropdown(true)
    } catch (error) {
      console.error('Error buscando clientes:', error)
    }
  }

  const handleClienteSelect = async (cliente) => {
    setClienteSeleccionado(cliente)
    setClienteSearch(cliente.nombre)
    setShowClienteDropdown(false)
    
    // Verificar si tiene planes activos
    try {
      const planesResponse = await planViandaService.getPlanesActivos(cliente.id)
      if (planesResponse.data && planesResponse.data.length > 0) {
        setEsRenovacion(true)
        // Pre-llenar con datos del cliente
        setFormData(prev => ({
          ...prev,
          cliente_nombre: cliente.nombre,
          cliente_telefono: cliente.telefono || '',
          cliente_email: cliente.email || ''
        }))
      } else {
        setEsRenovacion(false)
        setFormData(prev => ({
          ...prev,
          cliente_nombre: cliente.nombre,
          cliente_telefono: cliente.telefono || '',
          cliente_email: cliente.email || '',
          cliente_id: cliente.id
        }))
      }
    } catch (error) {
      console.error('Error verificando planes:', error)
    }
  }

  const handleClienteSearchChange = (e) => {
    const value = e.target.value
    setClienteSearch(value)
    if (value.length === 0) {
      setClienteSeleccionado(null)
      setEsRenovacion(false)
      setFormData(prev => ({
        ...prev,
        cliente_nombre: '',
        cliente_telefono: '',
        cliente_email: '',
        cliente_id: null
      }))
    }
  }

  const handleDiaChange = (dia) => {
    setFormData(prev => {
      const dias = prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter(d => d !== dia)
        : [...prev.dias_semana, dia]
      return { ...prev, dias_semana: dias }
    })
  }


  const handleFechaInicioChange = (e) => {
    const fechaInicio = e.target.value
    setFormData(prev => ({
      ...prev,
      fecha_inicio: fechaInicio,
      fecha_fin: calcularFechaFin(fechaInicio)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payloadBase = {
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        precio_mensual: parseFloat(formData.precio_mensual),
        dias_semana: formData.dias_semana,
        viandas_incluidas: parseInt(formData.viandas_incluidas)
      }

      let response

      if (planEditando) {
        response = await planViandaService.update(planEditando.id, payloadBase)
      } else {
        const dataToSend = {
          cliente_id: clienteSeleccionado?.id || null,
          cliente_nombre: formData.cliente_nombre || null,
          cliente_telefono: formData.cliente_telefono || null,
          cliente_email: formData.cliente_email || null,
          ...payloadBase,
          medio_pago: formData.medio_pago || null,
          monto_pago: formData.monto_pago ? parseFloat(formData.monto_pago) : null
        }

        // Eliminar campos null o vacíos innecesarios
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] === null || dataToSend[key] === '' || dataToSend[key] === undefined) {
            if (key !== 'cliente_id' && key !== 'cliente_email' && key !== 'cliente_telefono' && key !== 'monto_pago') {
              delete dataToSend[key]
            }
          }
        })

        response = await planViandaService.create(dataToSend)
      }
      
      if (response.success) {
        if (planEditando) {
          alert('Plan actualizado exitosamente')
        } else {
          alert(esRenovacion ? 'Plan renovado exitosamente' : 'Plan creado exitosamente')
        }
        setShowModal(false)
        resetForm()
        loadData()
      }
    } catch (error) {
      console.error('Error al guardar plan:', error)
      let errorMessage = planEditando ? 'Error al actualizar plan' : 'Error al crear plan'
      
      if (error.response) {
        // El servidor respondió con un error
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000'
      } else {
        // Error al configurar la petición
        errorMessage = error.message || errorMessage
      }
      
      alert(errorMessage)
    }
  }

  const handleEditarPlan = (plan) => {
    const diasSemanaPlan = Array.isArray(plan.dias_semana)
      ? plan.dias_semana.map(d => Number(d))
      : []

    setPlanEditando(plan)
    setEsRenovacion(false)
    setClienteSeleccionado({
      id: plan.cliente_id,
      nombre: plan.cliente_nombre || `Cliente ${plan.cliente_id}`
    })
    setClienteSearch(plan.cliente_nombre || `Cliente ${plan.cliente_id}`)
    setShowClienteDropdown(false)
    setClientesFiltrados([])
    setFormData({
      cliente_nombre: plan.cliente_nombre || '',
      cliente_telefono: plan.cliente_telefono || '',
      cliente_email: plan.cliente_email || '',
      fecha_inicio: plan.fecha_inicio ? plan.fecha_inicio.split('T')[0] : getFechaHoy(),
      fecha_fin: plan.fecha_fin ? plan.fecha_fin.split('T')[0] : '',
      precio_mensual: plan.precio_mensual ?? '',
      dias_semana: diasSemanaPlan,
      viandas_incluidas: plan.viandas_incluidas ?? '',
      medio_pago: 'efectivo',
      monto_pago: ''
    })
    setShowModal(true)
  }

  const handleCancelarPlan = async (plan) => {
    const confirmar = window.confirm(`¿Seguro que deseas cancelar el plan #${plan.id}?`)
    if (!confirmar) return

    try {
      const response = await planViandaService.cancelar(plan.id)
      if (response.success) {
        alert('Plan cancelado exitosamente')
        loadData()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cancelar el plan'
      alert(errorMessage)
    }
  }

  const resetForm = () => {
    setPlanEditando(null)
    setClienteSeleccionado(null)
    setClienteSearch('')
    setEsRenovacion(false)
    setFormData({
      cliente_nombre: '',
      cliente_telefono: '',
      cliente_email: '',
      fecha_inicio: getFechaHoy(),
      fecha_fin: '',
      precio_mensual: '',
      dias_semana: [],
      viandas_incluidas: '',
      medio_pago: 'efectivo',
      monto_pago: ''
    })
  }

  if (loading) {
    return <div className="loading">Cargando planes...</div>
  }

  const diasSemana = [
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
    { valor: 7, nombre: 'Domingo' }
  ]

  return (
    <div className="planes-vianda">
      <div className="page-header">
        <h1>Planes de Vianda</h1>
        <button onClick={() => {
          resetForm()
          setShowModal(true)
        }} className="btn-primary">
          + Nuevo Plan
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Viandas/Día</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Precio Mensual</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {planes.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.cliente_nombre || `Cliente ${p.cliente_id}`}</td>
                <td>{p.viandas_incluidas}</td>
                <td>{new Date(p.fecha_inicio).toLocaleDateString()}</td>
                <td>{new Date(p.fecha_fin).toLocaleDateString()}</td>
                <td>${parseFloat(p.precio_mensual).toLocaleString()}</td>
                <td>
                  <span className={`badge ${p.estado === 'activo' ? 'active' : 'inactive'}`}>
                    {p.estado}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEditarPlan(p)} className="btn-edit">
                    Editar
                  </button>
                  {p.estado === 'activo' && (
                    <button
                      onClick={() => handleCancelarPlan(p)}
                      className="btn-delete"
                      style={{ marginLeft: '8px' }}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false)
          resetForm()
        }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{planEditando ? 'Editar' : (esRenovacion ? 'Renovar' : 'Nuevo')} Plan de Vianda</h2>
            {esRenovacion && !planEditando && (
              <div className="renovacion-info">
                ℹ️ Este cliente ya tiene planes activos. Se creará un nuevo plan.
              </div>
            )}
            {planEditando && (
              <div className="renovacion-info">
                ℹ️ Estás editando el plan #{planEditando.id} de {clienteSearch}.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {!planEditando && (
                <div className="form-group cliente-search-group">
                  <label>Buscar Cliente</label>
                  <div className="cliente-search-container">
                    <input
                      type="text"
                      value={clienteSearch}
                      onChange={handleClienteSearchChange}
                      placeholder="Buscar por nombre o teléfono..."
                      className="cliente-search-input"
                    />
                    {showClienteDropdown && clientesFiltrados.length > 0 && (
                      <div className="cliente-dropdown">
                        {clientesFiltrados.map(cliente => (
                          <div
                            key={cliente.id}
                            className="cliente-option"
                            onClick={() => handleClienteSelect(cliente)}
                          >
                            <div className="cliente-option-name">{cliente.nombre}</div>
                            <div className="cliente-option-details">
                              {cliente.telefono && <span>📞 {cliente.telefono}</span>}
                              {cliente.email && <span>✉️ {cliente.email}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!planEditando && !clienteSeleccionado && (
                <>
                  <div className="form-group">
                    <label>Nombre del Cliente *</label>
                    <input
                      type="text"
                      value={formData.cliente_nombre}
                      onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={formData.cliente_telefono}
                      onChange={(e) => setFormData({ ...formData, cliente_telefono: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.cliente_email}
                      onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                    />
                  </div>
                </>
              )}

              {planEditando && (
                <div className="form-group">
                  <label>Cliente</label>
                  <input type="text" value={clienteSearch} disabled />
                </div>
              )}

              <div className="form-group">
                <label>Fecha de Inicio *</label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={handleFechaInicioChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha de Fin *</label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Viandas por Día *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.viandas_incluidas}
                  onChange={(e) => setFormData({ ...formData, viandas_incluidas: e.target.value })}
                  required
                  placeholder="Cantidad de platos que puede retirar por día"
                />
              </div>

              <div className="form-group">
                <label>Precio Mensual *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_mensual}
                  onChange={(e) => setFormData({ ...formData, precio_mensual: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Días de la Semana *</label>
                <div className="dias-semana-grid">
                  {diasSemana.map(dia => (
                    <label key={dia.valor} className="dia-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.dias_semana.includes(dia.valor)}
                        onChange={() => handleDiaChange(dia.valor)}
                      />
                      <span>{dia.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {!planEditando && (
                <div className="pago-section">
                  <h3>Registro de Pago</h3>
                  <div className="form-group">
                    <label>Medio de Pago</label>
                    <select
                      value={formData.medio_pago}
                      onChange={(e) => setFormData({ ...formData, medio_pago: e.target.value })}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Monto del Pago</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monto_pago}
                      onChange={(e) => setFormData({ ...formData, monto_pago: e.target.value })}
                      placeholder="Ingrese el monto pagado"
                    />
                    <small>Si se registra el pago, se generará el ticket de venta</small>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowModal(false)
                  resetForm()
                }} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {planEditando ? 'Guardar Cambios' : (esRenovacion ? 'Renovar Plan' : 'Crear Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlanesVianda

