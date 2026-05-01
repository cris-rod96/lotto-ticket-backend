import { PuntosVenta } from '../../lib/db.lib.js'

const registrarPuntoVenta = async (data) => {
  const { nombre } = data
  const puntoVenta = await PuntosVenta.findOne({
    where: {
      nombre,
    },
  })

  if (puntoVenta)
    return { code: 400, message: 'Ya existe un punto de venta registrado con este nombre' }

  await PuntosVenta.create(data)
  return { code: 201, message: 'Punto de venta creado con éxito' }
}

export { registrarPuntoVenta }
