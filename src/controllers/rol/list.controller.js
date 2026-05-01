import { rolServices } from '../../services/index.services.js'

const listarRoles = async (req, res) => {
  try {
    const { code, roles } = await rolServices.listarRoles()
    res.status(code).json({ roles })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { listarRoles }
