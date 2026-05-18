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
    const { fecha } = filtros
    const whereSorteo = {}
    if (fecha) whereSorteo.fechaSorteo = fecha

    const lista = await Resultados.findAll({
      include: [
        {
          model: Sorteos,
          where: whereSorteo,
          include: [Catalogos, Cifras],
        },
        {
          model: DetallesResultado,
          attributes: ['numeroGanador'],
          include: [
            {
              model: Suertes,
              include: [DetallesSuerte],
            },
            {
              model: Ganadores,
              include: [
                {
                  model: Tickets,
                  include: [DetallesTicket],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [Sorteos, 'fechaSorteo', 'DESC'],
        [Sorteos, 'horaSorteo', 'DESC'],
        [DetallesResultado, 'createdAt', 'ASC'],
      ],
    })

    return { code: 200, data: lista }
  } catch (error) {
    console.log(error.message)
    return { code: 500, message: 'Error al obtener la lista de resultados: ' + error.message }
  }
}

export { listarResultados }
