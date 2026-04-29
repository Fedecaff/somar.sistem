import { useEffect, useState } from 'react'
import { ventaService } from '../services/ventaService'
import { productoService } from '../services/productoService'
import { clienteService } from '../services/clienteService'
import { promocionService } from '../services/promocionService'
import './Ventas.css'

const Ventas = () => {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [promocionesDetalle, setPromocionesDetalle] = useState({})
  const [formData, setFormData] = useState({
    tipo_venta: 'mostrador',
    medio_pago: 'efectivo',
    nombre_cliente: '',
    cliente_id: null,
    detalles: [{ producto_id: '', cantidad: 1 }]
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const actualizarPromociones = async () => {
      if (!showModal) return

      const resultados = {}
      await Promise.all(
        formData.detalles.map(async (detalle, index) => {
          const productoId = parseInt(detalle.producto_id, 10)
          const cantidad = parseInt(detalle.cantidad, 10)

          if (!productoId || !cantidad || cantidad < 1) return

          try {
            const response = await promocionService.calcularPrecio(productoId, cantidad)
            resultados[index] = response.data
          } catch (error) {
            // Si falla el cálculo, no bloquear la UI.
          }
        })
      )
      setPromocionesDetalle(resultados)
    }

    actualizarPromociones()
  }, [formData.detalles, showModal])

  const loadData = async () => {
    try {
      const [ventasRes, productosRes, clientesRes] = await Promise.all([
        ventaService.getAll(),
        productoService.getAll(),
        clienteService.getAll()
      ])
      setVentas(ventasRes.data || [])
      setProductos(productosRes.data || [])
      setClientes(clientesRes.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductoChange = (index, productoId) => {
    const nuevosDetalles = [...formData.detalles]
    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      producto_id: productoId
    }
    setFormData({ ...formData, detalles: nuevosDetalles })
  }

  const addDetalle = () => {
    setFormData({
      ...formData,
      detalles: [...formData.detalles, { producto_id: '', cantidad: 1 }]
    })
  }

  const removeDetalle = (index) => {
    const nuevosDetalles = formData.detalles.filter((_, i) => i !== index)
    setFormData({ ...formData, detalles: nuevosDetalles })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Preparar datos para enviar al backend
      const ventaData = {
        tipo_venta: 'mostrador', // Solo mostrador
        medio_pago: formData.medio_pago,
        nombre_cliente: formData.nombre_cliente || null,
        cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
        productos: formData.detalles
          .filter(d => d.producto_id) // Solo productos seleccionados
          .map(d => ({
            producto_id: parseInt(d.producto_id),
            cantidad: parseInt(d.cantidad)
          }))
      }

      await ventaService.create(ventaData)
      setShowModal(false)
      setPromocionesDetalle({})
      setFormData({
        tipo_venta: 'mostrador',
        medio_pago: 'efectivo',
        nombre_cliente: '',
        cliente_id: null,
        detalles: [{ producto_id: '', cantidad: 1 }]
      })
      loadData()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al crear venta'
      alert(errorMessage)
    }
  }


  // Calcular subtotal de un producto
  const calcularSubtotal = (detalle) => {
    if (!detalle.producto_id || !detalle.cantidad) return 0
    const idx = formData.detalles.indexOf(detalle)
    const promoData = promocionesDetalle[idx]
    if (promoData?.tiene_promocion) {
      return parseFloat(promoData.precio_total) || 0
    }
    const producto = productos.find(p => p.id === parseInt(detalle.producto_id))
    if (!producto) return 0
    const precio = parseFloat(producto.precio) || 0
    const cantidad = parseInt(detalle.cantidad) || 0
    return precio * cantidad
  }

  // Calcular total de la venta
  const calcularTotal = () => {
    return formData.detalles.reduce((total, detalle) => {
      return total + calcularSubtotal(detalle)
    }, 0)
  }

  const handleViewTicket = async (ventaId) => {
    try {
      const response = await ventaService.getTicket(ventaId)
      if (response.success && response.data.ticket) {
        const ticketWindow = window.open('', '_blank')
        if (ticketWindow) {
          ticketWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Ticket de Venta #${ventaId}</title>
                <style>
                  body {
                    font-family: 'Courier New', monospace;
                    padding: 20px;
                    background: #f5f5f5;
                    margin: 0;
                  }
                  pre {
                    background: white;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    max-width: 400px;
                    margin: 0 auto;
                  }
                </style>
              </head>
              <body>
                <pre>${response.data.ticket}</pre>
              </body>
            </html>
          `)
          ticketWindow.document.close()
        }
      } else {
        alert('No se pudo obtener el ticket')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener ticket'
      alert(errorMessage)
    }
  }

  if (loading) {
    return <div className="loading">Cargando ventas...</div>
  }

  return (
    <div className="ventas">
      <div className="page-header">
        <h1>Ventas</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Nueva Venta
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Observaciones</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => {
              // Usar cliente_nombre del backend (viene del ticket o del cliente registrado)
              // Solo mostrar "Cliente General" si realmente no hay nombre
              const nombreCliente = v.cliente_nombre || 'Cliente General'
              return (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{new Date(v.fecha_venta).toLocaleString()}</td>
                  <td>{nombreCliente}</td>
                  <td>{v.observaciones || '-'}</td>
                  <td>${parseFloat(v.total).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleViewTicket(v.id)} className="btn-edit">
                      Ver Ticket
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva Venta</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Medio de Pago *</label>
                <select
                  value={formData.medio_pago}
                  onChange={(e) => setFormData({ ...formData, medio_pago: e.target.value })}
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nombre del Cliente</label>
                <input
                  type="text"
                  value={formData.nombre_cliente}
                  onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
                  placeholder="Ingrese el nombre del cliente (opcional)"
                />
                <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                  Puede ser un cliente registrado o no. Solo para identificación.
                </small>
              </div>

              <div className="detalles-section">
                <div className="section-header">
                  <h3>Detalles de Venta</h3>
                  <button type="button" onClick={addDetalle} className="btn-primary small">
                    + Agregar Producto
                  </button>
                </div>
                {formData.detalles.map((detalle, index) => {
                  const producto = productos.find(p => p.id === parseInt(detalle.producto_id))
                  const precioUnitario = producto ? parseFloat(producto.precio) : 0
                  const promoData = promocionesDetalle[index]
                  const subtotal = calcularSubtotal(detalle)
                  
                  return (
                    <div key={index} className="detalle-row">
                      <select
                        value={detalle.producto_id}
                        onChange={(e) => handleProductoChange(index, e.target.value)}
                        required
                      >
                        <option value="">Seleccione producto...</option>
                        {productos.filter(p => p.activo).map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={detalle.cantidad}
                        onChange={(e) => {
                          const nuevosDetalles = [...formData.detalles]
                          nuevosDetalles[index].cantidad = parseInt(e.target.value) || 1
                          setFormData({ ...formData, detalles: nuevosDetalles })
                        }}
                        required
                        placeholder="Cantidad"
                        className="cantidad-input"
                      />
                      {detalle.producto_id && (
                        <>
                          <div className="precio-info">
                            <div className="precio-unitario">
                              <span className="precio-label">Precio unitario:</span>
                              <span className="precio-value">${precioUnitario.toLocaleString()}</span>
                            </div>
                            <div className="subtotal-display">
                              <span className="subtotal-label">Subtotal:</span>
                              <span className="subtotal-value">${subtotal.toLocaleString()}</span>
                            </div>
                            {promoData?.tiene_promocion && (
                              <div className="subtotal-display" style={{ color: '#27ae60' }}>
                                <span className="subtotal-label">Promo aplicada:</span>
                                <span className="subtotal-value">
                                  {promoData.promocion?.nombre || 'Promoción'}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {formData.detalles.length > 1 && (
                        <button type="button" onClick={() => removeDetalle(index)} className="btn-delete small">
                          Eliminar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Resumen de totales */}
              <div className="venta-resumen">
                <div className="resumen-total">
                  <span className="total-label">Total de la Venta:</span>
                  <span className="total-value">${calcularTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ventas

