import { Cajas, Movimientos, PuntosVenta, Usuarios } from '../../lib/db.lib.js'

const obtenerCajasAbiertas = async () => {
  const cajas = await Cajas.findAll({
    where: {
      estado: 'Abierta',
    },
    order: [['createdAt', 'DESC']],
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
      {
        model: Movimientos,
        include: [
          {
            model: Usuarios,
            attributes: ['id', 'nombresCompletos'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  })

  return { code: 200, caja }
}

const listarTodas = async () => {
  const cajas = await Cajas.findAll({
    include: [
      {
        model: Movimientos,
        include: [Usuarios],
      },
      {
        model: Usuarios,
      },
      {
        model: PuntosVenta,
      },
    ],
    order: [['createdAt', 'DESC']],
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
      {
        model: Movimientos,
        include: [
          {
            model: Usuarios,
            attributes: ['id', 'nombresCompletos'],
          },
        ],
      },
      { model: Usuarios, attributes: ['id', 'nombresCompletos'] }, // Sugerencia: no traigas el password
      { model: PuntosVenta },
    ],
    // EL ERROR ESTABA AQUÍ: Debe ser un array de arrays
    order: [[Movimientos, 'createdAt', 'DESC']],
  })

  return { code: 200, cajas }
}

export { listarPorPuntoDeVenta, listarTodas, obtenerCajaAbierta, obtenerCajasAbiertas }
