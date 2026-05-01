import { movimientoServices } from '../../services/index.services.js'

const listarMovimientos = async (req, res) => {
  try {
    const { code, movimientos } = await movimientoServices.listarMovimientos()
    res.status(code).json({ movimientos })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

const listarMovimientosPorCaja = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message, movimientos } = await movimientoServices.listarMovimientosPorCaja(id)
    res.status(code).json(movimientos ? { movimientos } : { message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

const listarMovimientosPorPuntoVenta = async (req, res) => {
  try {
    const { id } = req.params
    const { code, movimientos, message } =
      await movimientoServices.listarMovimientosPorPuntoVenta(id)
    res.status(code).json(movimientos ? { movimientos } : { message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

const listarMovimientosPorUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message, movimientos } = await movimientoServices.listarMovimientosPorUsuario(id)
    res.status(code).json(movimientos ? { movimientos } : { message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export {
  listarMovimientos,
  listarMovimientosPorCaja,
  listarMovimientosPorPuntoVenta,
  listarMovimientosPorUsuario,
}
