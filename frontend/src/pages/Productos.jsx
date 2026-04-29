import { useEffect, useState } from 'react'
import { productoService } from '../services/productoService'
import { categoriaService } from '../services/categoriaService'
import './Productos.css'

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio: '',
    es_menu_fijo: false,
    solo_mostrador: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll()
      ])
      setProductos(productosRes.data || [])
      setCategorias(categoriasRes.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await productoService.update(editing.id, formData)
      } else {
        await productoService.create(formData)
      }
      setShowModal(false)
      setEditing(null)
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: '',
        precio: '',
        es_menu_fijo: false,
        solo_mostrador: false
      })
      loadData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar producto')
    }
  }

  const handleEdit = (producto) => {
    setEditing(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria_id: producto.categoria_id,
      precio: producto.precio,
      es_menu_fijo: producto.es_menu_fijo,
      solo_mostrador: producto.solo_mostrador
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desactivar este producto?')) {
      try {
        await productoService.delete(id)
        loadData()
      } catch (error) {
        alert(error.response?.data?.message || 'Error al desactivar producto')
      }
    }
  }

  const handleActivar = async (id) => {
    if (window.confirm('¿Estás seguro de activar este producto?')) {
      try {
        await productoService.update(id, { activo: true })
        loadData()
      } catch (error) {
        alert(error.response?.data?.message || 'Error al activar producto')
      }
    }
  }

  const handleDeletePermanent = async (id) => {
    if (
      window.confirm(
        '¿Estás seguro de eliminar permanentemente este producto? Esta acción no se puede deshacer.'
      )
    ) {
      try {
        await productoService.deletePermanent(id)
        loadData()
      } catch (error) {
        alert(
          error.response?.data?.message ||
            'Error al eliminar permanentemente el producto'
        )
      }
    }
  }

  if (loading) {
    return <div className="loading">Cargando productos...</div>
  }

  return (
    <div className="productos">
      <div className="page-header">
        <h1>Productos</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Nuevo Producto
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Menú Fijo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const categoria = categorias.find(c => c.id === p.categoria_id)
              return (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{categoria?.nombre || '-'}</td>
                  <td>${parseFloat(p.precio).toLocaleString()}</td>
                  <td>{p.es_menu_fijo ? 'Sí' : 'No'}</td>
                  <td>
                    <span className={`badge ${p.activo ? 'active' : 'inactive'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(p)} className="btn-edit">
                      Editar
                    </button>
                    {p.activo ? (
                      <button onClick={() => handleDelete(p.id)} className="btn-delete">
                        Desactivar
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleActivar(p.id)} className="btn-primary" style={{ marginLeft: '5px' }}>
                          Activar
                        </button>
                        <button
                          onClick={() => handleDeletePermanent(p.id)}
                          className="btn-delete"
                          style={{ marginLeft: '5px' }}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false)
          setEditing(null)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar' : 'Nuevo'} Producto</h2>
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
                <label>Categoría *</label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.es_menu_fijo}
                    onChange={(e) => setFormData({ ...formData, es_menu_fijo: e.target.checked })}
                  />
                  Menú Fijo
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.solo_mostrador}
                    onChange={(e) => setFormData({ ...formData, solo_mostrador: e.target.checked })}
                  />
                  Solo Mostrador
                </label>
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

export default Productos

