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

const anularTicket = async (req, res) => {
  try {
    // Obtenemos el ID desde los parámetros de la URL (:ticketId)
    const { id } = req.params
    // El usuario que realiza la acción suele venir del token de autenticación (req.usuario.id)
    // o lo enviamos en el cuerpo si así está definido tu flujo actual
    const { usuarioId } = req.body

    // Llamamos al servicio de anulación
    const { code, message, data } = await ticketServices.anularTicket(
      id,
      usuarioId
    )

    // Si la operación fue exitosa, enviamos el mensaje y la data
    if (code === 200) {
      return res.status(code).json({
        message,
        data,
      })
    }

    // Para errores de negocio controlados (400)
    res.status(code).json({ message })

  } catch (error) {
    // Captura de errores inesperados (500)
    const msg = error.message || 'Error crítico en el servidor al anular el ticket'
    res.status(500).json({ message: msg })
  }
}

export { pagarTicket, anularTicket }
