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

export { listarPuntosVentas, obtenerDetallesPunto }
