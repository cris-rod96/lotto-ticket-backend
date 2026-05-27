import { resultadoServices } from '../../services/index.services.js'

const registrarResultados = async (req, res) => {
  try {
    // Recibimos el objeto completo del servicio
    const { code, message, resultado } = await resultadoServices.registrarResultados(req.body)

    // Enviamos el mensaje y el objeto resultado (si existe)
    res.status(code).json({
      message,
      resultado, // Esto es lo que usará el frontend para el Flyer
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

export { registrarResultados }
