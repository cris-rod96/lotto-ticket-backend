import envsConfig from '../../config/envs.config.js'
import { Backups } from '../../lib/db.lib.js'

const listarRespaldos = async () => {
  try {
    const environment = envsConfig.NODE_ENV
    let dondeBuscar = {}

    // LÓGICA DE FILTRADO INTELIGENTE:
    // Si NO estamos en desarrollo (es decir, producción), filtramos estrictamente por 'production'
    if (environment !== 'development') {
      dondeBuscar.entorno = 'production'
    }
    // Si estamos en desarrollo, dondeBuscar se queda vacío {}, lo que traerá TODOS los registros sin filtro.

    // Consulta a la base de datos con orden descendente (los más nuevos primero)
    const respaldos = await Backups.findAll({
      where: dondeBuscar,
      order: [['createdAt', 'DESC']],
    })

    return {
      code: 200,
      respaldos,
    }
  } catch (error) {
    console.error('[SERVICE ERROR - LISTAR BACKUPS]:', error.message)
    return {
      code: 500,
      message: 'Error interno del servidor al listar los respaldos',
    }
  }
}

export { listarRespaldos }
