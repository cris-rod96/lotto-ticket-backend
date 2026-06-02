import { Op } from 'sequelize'
import {
  Catalogos,
  Cifras,
  DetallesResultado,
  DetallesSuerte,
  DetallesTicket,
  Ganadores,
  Resultados,
  Sorteos,
  Suertes,
  Tickets,
} from '../../lib/db.lib.js'

const listarResultados = async (filtros = {}) => {
  try {
    const { fecha, jornada, utilidad, page = 1, limit = 6 } = filtros
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)

    const whereSorteo = {
      ...(fecha && { fechaSorteo: fecha }),
      ...(jornada && jornada !== 'Todos' && { jornada }),
      ...(utilidad === 'Positiva' && { utilidadNeta: { [Op.gte]: 0 } }),
      ...(utilidad === 'Negativa' && { utilidadNeta: { [Op.lt]: 0 } }),
    }

    const count = await Resultados.count({
      include: [{ model: Sorteos, where: whereSorteo, required: true }],
    })

    const paginatedIds = await Resultados.findAll({
      attributes: ['id'],
      include: [{ model: Sorteos, where: whereSorteo, attributes: [], required: true }],
      order: [
        [Sorteos, 'fechaSorteo', 'DESC'],
        [Sorteos, 'horaSorteo', 'DESC'],
      ],
      limit: parseInt(limit, 10),
      offset: offset,
      subQuery: false,
    })

    const ids = paginatedIds.map((r) => r.id)

    const rows =
      ids.length > 0
        ? await Resultados.findAll({
            where: { id: ids },
            include: [
              { model: Sorteos, include: [Catalogos, Cifras], required: true },
              {
                model: DetallesResultado,
                include: [
                  { model: Suertes, include: [DetallesSuerte] },
                  { model: Ganadores, include: [{ model: Tickets, include: [DetallesTicket] }] },
                ],
              },
            ],
            order: [
              [Sorteos, 'fechaSorteo', 'DESC'],
              [Sorteos, 'horaSorteo', 'DESC'],
            ],
          })
        : []

    return {
      code: 200,
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10),
    }
  } catch (error) {
    return { code: 500, message: error.message }
  }
}

const listarPorPunto = async (filtros = {}) => {
  try {
    const { puntoVentaId, page = 1, limit = 6 } = filtros
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)

    // 1. Buscamos resultados paginados
    const { count, rows: paginatedResultados } = await Resultados.findAndCountAll({
      limit: parseInt(limit, 10),
      offset: offset,
      order: [
        [Sorteos, 'fechaSorteo', 'DESC'],
        [Sorteos, 'horaSorteo', 'DESC'],
      ],
      include: [{ model: Sorteos, attributes: ['id'] }],
      distinct: true,
    })

    const paginatedIds = paginatedResultados.map((r) => r.id)

    // 2. Traemos resultados completos
    const resultadosCompletos = await Resultados.findAll({
      where: { id: paginatedIds },
      include: [
        { model: Sorteos, include: [Catalogos, Cifras] },
        {
          model: DetallesResultado,
          as: 'DetallesResultados',
          include: [
            { model: Suertes, include: [DetallesSuerte] },
            { model: Ganadores, include: [Tickets] },
          ],
        },
      ],
    })

    // 3. Traemos TODOS los tickets de este punto para estos sorteos (evitamos el error de asociación)
    const sorteosIds = resultadosCompletos.map((r) => r.SorteoId)
    const todosLosTickets = await Tickets.findAll({
      where: {
        PuntoVentaId: puntoVentaId,
        SorteoId: sorteosIds,
      },
      include: [{ model: DetallesTicket }], // Asumiendo que esta relación existe
    })

    // 4. Mapeo
    const data = paginatedResultados.map((res) => {
      const resCompleto = resultadosCompletos.find((r) => r.id === res.id)

      // Filtramos tickets para este sorteo específico
      const ticketsDelSorteo = todosLosTickets.filter((t) => t.SorteoId === resCompleto.SorteoId)

      // Sumamos ventas reales
      const totalVentas = ticketsDelSorteo.reduce((sum, t) => {
        const montoTicket =
          t.DetallesTickets?.reduce((acc, dt) => acc + parseFloat(dt.montoApostado || 0), 0) || 0
        return sum + montoTicket
      }, 0)

      let totalPremios = 0,
        montoPorPagar = 0,
        cantidadGanadores = 0

      if (resCompleto?.DetallesResultados) {
        resCompleto.DetallesResultados.forEach((det) => {
          if (det.Ganadores) {
            det.Ganadores.forEach((gan) => {
              if (gan.Ticket?.PuntoVentaId === puntoVentaId) {
                const monto = parseFloat(gan.montoPremio || 0)
                totalPremios += monto
                cantidadGanadores += 1
                if (gan.Ticket?.estado === 'Pendiente') montoPorPagar += monto
              }
            })
          }
        })
      }

      return {
        ...(resCompleto ? resCompleto.toJSON() : res.toJSON()),
        totalPremios: parseFloat(totalPremios.toFixed(2)),
        montoPorPagar: parseFloat(montoPorPagar.toFixed(2)),
        totalVentas: parseFloat(totalVentas.toFixed(2)),
        cantidadGanadores: cantidadGanadores,
      }
    })

    return { code: 200, data, totalItems: count, totalPages: Math.ceil(count / limit) }
  } catch (error) {
    console.error('ERROR:', error)
    return { code: 500, message: error.message }
  }
}

export { listarPorPunto, listarResultados }
