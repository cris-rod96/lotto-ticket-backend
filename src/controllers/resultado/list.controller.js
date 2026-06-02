import { resultadoServices } from '../../services/index.services.js'

const listarResultados = async (req, res) => {
  try {
    // 1. Capturamos los filtros de paginación Y los nuevos filtros de búsqueda
    const filtros = {
      fecha: req.query.fecha || null,
      jornada: req.query.jornada || 'Todos',
      utilidad: req.query.utilidad || 'Todos',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 6, // Ajustado a tu preferencia
    }

    // 2. Llamamos al servicio pasando todos los filtros
    const { code, message, data, totalItems, totalPages, currentPage } =
      await resultadoServices.listarResultados(filtros)

    // 3. Respuesta al cliente
    if (code === 200) {
      return res.status(code).json({
        data,
        totalItems,
        totalPages,
        currentPage,
      })
    }

    return res.status(code).json({ message })
  } catch (error) {
    console.error('Error en controlador listarResultados:', error)
    res.status(500).json({
      message: error.message || 'Error interno del servidor.',
    })
  }
}

const listarResultadosPorPunto = async (req, res) => {
  try {
    // 1. Capturamos los filtros (id del punto, paginación, etc.)
    const filtros = {
      puntoVentaId: req.query.puntoVentaId || null,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 6,
    }

    // 2. Llamamos al servicio pasando los filtros (como haces en listarResultados)
    const { code, message, data, totalItems, totalPages, currentPage } =
      await resultadoServices.listarPorPunto(filtros)

    // 3. Respuesta al cliente (Exactamente igual a tu estructura)
    if (code === 200) {
      return res.status(code).json({
        data,
        totalItems,
        totalPages,
        currentPage,
      })
    }

    return res.status(code).json({ message })
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error interno del servidor.',
    })
  }
}

export { listarResultados, listarResultadosPorPunto }
