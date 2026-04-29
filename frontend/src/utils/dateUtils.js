/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * Sin problemas de zona horaria
 */
export const getFechaHoy = () => {
  const hoy = new Date()
  const año = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

/**
 * Convierte una fecha a formato YYYY-MM-DD
 * @param {Date|string} fecha - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return null
  
  // Si ya está en formato YYYY-MM-DD, retornarlo
  if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return fecha
  }
  
  // Convertir a Date y formatear
  const date = new Date(fecha)
  const año = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

/**
 * Calcula la fecha fin (1 mes después de la fecha inicio)
 * @param {string} fechaInicio - Fecha inicio en formato YYYY-MM-DD
 * @returns {string} Fecha fin en formato YYYY-MM-DD
 */
export const calcularFechaFin = (fechaInicio) => {
  if (!fechaInicio) return ''
  const inicio = new Date(fechaInicio)
  const fin = new Date(inicio)
  fin.setMonth(fin.getMonth() + 1)
  return formatearFecha(fin)
}

