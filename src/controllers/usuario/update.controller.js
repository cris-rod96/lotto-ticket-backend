import { usuarioServices } from '../../services/index.services.js'

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const user = req.user

    // Extraemos usuarioData desestructurando el retorno del servicio
    const {
      code,
      message,
      data: usuarioData,
    } = await usuarioServices.actualizarUsuario(id, data, user)

    // Enviamos el código de estado, el mensaje y los datos del usuario (sin clave)
    res.status(code).json({
      message,
      usuario: usuarioData, // Aquí viaja el objeto con delete usuarioSinClave.password
    })
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
    // Extraemos tanto la clave actual como la nueva desde el body
    const { claveActual, nuevaClave } = req.body

    // Pasamos ambos valores al servicio para la validación de identidad
    const { code, message } = await usuarioServices.actualizarClave(id, claveActual, nuevaClave)

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

const restaurarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message } = await usuarioServices.restaurarUsuario(id)
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

export { actualizarClave, actualizarUsuario, restaurarUsuario }
