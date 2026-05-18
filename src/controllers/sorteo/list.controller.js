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

const listarAbiertos = async (req, res) => {
  try {
    const { code, sorteos } = await sorteoServices.listarAbiertos()
    res.status(code).json({ sorteos })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    req.status(500).json({
      message: msg,
    })
  }
}

const listarCerrados = async (req, res) => {
  try {
    const { code, sorteos } = await sorteoServices.listarCerrados()
    res.status(code).json({ sorteos })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    req.status(500).json({
      message: msg,
    })
  }
}

export { listarAbiertos, listarCerrados, listarTodos }
