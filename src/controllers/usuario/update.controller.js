import { usuarioServices } from '../../services/index.services.js'

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const user = req.user

    const { code, message } = await usuarioServices.actualizarUsuario(id, data, user)
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

const actualizarClave = async (req, res) => {
  try {
    const { id } = req.params
    const { nuevaClave } = req.body
    const { code, message } = await usuarioServices.actualizarClave(id, nuevaClave)
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

export { actualizarClave, actualizarUsuario }
