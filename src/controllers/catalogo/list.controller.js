import { catalogoService } from '../../services/index.services.js'

const listarTodos = async (req, res) => {
  try {
    const { code, catalogos } = await catalogoService.listarTodos()
    res.status(code).json({ catalogos })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { listarTodos }
