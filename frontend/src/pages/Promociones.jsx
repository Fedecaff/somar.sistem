import { useEffect, useState } from 'react'
import { promocionService } from '../services/promocionService'
import { productoService } from '../services/productoService'
import { useAuth } from '../context/AuthContext'
import './Promociones.css'

const getFechaHoy = () => new Date().toISOString().split('T')[0]

const Promociones = () => {
  const { user } = useAuth()
  const esAdmin = user?.rol === 'admin'

  const [promociones, setPromociones] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    producto_id: '',
    tipo_promocion: 'precio_unitario',
    cantidad_minima: 1,
    precio_unitario_promo: '',
    cantidad_paga: '',
    fecha_inicio: getFechaHoy(),
    fecha_fin: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [promocionesRes, productosRes] = await Promise.all([
        promocionService.getAll(),
        productoService.getAll()
      ])
      setPromociones(promocionesRes.data || [])
      setProductos(productosRes.data || [])
    } catch (error) {
      console.error('Error cargando promociones:', error)
      alert(error.response?.data?.message || 'Error al cargar promociones')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      nombre: '',
      descripcion: '',
      producto_id: '',
      tipo_promocion: 'precio_unitario',
      cantidad_minima: 1,
      precio_unitario_promo: '',
      cantidad_paga: '',
      fecha_inicio: getFechaHoy(),
      fecha_fin: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (
        formData.tipo_promocion === 'x_por_y' &&
        parseInt(formData.cantidad_paga, 10) >= parseInt(formData.cantidad_minima, 10)
      ) {
        alert('En promo X por Y, la cantidad que paga debe ser menor a la cantidad mínima')
        return
      }

      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || null,
        producto_id: parseInt(formData.producto_id, 10),
        cantidad_minima: parseInt(formData.cantidad_minima, 10),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin
      }

      if (formData.tipo_promocion === 'precio_unitario') {
        dataToSend.precio_unitario_promo = parseFloat(formData.precio_unitario_promo)
      } else {
        dataToSend.cantidad_paga = parseInt(formData.cantidad_paga, 10)
      }

      if (editing) {
        await promocionService.update(editing.id, dataToSend)
      } else {
        await promocionService.create(dataToSend)
      }

      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar promoción')
    }
  }

  const handleEdit = (promocion) => {
    const tipoPromocion = promocion.precio_total_promo ? 'x_por_y' : 'precio_unitario'
    const producto = productos.find((p) => p.id === promocion.producto_id)
    const cantidadPagaDerivada =
      tipoPromocion === 'x_por_y' && producto?.precio
        ? Math.round(parseFloat(promocion.precio_total_promo) / parseFloat(producto.precio))
        : ''

    setEditing(promocion)
    setFormData({
      nombre: promocion.nombre || '',
      descripcion: promocion.descripcion || '',
      producto_id: promocion.producto_id || '',
      tipo_promocion: tipoPromocion,
      cantidad_minima: promocion.cantidad_minima || 1,
      precio_unitario_promo: promocion.precio_unitario_promo || promocion.precio_promocional || '',
      cantidad_paga: cantidadPagaDerivada,
      fecha_inicio: promocion.fecha_inicio ? promocion.fecha_inicio.split('T')[0] : '',
      fecha_fin: promocion.fecha_fin ? promocion.fecha_fin.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleDesactivar = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas desactivar esta promoción?')
    if (!confirmar) return

    try {
      await promocionService.desactivar(id)
      loadData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al desactivar promoción')
    }
  }

  const handleActivar = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas activar esta promoción?')
    if (!confirmar) return

    try {
      await promocionService.update(id, { activa: true })
      loadData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al activar promoción')
    }
  }

  const promocionesFiltradas = promociones.filter((p) => {
    if (filtroEstado === 'activas') return p.activa
    if (filtroEstado === 'inactivas') return !p.activa
    return true
  })

  const getNombreProducto = (promocion) => {
    if (promocion.producto_nombre) return promocion.producto_nombre
    const producto = productos.find((p) => p.id === promocion.producto_id)
    return producto?.nombre || `Producto ${promocion.producto_id}`
  }

  const getTipoPromocion = (promocion) => {
    return promocion.precio_total_promo ? 'X por Y' : 'Precio Unitario'
  }

  const getDetallePromocion = (promocion) => {
    if (promocion.precio_total_promo) {
      const producto = productos.find((p) => p.id === promocion.producto_id)
      if (producto?.precio) {
        const cantidadPaga = Math.round(parseFloat(promocion.precio_total_promo) / parseFloat(producto.precio))
        return `${promocion.cantidad_minima}x${cantidadPaga}`
      }
      return `$${parseFloat(promocion.precio_total_promo).toLocaleString()} por ${promocion.cantidad_minima}`
    }
    const precioUnitario = promocion.precio_unitario_promo || promocion.precio_promocional
    return `$${parseFloat(precioUnitario || 0).toLocaleString()} c/u`
  }

  if (loading) {
    return <div className="loading">Cargando promociones...</div>
  }

  return (
    <div className="promociones">
      <div className="page-header">
        <h1>Promociones</h1>
        <div className="filtros-promociones">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="activas">Solo activas</option>
            <option value="inactivas">Solo inactivas</option>
          </select>
          {esAdmin && (
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="btn-primary"
            >
              + Nueva Promoción
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad Mínima</th>
              <th>Detalle Promo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              {esAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {promocionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={esAdmin ? 10 : 9} style={{ textAlign: 'center', padding: '20px' }}>
                  No hay promociones para el filtro seleccionado
                </td>
              </tr>
            ) : (
              promocionesFiltradas.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{getNombreProducto(p)}</td>
                  <td>{getTipoPromocion(p)}</td>
                  <td>{p.cantidad_minima}</td>
                  <td>{getDetallePromocion(p)}</td>
                  <td>{p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : '-'}</td>
                  <td>{p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`badge ${p.activa ? 'active' : 'inactive'}`}>
                      {p.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  {esAdmin && (
                    <td>
                      <button onClick={() => handleEdit(p)} className="btn-edit">
                        Editar
                      </button>
                      {p.activa ? (
                        <button onClick={() => handleDesactivar(p.id)} className="btn-delete">
                          Desactivar
                        </button>
                      ) : (
                        <button onClick={() => handleActivar(p.id)} className="btn-primary">
                          Activar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false)
            resetForm()
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar' : 'Nueva'} Promoción</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Producto *</label>
                <select
                  value={formData.producto_id}
                  onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} (${parseFloat(producto.precio).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de Promoción *</label>
                <select
                  value={formData.tipo_promocion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo_promocion: e.target.value,
                      precio_unitario_promo: '',
                      cantidad_paga: ''
                    })
                  }
                >
                  <option value="precio_unitario">Precio Unitario Promocional</option>
                  <option value="x_por_y">X por Y (ej: 3x2)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cantidad Mínima *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad_minima}
                  onChange={(e) => setFormData({ ...formData, cantidad_minima: e.target.value })}
                  required
                />
              </div>

              {formData.tipo_promocion === 'precio_unitario' ? (
                <div className="form-group">
                  <label>Precio Unitario Promocional *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_unitario_promo}
                    onChange={(e) => setFormData({ ...formData, precio_unitario_promo: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Cantidad que paga (Y) *</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, parseInt(formData.cantidad_minima || 1, 10) - 1)}
                    value={formData.cantidad_paga}
                    onChange={(e) => setFormData({ ...formData, cantidad_paga: e.target.value })}
                    required
                  />
                  <small>
                    Ejemplo: si cantidad mínima es 3 y aquí pones 2, la promo será 3x2.
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>Fecha Inicio *</label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha Fin *</label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  required
                />
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Promociones
