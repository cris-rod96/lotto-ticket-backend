import { suerteServices } from '../../services/index.services.js'

const listarSuertes = async (req, res) => {
  try {
    const { code, suertes } = await suerteServices.listarSuertes()
    res.status(code).json({ suertes })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { listarSuertes }
