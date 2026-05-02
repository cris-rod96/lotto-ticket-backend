import { authServices } from '../../services/index.services.js'

const iniciarSesion = async (req, res) => {
  try {
    const data = req.body
    const { code, message, info } = await authServices.iniciarSesion(data)
    res.status(code).json(info ? { info, message } : { message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export default {
  iniciarSesion,
}
