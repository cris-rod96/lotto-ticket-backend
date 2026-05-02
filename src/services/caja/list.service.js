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
  const puntoVenta = await PuntosVenta.findByPk(PuntoVentaId)
  if (!puntoVenta) return { code: 400, message: 'No se encontró el punto de venta indicado' }
  const cajas = await Cajas.findAll({
    where: {
      PuntoVentaId,
    },
    include: [Movimientos, Usuarios, PuntosVenta],
  })

  return { code: 200, cajas }
}

export { listarPorPuntoDeVenta, listarTodas, obtenerCajaAbierta, obtenerCajasAbiertas }
