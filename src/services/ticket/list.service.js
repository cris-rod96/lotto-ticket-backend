import {
  Catalogos,
  Cifras,
  DetallesTicket,
  PuntosVenta,
  Sorteos,
  Tickets,
  Usuarios,
} from '../../lib/db.lib.js'

const listarTickets = async (queryParams = {}) => {
  try {
    // 1. Extraemos los parámetros de paginación y filtros con valores por defecto
    const page = parseInt(queryParams.page, 10) || 1
    const limit = parseInt(queryParams.limit, 10) || 8 // Mismo tamaño que tu frontend
    const offset = (page - 1) * limit

    const { PuntoVentaId, fechaSorteo, estadoLiquidacion } = queryParams

    // 2. Construimos el "where" principal para el Ticket
    const whereTicket = {}
    if (PuntoVentaId && PuntoVentaId !== 'Todos') {
      whereTicket.PuntoVentaId = PuntoVentaId
    }

    // Adaptación de tu lógica multi-criterio de estados a la base de datos
    if (estadoLiquidacion && estadoLiquidacion !== 'Todos') {
      if (estadoLiquidacion === 'Ganador_Pendiente') {
        whereTicket.resultado = 'Ganador'
        whereTicket.estado = 'Pendiente'
      } else if (estadoLiquidacion === 'Ganador_Pagado') {
        whereTicket.resultado = 'Ganador'
        whereTicket.estado = 'Pagado'
      } else if (estadoLiquidacion === 'Pendiente' || estadoLiquidacion === 'No Ganador') {
        whereTicket.resultado = estadoLiquidacion
      }
    }

    // 3. Construimos el "where" para la relación con Sorteos (Filtro por Fecha)
    const whereSorteo = {}
    if (fechaSorteo && fechaSorteo !== 'Todos') {
      whereSorteo.fechaSorteo = fechaSorteo
    }

    // 4. Ejecutamos findAndCountAll con límites (Limit y Offset)
    const { count, rows } = await Tickets.findAndCountAll({
      where: whereTicket,
      include: [
        {
          model: Sorteos,
          where: whereSorteo, // Aplica el filtro de fecha directamente en el JOIN
          include: [Catalogos, Cifras],
        },
        { model: PuntosVenta, attributes: ['nombre'] },
        { model: Usuarios, attributes: ['nombresCompletos'] },
        { model: DetallesTicket },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset,
      distinct: true, // Evita problemas de conteo duplicado al usar Includes de muchos a muchos (DetallesTicket)
    })

    // 5. Retornamos la data paginada estructurada
    return {
      code: 200,
      data: {
        tickets: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    }
  } catch (error) {
    console.error('[BACKEND ERROR - listarTickets]:', error)
    return { code: 500, message: error.message }
  }
}

const listarPorPuntoDeVenta = async (id, queryParams = {}) => {
  try {
    const puntoVenta = await PuntosVenta.findByPk(id)
    if (!puntoVenta) return { code: 400, message: 'Punto de venta no encontrado' }

    // 1. Parámetros de paginación
    const page = parseInt(queryParams.page, 10) || 1
    const limit = parseInt(queryParams.limit, 10) || 8
    const offset = (page - 1) * limit

    // 2. Consulta paginada a la base de datos
    const { count, rows } = await Tickets.findAndCountAll({
      where: {
        PuntoVentaId: id,
      },
      include: [
        {
          model: Sorteos,
          include: [Catalogos, Cifras],
        },
        { model: PuntosVenta },
        { model: Usuarios },
        { model: DetallesTicket },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset,
      distinct: true, // Vital para evitar conteos duplicados por los DetallesTicket
    })

    // 3. Retornamos la estructura con metadatos
    return {
      code: 200,
      data: {
        tickets: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    }
  } catch (error) {
    console.error('[BACKEND ERROR - listarPorPuntoDeVenta]:', error)
    return { code: 500, message: error.message }
  }
}

export { listarPorPuntoDeVenta, listarTickets }
