import { useEffect, useState } from 'react'
import { categoriaService } from '../services/categoriaService'
import './Categorias.css'

const Categorias = () => {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await categoriaService.getAll()
      setCategorias(response.data || [])
    } catch (error) {
      console.error('Error cargando categorías:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await categoriaService.update(editing.id, formData)
      } else {
        await categoriaService.create(formData)
      }
      setShowModal(false)
      setEditing(null)
      setFormData({ nombre: '', descripcion: '' })
      loadData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar categoría')
    }
  }

  const handleEdit = (categoria) => {
    setEditing(categoria)
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desactivar esta categoría?')) {
      try {
        await categoriaService.delete(id)
        loadData()
      } catch (error) {
        alert(error.response?.data?.message || 'Error al desactivar categoría')
      }
    }
  }

  const handleActivar = async (id) => {
    if (window.confirm('¿Estás seguro de activar esta categoría?')) {
      try {
        await categoriaService.update(id, { activo: true })
        loadData()
      } catch (error) {
        alert(error.response?.data?.message || 'Error al activar categoría')
      }
    }
  }

  const handleDeletePermanent = async (id) => {
    if (
      window.confirm(
        '¿Estás seguro de eliminar permanentemente esta categoría? Esta acción no se puede deshacer.'
      )
    ) {
      try {
        await categoriaService.deletePermanent(id)
        loadData()
      } catch (error) {
        alert(
          error.response?.data?.message ||
            'Error al eliminar permanentemente la categoría'
        )
      }
    }
  }

  if (loading) {
    return <div className="loading">Cargando categorías...</div>
  }

  return (
    <div className="categorias">
      <div className="page-header">
        <h1>Categorías</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Nueva Categoría
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombre}</td>
                <td>{c.descripcion || '-'}</td>
                <td>
                  <span className={`badge ${c.activo ? 'active' : 'inactive'}`}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(c)} className="btn-edit">
                    Editar
                  </button>
                  {c.activo ? (
                    <button onClick={() => handleDelete(c.id)} className="btn-delete">
                      Desactivar
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleActivar(c.id)} className="btn-primary" style={{ marginLeft: '5px' }}>
                        Activar
                      </button>
                      <button
                        onClick={() => handleDeletePermanent(c.id)}
                        className="btn-delete"
                        style={{ marginLeft: '5px' }}
                      >
                        Eliminar
                      </button>
                    </>
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
          setEditing(null)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar' : 'Nueva'} Categoría</h2>
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
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowModal(false)
                  setEditing(null)
                }} className="btn-secondary">
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

export default Categorias

