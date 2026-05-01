import { PuntosVenta } from '../../lib/db.lib.js'

const eliminarPuntoVenta = async (id) => {
  const puntoVenta = await PuntosVenta.findByPk(id)
  if (!puntoVenta) return { code: 400, message: 'No se encontró el punto de venta seleccionado' }

  await puntoVenta.update({
    activo: false,
  })

  return { code: 200, message: 'Punto de venta eliminado con éxito' }
}

export { eliminarPuntoVenta }
