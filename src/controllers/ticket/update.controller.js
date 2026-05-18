import { ticketServices } from '../../services/index.services.js'

const pagarTicket = async (req, res) => {
  try {
    const { TicketId, UsuarioId, CajaId } = req.body
    const { code, message, caja } = await ticketServices.pagarTicket(TicketId, UsuarioId, CajaId)

    res.status(code).json(caja ? { message, caja } : { message })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    res.status(500).json({ message: msg })
  }
}

export { pagarTicket }
