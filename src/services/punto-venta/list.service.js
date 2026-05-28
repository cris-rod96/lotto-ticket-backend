// BACKEND: Tu archivo de controladores de Puntos de Venta (AHORA SÍ CON MONTO APOSTADO)
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
  try {
    // 1. Traemos los puntos de venta limpios con sus usuarios asignados
    const puntosVentas = await PuntosVenta.findAll({
      include: [
        {
          model: Usuarios,
          attributes: ['id', 'nombresCompletos', 'alias', 'activo'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    // 2. Mapeamos para inyectar los contadores y las sumas de las apuestas reales
    const puntosConTotales = await Promise.all(
      puntosVentas.map(async (punto) => {
        // Conteo rápido de tickets totales para este punto
        const totalTickets = await Tickets.count({
          where: { PuntoVentaId: punto.id },
        })

        // SUMA REAL DE RECAUDACIÓN:
        // Buscamos todos los Tickets de este punto para sumar el 'montoApostado' de sus detalles
        const sumaRecaudacion = await DetallesTicket.sum('montoApostado', {
          include: [
            {
              model: Tickets,
              where: { PuntoVentaId: punto.id },
              attributes: [], // No queremos traer columnas del ticket, solo filtrar por su ID de punto
            },
          ],
        })

        const plano = punto.toJSON()
        plano.totalTickets = totalTickets || 0
        plano.totalRecaudado = parseFloat(sumaRecaudacion || 0)

        return plano
      })
    )

    return { code: 200, puntosVentas: puntosConTotales }
  } catch (error) {
    return {
      code: 500,
      message: 'Error interno al listar los puntos de venta',
      error: error.message,
    }
  }
}

// CONTROLADOR BACKEND: Deja obtenerDetallesPunto libre de tickets históricos
const obtenerDetallesPunto = async (id) => {
  try {
    const detalle = await PuntosVenta.findByPk(id, {
      include: [
        {
          model: Usuarios,
          attributes: ['id', 'nombresCompletos', 'alias', 'activo'],
        },
        {
          model: Cajas,
          limit: 5,
          order: [['createdAt', 'DESC']],
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

    return { code: 200, detalle: detalle.toJSON() }
  } catch (error) {
    return { code: 500, message: 'Error interno', error: error.message }
  }
}

// CONTROLADOR BACKEND: Nueva función para paginar los mil tickets
const listarTicketsPuntoPaginados = async (id, pagina = 1, limite = 20) => {
  try {
    const limit = parseInt(limite)
    const offset = (parseInt(pagina) - 1) * limit

    const { count, rows } = await Tickets.findAndCountAll({
      where: { PuntoVentaId: id },
      include: [{ model: DetallesTicket }],
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
    })

    return {
      code: 200,
      tickets: rows,
      totalTickets: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(pagina),
    }
  } catch (error) {
    return { code: 500, message: 'Error al paginar tickets', error: error.message }
  }
}

// No olvides exportarla al final de tu archivo
export { listarPuntosVentas, listarTicketsPuntoPaginados, obtenerDetallesPunto }
