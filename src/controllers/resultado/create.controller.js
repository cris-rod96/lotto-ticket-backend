import { resultadoServices } from '../../services/index.services.js'

const registrarResultados = async (req, res) => {
  try {
    const { code, message } = await resultadoServices.registrarResultados(req.body)
    res.status(code).json({ message })
  } catch (error) {
    console.log(error)
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { registrarResultados }
