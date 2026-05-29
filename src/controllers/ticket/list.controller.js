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
    console.log(error)
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    res.status(500).json({ message: msg })
  }
}

const listarPorPuntoDeVenta = async (req, res) => {
  try {
    const { id } = req.params // ID del punto de venta desde la URL (/puntos-venta/:id/tickets)
    const { page, limit } = req.query // Paginación desde la query (?page=1&limit=8)

    const { code, message, data } = await ticketServices.listarPorPuntoDeVenta(id, { page, limit })

    // Retornamos la estructura paginada completa: { tickets, totalItems, totalPages, currentPage }
    res.status(code).json(data ? { ...data, message } : { message })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    res.status(500).json({ message: msg })
  }
}

export { listarPorPuntoDeVenta, listarTickets }
