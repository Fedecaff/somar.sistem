import { useEffect, useState } from 'react'
import { reporteService } from '../services/reporteService'
import './Reportes.css'

const Reportes = () => {
  const [reporte, setReporte] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tipoReporte, setTipoReporte] = useState('ventas-diarias')
  const [fecha, setFecha] = useState(reporteService.getFechaHoy())
  const [fechaInicio, setFechaInicio] = useState(reporteService.getPrimerDiaMesActual())
  const [fechaFin, setFechaFin] = useState(reporteService.getFechaHoy())
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [año, setAño] = useState(new Date().getFullYear())

  useEffect(() => {
    setReporte(null)
  }, [tipoReporte])

  const handleGenerarReporte = async () => {
    setLoading(true)
    setReporte(null)
    try {
      let response
      switch (tipoReporte) {
        case 'ventas-diarias':
          response = await reporteService.getVentasDiarias(fecha)
          break
        case 'ventas-mensuales':
          response = await reporteService.getVentasMensuales(mes, año)
          break
        case 'ventas-medio-pago':
          response = await reporteService.getVentasPorMedioPago(fechaInicio, fechaFin)
          break
        case 'ventas-tipo':
          response = await reporteService.getVentasPorTipo(fechaInicio, fechaFin)
          break
        case 'planes-activos':
          response = await reporteService.getPlanesActivos()
          break
        case 'planes-vencidos':
          response = await reporteService.getPlanesVencidos()
          break
        case 'viandas-retiradas':
          response = await reporteService.getRetirosViandaPorDia(fecha)
          break
        default:
          return
      }
      const data = response && Object.prototype.hasOwnProperty.call(response, 'data')
        ? response.data
        : response
      setReporte(data)
    } catch (error) {
      alert(error.response?.data?.message || 'Error al generar reporte')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const renderTable = (headers, rows, emptyText = 'Sin datos para mostrar') => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return <div className="empty-report">{emptyText}</div>
    }

    return (
      <div className="table-container reporte-table">
        <table>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                {row.map((col, colIdx) => (
                  <td key={`${idx}-${colIdx}`}>{col}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderReporte = () => {
    if (!reporte) return null

    switch (tipoReporte) {
      case 'ventas-diarias':
        return (
          <div className="cards-grid">
            <div className="card-metric">
              <span>Total ventas</span>
              <strong>{reporte.total_ventas || 0}</strong>
            </div>
            <div className="card-metric">
              <span>Monto total</span>
              <strong>${parseFloat(reporte.total_monto || 0).toLocaleString()}</strong>
            </div>
            <div className="card-metric">
              <span>Monto efectivo</span>
              <strong>${parseFloat(reporte.monto_efectivo || 0).toLocaleString()}</strong>
            </div>
            <div className="card-metric">
              <span>Monto transferencia</span>
              <strong>${parseFloat(reporte.monto_transferencia || 0).toLocaleString()}</strong>
            </div>
          </div>
        )

      case 'ventas-mensuales':
        return renderTable(
          ['Fecha', 'Ventas', 'Monto total', 'Efectivo', 'Transferencia'],
          (Array.isArray(reporte) ? reporte : []).map((item) => [
            item.fecha ? new Date(item.fecha).toLocaleDateString() : '-',
            item.total_ventas || 0,
            `$${parseFloat(item.total_monto || 0).toLocaleString()}`,
            `$${parseFloat(item.monto_efectivo || 0).toLocaleString()}`,
            `$${parseFloat(item.monto_transferencia || 0).toLocaleString()}`
          ]),
          'No hay ventas en el período seleccionado'
        )

      case 'ventas-medio-pago':
        return renderTable(
          ['Medio de pago', 'Ventas', 'Monto total', 'Promedio venta'],
          (Array.isArray(reporte) ? reporte : []).map((item) => [
            item.medio_pago || '-',
            item.total_ventas || 0,
            `$${parseFloat(item.total_monto || 0).toLocaleString()}`,
            `$${parseFloat(item.promedio_venta || 0).toLocaleString()}`
          ]),
          'No hay datos para el período seleccionado'
        )

      case 'ventas-tipo':
        return renderTable(
          ['Tipo', 'Ventas', 'Monto total', 'Promedio venta'],
          (Array.isArray(reporte) ? reporte : []).map((item) => [
            item.tipo_venta || '-',
            item.total_ventas || 0,
            `$${parseFloat(item.total_monto || 0).toLocaleString()}`,
            `$${parseFloat(item.promedio_venta || 0).toLocaleString()}`
          ]),
          'No hay datos para el período seleccionado'
        )

      case 'planes-activos':
      case 'planes-vencidos':
        return renderTable(
          ['Plan', 'Cliente', 'Inicio', 'Fin', 'Estado', 'Retiros realizados'],
          (Array.isArray(reporte) ? reporte : []).map((item) => [
            item.id,
            item.cliente_nombre || '-',
            item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() : '-',
            item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : '-',
            item.estado || '-',
            item.retiros_realizados || 0
          ]),
          'No hay planes para mostrar'
        )

      case 'viandas-retiradas':
        return (
          <div className="cards-grid">
            <div className="card-metric">
              <span>Total retiros</span>
              <strong>{reporte.total_retiros || 0}</strong>
            </div>
            <div className="card-metric">
              <span>Clientes que retiraron</span>
              <strong>{reporte.clientes_retiraron || 0}</strong>
            </div>
            <div className="card-metric">
              <span>Retiros completados</span>
              <strong>{reporte.retiros_completados || 0}</strong>
            </div>
            <div className="card-metric">
              <span>Retiros pendientes</span>
              <strong>{reporte.retiros_pendientes || 0}</strong>
            </div>
          </div>
        )

      default:
        return <pre>{JSON.stringify(reporte, null, 2)}</pre>
    }
  }

  return (
    <div className="reportes">
      <h1>Reportes</h1>
      
      <div className="reporte-controls">
        <div className="form-group">
          <label>Tipo de Reporte</label>
          <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
            <option value="ventas-diarias">Ventas Diarias</option>
            <option value="ventas-mensuales">Ventas Mensuales</option>
            <option value="ventas-medio-pago">Ventas por Medio de Pago</option>
            <option value="ventas-tipo">Ventas por Tipo</option>
            <option value="planes-activos">Planes Vianda Activos</option>
            <option value="planes-vencidos">Planes Vianda Vencidos</option>
            <option value="viandas-retiradas">Viandas Retiradas</option>
          </select>
        </div>

        {tipoReporte === 'ventas-diarias' && (
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        )}

        {tipoReporte === 'viandas-retiradas' && (
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        )}

        {tipoReporte === 'ventas-mensuales' && (
          <>
            <div className="form-group">
              <label>Mes</label>
              <input
                type="number"
                min="1"
                max="12"
                value={mes}
                onChange={(e) => setMes(parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Año</label>
              <input
                type="number"
                min="2020"
                max="2100"
                value={año}
                onChange={(e) => setAño(parseInt(e.target.value))}
              />
            </div>
          </>
        )}

        {(tipoReporte === 'ventas-medio-pago' || tipoReporte === 'ventas-tipo') && (
          <>
            <div className="form-group">
              <label>Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </>
        )}

        <button onClick={handleGenerarReporte} className="btn-primary" disabled={loading}>
          {loading ? 'Generando...' : 'Generar Reporte'}
        </button>
      </div>

      {reporte && (
        <div className="reporte-resultado">
          <h2>Resultado del Reporte</h2>
          {renderReporte()}
        </div>
      )}
    </div>
  )
}

export default Reportes

