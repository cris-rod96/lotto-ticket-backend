import { ticketServices } from '../../services/index.services.js'

const listarTickets = async (req, res) => {
  try {
    const filtros = req.query
    const { code, message, data: tickets } = await ticketServices.listarTickets(filtros)
    res.status(code).json(tickets ? { tickets, message } : { message })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    res.status(500).json({ message: msg })
  }
}

export { listarTickets }
