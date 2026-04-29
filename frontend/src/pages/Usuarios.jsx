import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usuarioService } from '../services/usuarioService'
import './Productos.css'
import './Usuarios.css'

const Usuarios = () => {
  const { user } = useAuth()
  const esAdmin = user?.rol === 'admin'

  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol: 'cajera',
    nombre_completo: ''
  })

  useEffect(() => {
    if (!esAdmin) {
      setLoading(false)
      return
    }
    loadData()
  }, [esAdmin])

  const loadData = async () => {
    try {
      const response = await usuarioService.getAll()
      setUsuarios(response.data || [])
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      username: '',
      password: '',
      rol: 'cajera',
      nombre_completo: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        const payload = {
          username: formData.username.trim(),
          rol: formData.rol,
          nombre_completo: formData.nombre_completo.trim()
        }
        if (formData.password && formData.password.trim() !== '') {
          payload.password = formData.password
        }
        await usuarioService.update(editing.id, payload)
      } else {
        await usuarioService.create({
          username: formData.username.trim(),
          password: formData.password,
          rol: formData.rol,
          nombre_completo: formData.nombre_completo.trim()
        })
      }

      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar usuario')
    }
  }

  const handleEdit = (usuario) => {
    setEditing(usuario)
    setFormData({
      username: usuario.username || '',
      password: '',
      rol: usuario.rol || 'cajera',
      nombre_completo: usuario.nombre_completo || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id, username) => {
    if (window.confirm(`¿Estás seguro de desactivar al usuario "${username}"?`)) {
      try {
        await usuarioService.delete(id)
        loadData()
      } catch (error) {
        alert(error.response?.data?.message || 'Error al desactivar usuario')
      }
    }
  }

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>
  }

  if (!esAdmin) {
    return (
      <div className="usuarios">
        <div className="table-container" style={{ padding: '20px' }}>
          No tienes permisos para gestionar usuarios.
        </div>
      </div>
    )
  }

  return (
    <div className="usuarios">
      <div className="page-header">
        <h1>Usuarios</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary"
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No hay usuarios activos
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.nombre_completo || '-'}</td>
                  <td>
                    <span className={`badge ${u.rol === 'admin' ? 'active' : 'inactive'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(u)} className="btn-edit">
                      Editar
                    </button>
                    {Number(u.id) !== Number(user?.id) && (
                      <button onClick={() => handleDelete(u.id, u.username)} className="btn-delete">
                        Desactivar
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
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false)
            resetForm()
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar' : 'Nuevo'} Usuario</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Usuario *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{editing ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editing}
                />
              </div>

              <div className="form-group">
                <label>Nombre completo *</label>
                <input
                  type="text"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  required
                >
                  <option value="admin">admin</option>
                  <option value="cajera">cajera</option>
                </select>
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

export default Usuarios
