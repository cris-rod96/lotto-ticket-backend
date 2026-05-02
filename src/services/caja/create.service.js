import { Cajas } from '../../lib/db.lib.js'

const abrirCaja = async (data) => {
  const { PuntoVentaId } = data
  const cajaAbierta = await Cajas.findOne({
    where: {
      PuntoVentaId,
      estado: 'Abierta',
    },
  })

  if (cajaAbierta)
    return { code: 400, message: 'Ya existe una caja abierta para este punto de venta' }

  const cajaData = {
    ...data,
    saldoActual: data.montoApertura,
    totalInyecciones: 0.0,
    estado: 'Abierta',
  }

  const caja = await Cajas.create(cajaData)

  return { code: 201, message: 'Caja abierta exitosamente para la jornada', caja }
}

export { abrirCaja }
