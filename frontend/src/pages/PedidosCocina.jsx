import { useEffect, useState } from 'react'
import { pedidosCocinaService } from '../services/pedidosCocinaService'
import { getFechaHoy } from '../utils/dateUtils'
import './PedidosCocina.css'

const PedidosCocina = () => {
  const [pedidos, setPedidos] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fechaFiltro, setFechaFiltro] = useState(getFechaHoy())
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)

  useEffect(() => {
    loadData()
  }, [fechaFiltro])

  const loadData = async () => {
    try {
      const [pedidosRes, estadisticasRes] = await Promise.all([
        pedidosCocinaService.getPedidosDelDia(fechaFiltro),
        pedidosCocinaService.getEstadisticas(fechaFiltro)
      ])
      setPedidos(pedidosRes.data || [])
      setEstadisticas(estadisticasRes.data || {})
    } catch (error) {
      console.error('Error cargando pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarPreparado = async (id) => {
    try {
      await pedidosCocinaService.marcarPreparado(id)
      loadData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al marcar como preparado')
    }
  }

  const handleVerDetalle = async (id) => {
    try {
      const response = await pedidosCocinaService.getPedidoById(id)
      setPedidoSeleccionado(response.data)
    } catch (error) {
      alert(error.response?.data?.message || 'Error al obtener detalle')
    }
  }

  const handleImprimirTicket = async (id) => {
    try {
      const response = await pedidosCocinaService.getTicket(id)
      if (response.success && response.ticket) {
        const ticketWindow = window.open('', '_blank')
        if (ticketWindow) {
          ticketWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Ticket Cocina #${id}</title>
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
                  @media print {
                    body {
                      background: white;
                      padding: 0;
                    }
                    pre {
                      box-shadow: none;
                      border: none;
                    }
                  }
                </style>
              </head>
              <body>
                <pre>${response.ticket}</pre>
                <script>
                  window.onload = function() {
                    window.print();
                  }
                </script>
              </body>
            </html>
          `)
          ticketWindow.document.close()
        }
      } else {
        alert('No se pudo obtener el ticket')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al obtener ticket')
    }
  }

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>
  }

  const pedidosPendientes = pedidos.filter(p => !p.preparado)
  const pedidosPreparados = pedidos.filter(p => p.preparado)

  return (
    <div className="pedidos-cocina">
      <div className="page-header">
        <h1>👨‍🍳 Pedidos de Cocina</h1>
        <div className="header-actions">
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="fecha-filtro"
          />
        </div>
      </div>

      {estadisticas && (
        <div className="estadisticas">
          <div className="stat-card">
            <div className="stat-value">{estadisticas.total_pedidos || 0}</div>
            <div className="stat-label">Total Pedidos</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-value">{estadisticas.pedidos_pendientes || 0}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-value">{estadisticas.pedidos_preparados || 0}</div>
            <div className="stat-label">Preparados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{estadisticas.pedidos_mostrador || 0}</div>
            <div className="stat-label">Mostrador</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{estadisticas.pedidos_vianda || 0}</div>
            <div className="stat-label">Vianda</div>
          </div>
        </div>
      )}

      <div className="pedidos-container">
        <div className="pedidos-section">
          <h2>Pendientes ({pedidosPendientes.length})</h2>
          <div className="pedidos-grid">
            {pedidosPendientes.map((pedido) => (
              <div key={pedido.id} className="pedido-card pending">
                <div className="pedido-header">
                  <div className="pedido-numero">
                    Ticket #{pedido.numero_ticket}
                  </div>
                  <span className={`badge tipo-${pedido.tipo_venta}`}>
                    {pedido.tipo_venta.toUpperCase()}
                  </span>
                </div>
                <div className="pedido-cliente">
                  <strong>Cliente:</strong> {pedido.cliente_nombre || 'N/A'}
                </div>
                <div className="pedido-descripcion">
                  <strong>Pedido:</strong>
                  <pre>{pedido.descripcion_pedido}</pre>
                </div>
                <div className="pedido-fecha">
                  {new Date(pedido.fecha_emision).toLocaleString()}
                </div>
                <div className="pedido-actions">
                  <button
                    onClick={() => handleVerDetalle(pedido.id)}
                    className="btn-secondary small"
                  >
                    Ver Detalle
                  </button>
                  <button
                    onClick={() => handleImprimirTicket(pedido.id)}
                    className="btn-secondary small"
                    title="Imprimir ticket"
                  >
                    🖨️ Imprimir
                  </button>
                  <button
                    onClick={() => handleMarcarPreparado(pedido.id)}
                    className="btn-primary small"
                  >
                    ✓ Marcar Entregado
                  </button>
                </div>
              </div>
            ))}
            {pedidosPendientes.length === 0 && (
              <div className="empty-state">No hay pedidos pendientes</div>
            )}
          </div>
        </div>

        <div className="pedidos-section">
          <h2>Preparados ({pedidosPreparados.length})</h2>
          <div className="pedidos-grid">
            {pedidosPreparados.map((pedido) => (
              <div key={pedido.id} className="pedido-card completed">
                <div className="pedido-header">
                  <div className="pedido-numero">
                    Ticket #{pedido.numero_ticket}
                  </div>
                  <span className={`badge tipo-${pedido.tipo_venta}`}>
                    {pedido.tipo_venta.toUpperCase()}
                  </span>
                </div>
                <div className="pedido-cliente">
                  <strong>Cliente:</strong> {pedido.cliente_nombre || 'N/A'}
                </div>
                <div className="pedido-descripcion">
                  <strong>Pedido:</strong>
                  <pre>{pedido.descripcion_pedido}</pre>
                </div>
                <div className="pedido-fecha">
                  {new Date(pedido.fecha_emision).toLocaleString()}
                </div>
                <div className="pedido-actions">
                  <button
                    onClick={() => handleVerDetalle(pedido.id)}
                    className="btn-secondary small"
                  >
                    Ver Detalle
                  </button>
                  <button
                    onClick={() => handleImprimirTicket(pedido.id)}
                    className="btn-secondary small"
                    title="Imprimir ticket"
                  >
                    🖨️ Imprimir
                  </button>
                  <span className="badge completed">✓ Entregado</span>
                </div>
              </div>
            ))}
            {pedidosPreparados.length === 0 && (
              <div className="empty-state">No hay pedidos preparados</div>
            )}
          </div>
        </div>
      </div>

      {pedidoSeleccionado && (
        <div className="modal-overlay" onClick={() => setPedidoSeleccionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Detalle del Pedido</h2>
            <div className="detalle-pedido">
              <div className="detalle-item">
                <strong>Ticket #:</strong> {pedidoSeleccionado.numero_ticket}
              </div>
              <div className="detalle-item">
                <strong>Tipo:</strong> {pedidoSeleccionado.tipo_venta.toUpperCase()}
              </div>
              <div className="detalle-item">
                <strong>Cliente:</strong> {pedidoSeleccionado.cliente_nombre || 'N/A'}
              </div>
              <div className="detalle-item">
                <strong>Fecha:</strong> {new Date(pedidoSeleccionado.fecha_emision).toLocaleString()}
              </div>
              <div className="detalle-item">
                <strong>Estado:</strong>{' '}
                <span className={`badge ${pedidoSeleccionado.preparado ? 'completed' : 'pending'}`}>
                  {pedidoSeleccionado.preparado ? 'Preparado' : 'Pendiente'}
                </span>
              </div>
              {pedidoSeleccionado.total_venta && (
                <div className="detalle-item">
                  <strong>Total:</strong> ${parseFloat(pedidoSeleccionado.total_venta).toLocaleString()}
                </div>
              )}
              <div className="detalle-item full-width">
                <strong>Pedido:</strong>
                <pre className="pedido-completo">{pedidoSeleccionado.descripcion_pedido}</pre>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="btn-secondary"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleImprimirTicket(pedidoSeleccionado.id)}
                className="btn-secondary"
              >
                🖨️ Imprimir Ticket
              </button>
              {!pedidoSeleccionado.preparado && (
                <button
                  onClick={() => {
                    handleMarcarPreparado(pedidoSeleccionado.id)
                    setPedidoSeleccionado(null)
                  }}
                  className="btn-primary"
                >
                  ✓ Marcar Entregado
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PedidosCocina

