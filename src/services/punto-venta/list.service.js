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
      { model: Usuarios },
      { model: Tickets, include: [DetallesTicket] },
      { model: Cajas, include: [Movimientos] },
      {
        model: DetallesSuerte,
        include: [
          {
            model: Suertes,
            include: [Cifras],
          },
        ],
      }, // Asegúrate que el modelo aquí se llame Suertes o Suerte según tus alias
    ],
    order: [
      ['createdAt', 'DESC'], // Orden de los puntos de venta

      // SOLUCIÓN: Sequelize ordenará la respuesta usando el createdAt del modelo anidado (Suerte)
      [DetallesSuerte, Suertes, 'createdAt', 'ASC'],
    ],
  })

  return { code: 200, puntosVentas }
}

export { listarPuntosVentas }
