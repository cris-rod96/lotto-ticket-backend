import { backupServices } from '../../services/index.services.js'

const listarRespaldos = async (req, res) => {
  try {
    const { code, message, respaldos } = await backupServices.listarRespaldos()

    res.status(code).json(respaldos ? { respaldos } : { message })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    req.status(500).json({
      message: msg,
    })
  }
}

export { listarRespaldos }
