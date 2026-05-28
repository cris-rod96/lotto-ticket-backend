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

const obtenerDetallesPunto = async (id) => {
  try {
    // 1. Buscamos el punto con sus cajas limpias, movimientos limitados y suertes
    const detalle = await PuntosVenta.findByPk(id, {
      include: [
        {
          model: Usuarios,
          attributes: ['id', 'nombresCompletos', 'alias', 'activo'],
        },
        {
          model: Cajas,
          limit: 5, // Trae solo las últimas 5 jornadas de caja
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: Movimientos,
              limit: 20, // Protegemos el heap trayendo solo los últimos 20 movimientos
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
      return { code: 404, message: 'El punto de venta solicitado no existe o fue eliminado.' }
    }

    // 2. Traemos únicamente los últimos 50 tickets emitidos con su montoApostado y jugadas
    const ticketsRecientes = await Tickets.findAll({
      where: { PuntoVentaId: id },
      include: [{ model: DetallesTicket }],
      limit: 50,
      order: [['createdAt', 'DESC']],
    })

    // 3. Estructura final limpia para el modal de React
    const detallePlano = detalle.toJSON()
    detallePlano.Tickets = ticketsRecientes

    return { code: 200, detalle: detallePlano }
  } catch (error) {
    return { code: 500, message: 'Error interno al obtener los detalles', error: error.message }
  }
}

export { listarPuntosVentas, obtenerDetallesPunto }
