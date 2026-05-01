import { Cajas, Movimientos, PuntosVenta, Usuarios } from '../../lib/db.lib.js'

const listarMovimientos = async () => {
  const movimientos = await Movimientos.findAll()
  return { code: 200, movimientos }
}
const listarMovimientosPorCaja = async (CajaId) => {
  const caja = await Cajas.findByPk(CajaId)
  if (!caja) return { code: 400, message: 'No existe la caja proporcionada' }

  const movimientos = await Movimientos.findAll({
    where: {
      CajaId,
    },
  })

  return { code: 200, movimientos }
}
const listarMovimientosPorPuntoVenta = async (PuntoVentaId) => {
  const puntoVenta = await PuntosVenta.findByPk(PuntoVentaId)
  if (!puntoVenta) return { code: 400, message: 'No existe el punto de venta proporcionado' }

  const movimientos = await Movimientos.findAll({
    where: {
      PuntoVentaId,
    },
  })

  return { code: 200, movimientos }
}
const listarMovimientosPorUsuario = async (UsuarioId) => {
  const usuario = await Usuarios.findByPk(UsuarioId)
  if (!usuario) return { code: 400, message: 'No existe el usuario proporcionada' }

  const movimientos = await Movimientos.findAll({
    where: {
      UsuarioId,
    },
  })

  return { code: 200, movimientos }
}

export {
  listarMovimientos,
  listarMovimientosPorCaja,
  listarMovimientosPorPuntoVenta,
  listarMovimientosPorUsuario,
}
