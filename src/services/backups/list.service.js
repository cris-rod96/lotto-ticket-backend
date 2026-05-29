import envsConfig from '../../config/envs.config.js'
import { Backups } from '../../lib/db.lib.js'

const listarRespaldos = async (filtros = {}) => {
  try {
    // 1. Extraemos paginación con valores por defecto
    const { page = 1, limit = 10 } = filtros
    const parsedLimit = parseInt(limit, 10)
    const parsedPage = parseInt(page, 10)
    const offset = (parsedPage - 1) * parsedLimit

    const environment = envsConfig.NODE_ENV
    let dondeBuscar = {}

    // LÓGICA DE FILTRADO
    if (environment !== 'development') {
      dondeBuscar.entorno = 'production'
    }

    // 2. Usamos findAndCountAll para obtener datos + total de registros
    const { count, rows } = await Backups.findAndCountAll({
      where: dondeBuscar,
      order: [['createdAt', 'DESC']],
      limit: parsedLimit,
      offset: offset,
    })

    // 3. Calculamos total de páginas
    const totalPages = Math.ceil(count / parsedLimit)

    return {
      code: 200,
      data: rows, // Respaldos de la página actual
      totalItems: count, // Total de respaldos en BD (según filtro de entorno)
      totalPages: totalPages,
      currentPage: parsedPage,
    }
  } catch (error) {
    console.error('[SERVICE ERROR - LISTAR BACKUPS]:', error.message)
    return {
      code: 500,
      message: 'Error interno del servidor al listar los respaldos: ' + error.message,
    }
  }
}

export { listarRespaldos }
