import { suerteServices } from '../../services/index.services.js'

const actualizarPremio = async (req, res) => {
  try {
    const { id } = req.params
    const { premio } = req.body
    const { code, message } = await suerteServices.actualizarPremio(id, premio)
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

export { actualizarPremio }
