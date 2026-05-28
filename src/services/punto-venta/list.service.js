import {
  Cajas,
  Cifras,
  DetallesSuerte,
  DetallesTicket,
  Movimientos,
  PuntosVenta,
  Suertes,
  Tickets,
  Usuarios,
} from '../../lib/db.lib.js'

const listarPuntosVentas = async () => {
  const puntosVentas = await PuntosVenta.findAll({
    include: [
      {
        model: Usuarios,
      },
      // Quitamos Tickets, Cajas y DetallesSuerte de aquí. ¡Paz para Postgres!
    ],
    order: [['createdAt', 'DESC']],
  })

  return { code: 200, puntosVentas }
}

// BACKEND: Obtener la info pesada de UN SOLO punto cuando abran el modal
const obtenerDetallesPunto = async (id) => {
  // 1. Buscamos el punto de venta con sus relaciones
  const detalle = await PuntosVenta.findByPk(id, {
    include: [
      { model: Usuarios },
      { model: Tickets, include: [DetallesTicket] },
      { model: Cajas, include: [Movimientos] },
      {
        model: DetallesSuerte,
        include: [{ model: Suertes, include: [Cifras] }],
      },
    ],
  })

  // 2. VALIDACIÓN: Si no se encuentra, respondemos con un error controlado
  if (!detalle) {
    return {
      code: 404,
      message: 'El punto de venta solicitado no existe o fue eliminado.',
    }
  }

  // 3. Si todo está bien, devolvemos los datos
  return { code: 200, detalle }
}

export { listarPuntosVentas, obtenerDetallesPunto }
