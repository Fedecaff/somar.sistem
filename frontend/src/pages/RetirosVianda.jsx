import { useEffect, useState } from 'react'
import { retiroViandaService } from '../services/retiroViandaService'
import { planViandaService } from '../services/planViandaService'
import { productoService } from '../services/productoService'
import { getFechaHoy, formatearFecha } from '../utils/dateUtils'
import './RetirosVianda.css'

const RetirosVianda = () => {
  const [retiros, setRetiros] = useState([])
  const [planes, setPlanes] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [fechaFiltro, setFechaFiltro] = useState(getFechaHoy())
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [disponibilidadActual, setDisponibilidadActual] = useState(null)
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false)
  const [formData, setFormData] = useState({
    plan_vianda_id: '',
    fecha_retiro: getFechaHoy(),
    productos: [{ producto_id: '', cantidad: 1 }]
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (planSeleccionado?.id && formData.fecha_retiro) {
      loadDisponibilidad(planSeleccionado, formData.fecha_retiro)
    } else {
      setDisponibilidadActual(null)
    }
  }, [planSeleccionado, formData.fecha_retiro])

  const loadData = async () => {
    try {
      const [retirosRes, planesRes, productosRes] = await Promise.all([
        retiroViandaService.getAll(),
        planViandaService.getAll(),
        productoService.getAll()
      ])
      setRetiros(retirosRes.data || [])
      setPlanes((planesRes.data || []).filter(p => p.estado === 'activo'))
      setProductos(productosRes.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      alert('Error al cargar los retiros: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (planId) => {
    const plan = planes.find(p => p.id === parseInt(planId))
    setPlanSeleccionado(plan)
    setFormData({ ...formData, plan_vianda_id: planId })
  }

  const handleProductoChange = (index, productoId) => {
    const nuevosProductos = [...formData.productos]
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      producto_id: productoId
    }
    setFormData({ ...formData, productos: nuevosProductos })
  }

  const addProducto = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { producto_id: '', cantidad: 1 }]
    })
  }

  const removeProducto = (index) => {
    const nuevosProductos = formData.productos.filter((_, i) => i !== index)
    setFormData({ ...formData, productos: nuevosProductos })
  }

  const calcularCantidadTotal = () => {
    return formData.productos.reduce((total, p) => {
      return total + (parseInt(p.cantidad) || 0)
    }, 0)
  }

  const loadDisponibilidad = async (plan, fecha) => {
    if (!plan?.id || !fecha) return
    setLoadingDisponibilidad(true)
    try {
      const response = await retiroViandaService.getRetirosPorFecha(plan.id, fecha)
      const retiros = response.data || []
      const retirosRealizados = retiros.filter(r => r.retirado === true).length
      const permitidas = (plan.viandas_incluidas || 0) + (plan.viandas_adicionales || 0)
      const restantes = Math.max(0, permitidas - retirosRealizados)
      setDisponibilidadActual({
        permitidas,
        retiros_realizados: retirosRealizados,
        restantes
      })
    } catch (error) {
      console.error('Error cargando disponibilidad:', error)
      setDisponibilidadActual(null)
    } finally {
      setLoadingDisponibilidad(false)
    }
  }

  const getViandasDisponibles = () => {
    if (disponibilidadActual) return disponibilidadActual.restantes
    if (!planSeleccionado) return 0
    return (planSeleccionado.viandas_incluidas || 0) + (planSeleccionado.viandas_adicionales || 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const cantidadTotal = calcularCantidadTotal()
    const viandasDisponibles = getViandasDisponibles()
    
    if (cantidadTotal > viandasDisponibles) {
      const confirmar = window.confirm(
        `El cliente tiene ${viandasDisponibles} viandas disponibles. ` +
        `Está solicitando ${cantidadTotal} productos. ` +
        `Los ${cantidadTotal - viandasDisponibles} productos extras se registrarán como venta de mostrador. ¿Continuar?`
      )
      if (!confirmar) return
    }

    try {
      const dataToSend = {
        plan_vianda_id: parseInt(formData.plan_vianda_id),
        fecha_retiro: formData.fecha_retiro,
        productos: formData.productos
          .filter(p => p.producto_id)
          .map(p => ({
            producto_id: parseInt(p.producto_id),
            cantidad: parseInt(p.cantidad)
          }))
      }

      const response = await retiroViandaService.create(dataToSend)
      
      if (response.success) {
        alert('Retiro registrado exitosamente. Se generó el ticket de cocina.')
        setShowModal(false)
        resetForm()
        await loadData()
        if (planSeleccionado?.id && formData.fecha_retiro) {
          await loadDisponibilidad(planSeleccionado, formData.fecha_retiro)
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al registrar retiro')
    }
  }

  const handleMarcarRetirado = async (id) => {
    try {
      await retiroViandaService.marcarRetirado(id)
      loadData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al marcar como retirado')
    }
  }

  const resetForm = () => {
    setPlanSeleccionado(null)
    setDisponibilidadActual(null)
    setFormData({
      plan_vianda_id: '',
      fecha_retiro: getFechaHoy(),
      productos: [{ producto_id: '', cantidad: 1 }]
    })
  }

  const retirosFiltrados = retiros.filter(r => {
    if (fechaFiltro) {
      const fechaRetiro = formatearFecha(r.fecha_retiro)
      return fechaRetiro === fechaFiltro
    }
    return true
  })

  const productosDisponibles = productos.filter(p => p.activo)

  if (loading) {
    return <div className="loading">Cargando retiros...</div>
  }

  return (
    <div className="retiros-vianda">
      <div className="page-header">
        <h1>Retiros de Vianda</h1>
        <div className="header-actions">
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="fecha-filtro"
          />
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Nuevo Retiro
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Fecha Retiro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {retirosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                  {fechaFiltro 
                    ? `No hay retiros registrados para la fecha ${fechaFiltro}`
                    : 'No hay retiros registrados'}
                </td>
              </tr>
            ) : (
              retirosFiltrados.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.cliente_nombre || `Cliente ${r.cliente_id}`}</td>
                  <td>{r.producto_nombre || '-'}</td>
                  <td>{r.fecha_retiro ? new Date(r.fecha_retiro).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`badge ${r.retirado ? 'active' : 'inactive'}`}>
                      {r.retirado ? 'Retirado' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    {!r.retirado && (
                      <button
                        onClick={() => handleMarcarRetirado(r.id)}
                        className="btn-edit"
                        title="Marcar como retirado"
                      >
                        ✓
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false)
          resetForm()
        }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo Retiro de Vianda</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan de Vianda *</label>
                <select
                  value={formData.plan_vianda_id}
                  onChange={(e) => handlePlanSelect(e.target.value)}
                  required
                >
                  <option value="">Seleccione un plan...</option>
                  {planes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.cliente_nombre} - {p.viandas_incluidas} viandas/día
                    </option>
                  ))}
                </select>
                {planSeleccionado && (
                  <div className="plan-info">
                    <strong>Cliente:</strong> {planSeleccionado.cliente_nombre}<br />
                    <strong>Viandas permitidas:</strong>{' '}
                    {loadingDisponibilidad ? 'calculando...' : (disponibilidadActual?.permitidas ?? getViandasDisponibles())}<br />
                    <strong>Ya retiradas:</strong>{' '}
                    {loadingDisponibilidad ? 'calculando...' : (disponibilidadActual?.retiros_realizados ?? '-')}<br />
                    <strong>Restantes:</strong>{' '}
                    {loadingDisponibilidad ? 'calculando...' : (disponibilidadActual?.restantes ?? getViandasDisponibles())}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Fecha de Retiro *</label>
                <input
                  type="date"
                  value={formData.fecha_retiro}
                  onChange={(e) => setFormData({ ...formData, fecha_retiro: e.target.value })}
                  required
                />
              </div>

              <div className="productos-section">
                <div className="section-header">
                  <h3>Productos a Retirar</h3>
                  <button type="button" onClick={addProducto} className="btn-primary small">
                    + Agregar Producto
                  </button>
                </div>
                {formData.productos.map((producto, index) => (
                  <div key={index} className="producto-row">
                    <select
                      value={producto.producto_id}
                      onChange={(e) => handleProductoChange(index, e.target.value)}
                      required
                    >
                      <option value="">Seleccione producto...</option>
                      {productosDisponibles.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={producto.cantidad}
                      onChange={(e) => {
                        const nuevosProductos = [...formData.productos]
                        nuevosProductos[index].cantidad = parseInt(e.target.value) || 1
                        setFormData({ ...formData, productos: nuevosProductos })
                      }}
                      required
                      placeholder="Cantidad"
                    />
                    {formData.productos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProducto(index)}
                        className="btn-delete small"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
                <div className="resumen-retiro">
                  <strong>Total productos:</strong> {calcularCantidadTotal()}
                  {planSeleccionado && (
                    <>
                      <br />
                      <strong>Viandas disponibles:</strong>{' '}
                      {loadingDisponibilidad ? 'calculando...' : getViandasDisponibles()}
                      {calcularCantidadTotal() > getViandasDisponibles() && (
                        <span className="warning">
                          <br />⚠️ Se registrarán {calcularCantidadTotal() - getViandasDisponibles()} productos como venta de mostrador
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar Retiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RetirosVianda

