import {
  Cajas,
  DetallesTicket,
  Movimientos,
  PuntosVenta,
  Tickets,
  Usuarios,
} from '../../lib/db.lib.js'

const listarPuntosVentas = async () => {
  const puntosVentas = await PuntosVenta.findAll({
    include: [
      { model: Usuarios },
      { model: Tickets, include: [DetallesTicket] },
      { model: Cajas, include: [Movimientos] },
    ],
  })

  return { code: 200, puntosVentas }
}

export { listarPuntosVentas }
