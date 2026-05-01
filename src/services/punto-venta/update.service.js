import { Op } from 'sequelize'
import { PuntosVenta } from '../../lib/db.lib.js'

const actualizarPuntoVenta = async (id, data) => {
  const { nombre } = data

  // 1. Verificar si el punto de venta a actualizar existe
  const puntoVenta = await PuntosVenta.findByPk(id)
  if (!puntoVenta) {
    return { code: 400, message: 'No se encontró el punto de venta' }
  }

  // 2. Si se está enviando un nombre, validar que no esté duplicado
  if (nombre) {
    const existeNombre = await PuntosVenta.findOne({
      where: {
        nombre: nombre,
        id: { [Op.ne]: id }, // "ne" significa "not equal" (que no sea el mismo que estamos editando)
      },
    })

    if (existeNombre) {
      return {
        code: 400,
        message: `Ya existe otro punto de venta con el nombre: ${nombre}`,
      }
    }
  }

  // 3. Realizar la actualización
  await puntoVenta.update(data)

  return {
    code: 200,
    message: 'Punto de venta actualizado correctamente',
    data: puntoVenta,
  }
}

export { actualizarPuntoVenta }
