import { ticketServices } from '../../services/index.services.js'

const pagarTicket = async (req, res) => {
  try {
    const { TicketId, UsuarioId, CajaId } = req.body

    // Desestructuramos también el 'ticket' devuelto por el servicio
    const { code, message, caja, ticket } = await ticketServices.pagarTicket(
      TicketId,
      UsuarioId,
      CajaId
    )

    // Si la operación fue exitosa y tenemos la data, la enviamos de vuelta en el JSON
    if (code === 200) {
      return res.status(code).json({
        message,
        caja,
        ticket,
      })
    }

    // Para cualquier otro código de error (400, 404, etc.) devuelto de forma controlada
    res.status(code).json({ message })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    res.status(500).json({ message: msg })
  }
}

export { pagarTicket }
