import { cifraServices } from '../../services/index.services.js'

const listarTodas = async (req, res) => {
  try {
    const { code, cifras } = await cifraServices.listarTodas()
    res.status(code).json({ cifras })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { listarTodas }
