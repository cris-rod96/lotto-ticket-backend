import { puntoVentaServices } from '../../services/index.services.js'

const listarPuntosVentas = async (req, res) => {
  try {
    const { code, puntosVentas } = await puntoVentaServices.listarPuntosVentas()
    res.status(code).json({ puntosVentas })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

const obtenerDetallesPunto = async (req, res) => {
  try {
    const { id } = req.params
    const { code, detalle, message } = await puntoVentaServices.obtenerDetallesPunto(id)
    res.status(code).json(detalle ? { detalle } : { message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

// NUEVO CONTROLADOR: Para obtener los tickets paginados bajo demanda
const listarTicketsPuntoPaginados = async (req, res) => {
  try {
    const { id } = req.params
    // Capturamos la página y el límite desde los query strings de la URL, seteando valores por defecto
    const { page = 1, limit = 20 } = req.query

    const result = await puntoVentaServices.listarTicketsPuntoPaginados(id, page, limit)

    res.status(result.code).json({
      tickets: result.tickets,
      totalTickets: result.totalTickets,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      message: result.message,
    })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor al intentar paginar los tickets.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { listarPuntosVentas, listarTicketsPuntoPaginados, obtenerDetallesPunto }
