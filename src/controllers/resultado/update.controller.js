import { resultadoServices } from '../../services/index.services.js'

const actualizarResultados = async (req, res) => {
  try {
    // Llamamos al servicio de actualización
    const { code, message, resultado } = await resultadoServices.actualizarResultados(req.body)

    // Respuesta con el resultado procesado
    res.status(code).json({
      message,
      resultado,
    })
  } catch (error) {
    const msg =
      error.message ||
      'Error al actualizar los resultados. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { actualizarResultados }
