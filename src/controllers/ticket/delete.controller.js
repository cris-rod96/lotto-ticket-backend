import { ticketServices } from '../../services/index.services.js'

const eliminarTicket = async (req, res) => {
  try {
    const { id } = req.params
    const { UsuarioId } = req.body
    const { code, message } = await ticketServices.eliminarTicket(id, UsuarioId)
    res.status(code).json({ message })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    return { code: 500, message: msg }
  }
}

export { eliminarTicket }
