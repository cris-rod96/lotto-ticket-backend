import { DetallesResultado, Resultados, Sorteos, Suertes } from '../../lib/db.lib.js'

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
          attributes: ['numero', 'jornada', 'fechaSorteo', 'horaSorteo'],
        },
        {
          model: DetallesResultado,
          attributes: ['numeroSorteado'],
          include: [{ model: Suertes, attributes: ['descripcion'] }],
        },
      ],
      order: [
        [Sorteos, 'fechaSorteo', 'DESC'],
        [Sorteos, 'horaSorteo', 'DESC'],
      ],
    })

    return { code: 200, data: lista }
  } catch (error) {
    return { code: 500, message: 'Error al obtener la lista de resultados: ' + error.message }
  }
}

export { listarResultados }
