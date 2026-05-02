import { ticketServices } from '../../services/index.services.js'

const venderTicket = async (req, res) => {
  try {
    const dataBody = req.body
    const { code, message, data } = await ticketServices.venderTicket(dataBody)
    res.status(code).json(data ? { data, message } : { message })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    return { code: 500, message: msg }
  }
}

export { venderTicket }
