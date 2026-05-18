import { statsServices } from '../../services/index.services.js'

const getDashboardStats = async (req, res) => {
  try {
    const { code, stats } = await statsServices.getGlobalStats()

    res.status(code).json({
      stats,
    })
  } catch (error) {
    console.error('Error en getDashboardStats:', error)
    res.status(500).json({
      message: 'Error al procesar las estadísticas del dashboard',
    })
  }
}

export { getDashboardStats }
