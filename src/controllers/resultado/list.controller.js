import { resultadoServices } from '../../services/index.services.js'

const listarResultados = async (req, res) => {
  try {
    const filtros = {
      fecha: req.query.fecha || null,
    }
    const { code, message, data } = await resultadoServices.listarResultados(filtros)
    res.status(code).json(data ? { data } : { message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { listarResultados }
