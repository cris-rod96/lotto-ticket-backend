import { puntoVentaServices } from '../../services/index.services.js'

const actualizarPuntoVenta = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const { code, message } = await puntoVentaServices.actualizarPuntoVenta(id, data)
    res.status(code).json({ message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

const restaurarPuntoVenta = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message } = await puntoVentaServices.restaurarPuntoVenta(id)
    res.status(code).json({ message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { actualizarPuntoVenta, restaurarPuntoVenta }
