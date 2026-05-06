import { ticketServices } from '../../services/index.services.js'

const venderTicket = async (req, res) => {
  try {
    const dataBody = req.body

    // El servicio ahora maneja la transacción y el bloqueo de cupo
    const result = await ticketServices.venderTicket(dataBody)

    // Desestructuramos la respuesta exitosa o el error controlado del servicio
    const { code, message, data } = result

    return res.status(code).json(data ? { data, message } : { message })
  } catch (error) {
    // IMPORTANTE: Aquí es donde capturamos errores no esperados o fallos de DB
    console.error('Error en Controlador Venta:', error)

    const statusCode = error.code || 500
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'

    // CAMBIO: Usar res.status para asegurar que el frontend reciba la respuesta
    return res.status(statusCode).json({ message: msg })
  }
}

const verificarCupo = async (req, res) => {
  try {
    const data = req.body
    const { code, disponible, message } = await ticketServices.verificarCupo(data)
    res.status(code).json({ message, disponible })
  } catch (error) {
    const msg = error.message || 'Error crítico en el servidor. Intente de nuevo'
    return { code: 500, message: msg }
  }
}

export { venderTicket, verificarCupo }
