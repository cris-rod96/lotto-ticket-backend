import { ticketServices } from '../../services/index.services.js'

const listarTickets = async (req, res) => {
  try {
    // Recibimos de forma limpia los filtros y la paginación desde la URL (req.query)
    const { page, limit, PuntoVentaId, fechaSorteo, estadoLiquidacion } = req.query

    const { code, message, data } = await ticketServices.listarTickets({
      page,
      limit,
      PuntoVentaId,
      fechaSorteo,
      estadoLiquidacion,
    })

    // Si todo sale bien, 'data' contendrá: { tickets, totalItems, totalPages, currentPage }
    res.status(code).json(data ? { ...data, message } : { message })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    res.status(500).json({ message: msg })
  }
}

const listarPorPuntoDeVenta = async (req, res) => {
  try {
    const { id } = req.params
    // Aseguramos que lleguen valores, aunque sean undefined
    const { page, limit, estado, fecha } = req.query

    const result = await ticketServices.listarPorPuntoDeVenta(id, { page, limit, estado, fecha })

    // Si el servicio devuelve algo distinto a 200, respondemos con el error
    if (result.code !== 200) {
      return res.status(result.code).json({ message: result.message })
    }

    // Respuesta exitosa estandarizada
    return res.status(200).json({
      success: true,
      data: result.data.tickets,
      pagination: {
        totalItems: result.data.totalItems,
        totalPages: result.data.totalPages,
        currentPage: result.data.currentPage,
        itemsPerPage: parseInt(limit) || 8,
      },
    })
  } catch (error) {
    console.error('[CONTROLLER ERROR]:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener tickets',
    })
  }
}

export { listarPorPuntoDeVenta, listarTickets }
