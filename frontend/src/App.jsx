import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Productos from './pages/Productos'
import Categorias from './pages/Categorias'
import Ventas from './pages/Ventas'
import Clientes from './pages/Clientes'
import Reportes from './pages/Reportes'
import PlanesVianda from './pages/PlanesVianda'
import RetirosVianda from './pages/RetirosVianda'
import PedidosCocina from './pages/PedidosCocina'
import Promociones from './pages/Promociones'
import PagosVianda from './pages/PagosVianda'
import Usuarios from './pages/Usuarios'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="planes-vianda" element={<PlanesVianda />} />
            <Route path="retiros-vianda" element={<RetirosVianda />} />
            <Route path="pagos-vianda" element={<PagosVianda />} />
            <Route path="pedidos-cocina" element={<PedidosCocina />} />
            <Route path="promociones" element={<Promociones />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

