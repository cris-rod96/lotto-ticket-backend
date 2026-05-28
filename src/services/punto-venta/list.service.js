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
  // 1. Buscamos el punto de venta con lo mínimo indispensable
  const detalle = await PuntosVenta.findByPk(id, {
    include: [
      {
        model: Usuarios,
      },
      {
        model: Cajas,
        // Limitamos a los últimos 20 movimientos para que no pese gigabytes
        include: [
          {
            model: Movimientos,
            limit: 20,
            order: [['createdAt', 'DESC']],
          },
        ],
      },
      {
        model: DetallesSuerte,
        include: [{ model: Suertes, include: [Cifras] }],
      },
    ],
  })

  if (!detalle) {
    return { code: 404, message: 'El punto de venta no existe.' }
  }

  // 2. CRÍTICO: En lugar de incluir la tabla Tickets entera con sus Detalles (que rompe la RAM),
  // hacemos una consulta aparte para traer solo los ÚLTIMOS 50 TICKETS
  const ticketsRecientes = await Tickets.findAll({
    where: { PuntoVentaId: id }, // Asegúrate de usar la FK correcta de tu modelo
    include: [DetallesTicket],
    limit: 50, // ◄ ¡Tope estricto para proteger la RAM!
    order: [['createdAt', 'DESC']],
  })

  // Convertimos el modelo de Sequelize a un objeto plano para poder inyectarle los tickets
  const detallePlano = detalle.toJSON()
  detallePlano.Tickets = ticketsRecientes // Metemos los 50 tickets ligeros ahí

  return { code: 200, detalle: detallePlano }
}

export { listarPuntosVentas, obtenerDetallesPunto }
