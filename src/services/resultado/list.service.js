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
export { listarResultados }
