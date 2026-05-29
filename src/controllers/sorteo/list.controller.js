import { sorteoServices } from '../../services/index.services.js'

const listarTodos = async (req, res) => {
  try {
    // Capturamos todos los parámetros de paginación y filtros desde la query string
    const { code, sorteos, totalItems, totalPages, currentPage } = await sorteoServices.listarTodos(
      req.query
    )

    // Devolvemos la data completa para que el frontend sepa cómo armar la paginación
    res.status(code).json({
      sorteos,
      totalItems,
      totalPages,
      currentPage,
    })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    res.status(500).json({
      message: msg,
    })
  }
}

const listarAbiertos = async (req, res) => {
  try {
    // Pasamos req.query para que también herede la paginación y filtros dinámicos
    const { code, sorteos, totalItems, totalPages, currentPage } =
      await sorteoServices.listarAbiertos(req.query)

    res.status(code).json({
      sorteos,
      totalItems,
      totalPages,
      currentPage,
    })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    res.status(500).json({
      message: msg,
    })
  }
}

const listarCerrados = async (req, res) => {
  try {
    // Pasamos req.query idéntico a los anteriores
    const { code, sorteos, totalItems, totalPages, currentPage } =
      await sorteoServices.listarCerrados(req.query)

    res.status(code).json({
      sorteos,
      totalItems,
      totalPages,
      currentPage,
    })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    res.status(500).json({
      message: msg,
    })
  }
}

export { listarAbiertos, listarCerrados, listarTodos }
