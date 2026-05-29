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
    const { fecha, page = 1, limit = 10 } = filtros
    const parsedLimit = parseInt(limit, 10)
    const parsedPage = parseInt(page, 10)
    const offset = (parsedPage - 1) * parsedLimit

    // 1. Obtenemos el total de registros
    const count = await Resultados.count({
      include: [{ model: Sorteos, where: fecha ? { fechaSorteo: fecha } : {} }],
    })

    // 2. Obtenemos solo los IDs paginados y ordenados
    // Esto es muy rápido y no tiene joins complejos
    const paginatedIds = await Resultados.findAll({
      attributes: ['id'],
      include: [{ model: Sorteos, where: fecha ? { fechaSorteo: fecha } : {}, attributes: [] }],
      order: [
        [Sorteos, 'fechaSorteo', 'DESC'],
        [Sorteos, 'horaSorteo', 'DESC'],
        ['createdAt', 'ASC'],
      ],
      limit: parsedLimit,
      offset: offset,
      subQuery: false,
    })

    const ids = paginatedIds.map((r) => r.id)

    // 3. Obtenemos la data completa de esos IDs específicos
    const rows = await Resultados.findAll({
      where: { id: ids },
      include: [
        {
          model: Sorteos,
          include: [Catalogos, Cifras],
        },
        {
          model: DetallesResultado,
          attributes: ['numeroGanador'],
          include: [
            { model: Suertes, include: [DetallesSuerte] },
            { model: Ganadores, include: [{ model: Tickets, include: [DetallesTicket] }] },
          ],
        },
      ],
      // Mantenemos el orden aquí también
      order: [
        [Sorteos, 'fechaSorteo', 'DESC'],
        [Sorteos, 'horaSorteo', 'DESC'],
        [DetallesResultado, 'createdAt', 'ASC'],
      ],
    })

    return {
      code: 200,
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
    }
  } catch (error) {
    console.error('Error final:', error.message)
    return { code: 500, message: 'Error: ' + error.message }
  }
}

export { listarResultados }
