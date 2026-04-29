import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sabores de mi Tierra</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            📊 Dashboard
          </Link>
          <Link to="/ventas" className="nav-item">
            💰 Ventas
          </Link>
          <Link to="/productos" className="nav-item">
            🍗 Productos
          </Link>
          <Link to="/categorias" className="nav-item">
            📁 Categorías
          </Link>
          <Link to="/clientes" className="nav-item">
            👥 Clientes
          </Link>
          <Link to="/planes-vianda" className="nav-item">
            🍱 Planes de Vianda
          </Link>
          <Link to="/retiros-vianda" className="nav-item">
            📋 Retiros de Vianda
          </Link>
          <Link to="/pagos-vianda" className="nav-item">
            💳 Pagos Vianda
          </Link>
          <Link to="/pedidos-cocina" className="nav-item">
            👨‍🍳 Pedidos Cocina
          </Link>
          <Link to="/promociones" className="nav-item">
            🏷️ Promociones
          </Link>
          {user?.rol === 'admin' && (
            <Link to="/usuarios" className="nav-item">
              👤 Usuarios
            </Link>
          )}
          <Link to="/reportes" className="nav-item">
            📈 Reportes
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.nombre_completo || user?.username}</div>
            <div className="user-role">{user?.rol}</div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

