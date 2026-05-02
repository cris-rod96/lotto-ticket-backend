import { cajaServices } from '../../services/index.services.js'

const listarTodas = async (req, res) => {
  try {
    const { code, cajas } = await cajaServices.listarTodas()
    res.status(code).json({ cajas })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

const listarPorPuntoDeVenta = async (req, res) => {
  try {
    const { id } = req.params
    const { code, cajas, message } = await cajaServices.listarPorPuntoDeVenta(id)
    res.status(code).json(cajas ? { cajas } : { message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

const obtenerCajaAbierta = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message, caja } = await cajaServices.obtenerCajaAbierta(id)
    res.status(code).json(caja ? { caja } : { message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

const obtenerCajasAbiertas = async (req, res) => {
  try {
    const { code, cajas } = await cajaServices.obtenerCajasAbiertas()
    res.status(code).json({ cajas })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { listarPorPuntoDeVenta, listarTodas, obtenerCajaAbierta, obtenerCajasAbiertas }
