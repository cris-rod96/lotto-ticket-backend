import { sorteoServices } from '../../services/index.services.js'

const listarTodos = async (req, res) => {
  try {
    const { code, sorteos } = await sorteoServices.listarTodos()
    res.status(code).json({ sorteos })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    req.status(500).json({
      message: msg,
    })
  }
}

export { listarTodos }
