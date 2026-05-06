import { Cajas, Movimientos, PuntosVenta, Usuarios } from '../../lib/db.lib.js'

const obtenerCajasAbiertas = async () => {
  const cajas = await Cajas.findAll({
    where: {
      estado: 'Abierta',
    },
  })

  return { code: 200, cajas }
}

const obtenerCajaAbierta = async (PuntoVentaId) => {
  const puntoVenta = await PuntosVenta.findByPk(PuntoVentaId)
  if (!puntoVenta) return { code: 400, message: 'No se encontró el punto de venta indicado' }
  const caja = await Cajas.findOne({
    where: {
      PuntoVentaId,
      estado: 'Abierta',
    },
    include: [
      {
        model: Usuarios,
        attributes: ['id', 'nombresCompletos', 'PuntoVentaId'],
      },
    ],
  })

  return { code: 200, caja }
}

const listarTodas = async () => {
  const cajas = await Cajas.findAll({
    include: [Movimientos, Usuarios, PuntosVenta],
  })

  return { code: 200, cajas }
}

const listarPorPuntoDeVenta = async (PuntoVentaId) => {
  // 1. Verificación de existencia
  const puntoVenta = await PuntosVenta.findByPk(PuntoVentaId)
  if (!puntoVenta) {
    return { code: 400, message: 'No se encontró el punto de venta indicado' }
  }

  // 2. Consulta con el formato de ORDER correcto
  const cajas = await Cajas.findAll({
    where: {
      PuntoVentaId,
    },
    include: [
      { model: Movimientos },
      { model: Usuarios, attributes: ['id', 'nombresCompletos'] }, // Sugerencia: no traigas el password
      { model: PuntosVenta },
    ],
    // EL ERROR ESTABA AQUÍ: Debe ser un array de arrays
    order: [['createdAt', 'DESC']],
  })

  return { code: 200, cajas }
}

export { listarPorPuntoDeVenta, listarTodas, obtenerCajaAbierta, obtenerCajasAbiertas }
