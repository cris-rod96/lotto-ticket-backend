import { ticketServices } from '../../services/index.services.js'

const listarTickets = async (req, res) => {
  try {
    const { filtros } = req.body
    const { code, message, data } = await ticketServices.listarTickets(filtros)
    res.status(code).json(data ? { data, message } : { message })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    return { code: 500, message: msg }
  }
}

export { listarTickets }
