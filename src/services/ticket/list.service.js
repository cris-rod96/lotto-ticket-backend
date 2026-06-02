import { Op } from 'sequelize'
import {
  Catalogos,
  Cifras,
  DetallesResultado,
  DetallesSuerte,
  DetallesTicket,
  PuntosVenta,
  Resultados,
  Sorteos,
  Suertes,
  Tickets,
  Usuarios,
} from '../../lib/db.lib.js'

const listarTickets = async (queryParams = {}) => {
  try {
    const page = parseInt(queryParams.page, 10) || 1
    const limit = parseInt(queryParams.limit, 10) || 8
    const offset = (page - 1) * limit

    const { PuntoVentaId, fechaSorteo, estadoLiquidacion, codigo, fechaInicio, fechaFin } =
      queryParams

    const whereTicket = {}
    if (codigo) {
      whereTicket.codigo = { [Op.like]: `%${codigo}%` }
    }
    if (PuntoVentaId && PuntoVentaId !== 'Todos') {
      whereTicket.PuntoVentaId = PuntoVentaId
    }

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

    const whereSorteo = {}
    if (fechaSorteo && fechaSorteo !== 'Todos') {
      whereSorteo.fechaSorteo = fechaSorteo
    }

    if (fechaInicio && fechaFin) {
      whereTicket.createdAt = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
      }
    } else if (fechaInicio) {
      whereTicket.createdAt = {
        [Op.gte]: new Date(fechaInicio),
      }
    } else if (fechaFin) {
      whereTicket.createdAt = {
        [Op.lte]: new Date(fechaFin),
      }
    }

    const { count, rows } = await Tickets.findAndCountAll({
      where: whereTicket,
      include: [
        {
          model: Sorteos,
          where: whereSorteo,
          include: [Catalogos, Cifras],
        },
        { model: PuntosVenta, attributes: ['nombre'] },
        { model: Usuarios, attributes: ['nombresCompletos'] },
        { model: DetallesTicket },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset,
      distinct: true,
    })

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

    // 2. Construcción dinámica del WHERE
    const whereConditions = { PuntoVentaId: id }

    // Filtrar por estado del ticket
    if (queryParams.estado && queryParams.estado !== 'Todos') {
      if (queryParams.estado === 'Ganador_Pendiente') {
        whereConditions.resultado = 'Ganador'
        whereConditions.estado = 'Pendiente'
      } else if (queryParams.estado === 'Ganador_Pagado') {
        whereConditions.resultado = 'Ganador'
        whereConditions.estado = 'Pagado'
      } else if (queryParams.estado === 'Pendiente' || queryParams.estado === 'No Ganador') {
        whereConditions.resultado = queryParams.estado
      }
    }

    // Filtrar por fecha del sorteo (se debe incluir la relación de Sorteos)
    const sorteoInclude = {
      model: Sorteos,
      include: [
        Catalogos,
        Cifras,
        {
          model: Resultados,
          include: [
            {
              model: DetallesResultado,
              include: [
                {
                  model: Suertes,
                  include: [
                    {
                      model: DetallesSuerte,
                      // Aquí aplicamos el filtro por el ID del Punto de Venta
                      where: { PuntoVentaId: id },
                      required: false, // Usamos false para no excluir suertes que no tengan detalle en este punto
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    if (queryParams.fecha && queryParams.fecha !== 'Todos') {
      sorteoInclude.where = { fechaSorteo: queryParams.fecha }
    }

    // 3. Consulta paginada a la base de datos
    const { count, rows } = await Tickets.findAndCountAll({
      where: whereConditions,
      include: [
        sorteoInclude, // Incluimos sorteo con el filtro de fecha aplicado si existe
        { model: PuntosVenta },
        { model: Usuarios },
        { model: DetallesTicket },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset,
      distinct: true,
    })

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
