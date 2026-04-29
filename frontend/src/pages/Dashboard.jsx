import { useEffect, useState } from 'react'
import { reporteService } from '../services/reporteService'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    loading: true
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const hoy = new Date().toISOString().split('T')[0]
        const mes = new Date().getMonth() + 1
        const año = new Date().getFullYear()

        const [ventasHoy, ventasMes] = await Promise.all([
          reporteService.getVentasDiarias(hoy).catch(() => ({ data: { total: 0 } })),
          reporteService.getVentasMensuales(mes, año).catch(() => ({ data: { total: 0 } }))
        ])

        const ventasHoyMonto = parseFloat(ventasHoy.data?.total_monto || 0)
        const ventasMesMonto = Array.isArray(ventasMes.data)
          ? ventasMes.data.reduce((acum, dia) => acum + parseFloat(dia.total_monto || 0), 0)
          : parseFloat(ventasMes.data?.total_monto || ventasMes.data?.total || 0)

        setStats({
          ventasHoy: Number.isNaN(ventasHoyMonto) ? 0 : ventasHoyMonto,
          ventasMes: Number.isNaN(ventasMesMonto) ? 0 : ventasMesMonto,
          loading: false
        })
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    loadStats()
  }, [])

  if (stats.loading) {
    return <div className="dashboard-loading">Cargando estadísticas...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Ventas Hoy</h3>
            <p className="stat-value">${stats.ventasHoy.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Ventas del Mes</h3>
            <p className="stat-value">${stats.ventasMes.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

