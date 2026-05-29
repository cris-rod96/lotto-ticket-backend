import { backupServices } from '../../services/index.services.js'

const listarRespaldos = async (req, res) => {
  try {
    // 1. Extraemos los parámetros de consulta con valores por defecto
    const { page = 1, limit = 10 } = req.query

    // 2. Pasamos los filtros al servicio
    const resultado = await backupServices.listarRespaldos({ page, limit })

    // 3. Verificamos el código de estado devuelto por el servicio
    if (resultado.code !== 200) {
      return res.status(resultado.code).json({ message: resultado.message })
    }

    // 4. Enviamos la respuesta con la estructura paginada
    res.status(200).json({
      backups: resultado.data,
      totalItems: resultado.totalItems,
      totalPages: resultado.totalPages,
      currentPage: parseInt(resultado.currentPage),
    })
  } catch (error) {
    console.error('[CONTROLLER ERROR - LISTAR BACKUPS]:', error.message)
    res.status(500).json({
      message: 'Error interno en el servidor al listar los respaldos',
    })
  }
}

export { listarRespaldos }
