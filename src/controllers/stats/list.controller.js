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

const getReportStats = async (req, res) => {
  try {
    const { dateFilter, puntoVentaId } = req.query

    // Obtención de fecha local adaptada a la zona horaria de Ecuador (Evita desfases UTC)
    const ahora = new Date()
    const anio = ahora.getFullYear()
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const dia = String(ahora.getDate()).padStart(2, '0')

    let fechaInicio = `${anio}-${mes}-${dia}`
    let fechaFin = fechaInicio

    if (dateFilter === 'Ayer') {
      const ayer = new Date()
      ayer.setDate(ayer.getDate() - 1)

      const aAnio = ayer.getFullYear()
      const aMes = String(ayer.getMonth() + 1).padStart(2, '0')
      const aDia = String(ayer.getDate()).padStart(2, '0')

      fechaInicio = `${aAnio}-${aMes}-${aDia}`
      fechaFin = fechaInicio
    } else if (dateFilter === 'Semana') {
      const sieteDiasAtras = new Date()
      sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7)

      const sAnio = sieteDiasAtras.getFullYear()
      const sMes = String(sieteDiasAtras.getMonth() + 1).padStart(2, '0')
      const sDia = String(sieteDiasAtras.getDate()).padStart(2, '0')

      fechaInicio = `${sAnio}-${sMes}-${sDia}`
    } else if (dateFilter === 'Mes') {
      const mAnio = ahora.getFullYear()
      const mMes = String(ahora.getMonth() + 1).padStart(2, '0')

      fechaInicio = `${mAnio}-${mMes}-01`
    }

    // Invocamos al servicio avanzado
    const result = await statsServices.getReporteFinanciero({
      fechaInicio,
      fechaFin,
      puntoVentaId,
    })

    res.status(result.code).json({
      stats: result.stats,
      sucursales: result.sucursales,
    })
  } catch (error) {
    console.error('Error en getReportStats:', error)
    res.status(500).json({
      message: 'Error al procesar las estadísticas estructuradas del reporte',
    })
  }
}

export { getDashboardStats, getReportStats }
