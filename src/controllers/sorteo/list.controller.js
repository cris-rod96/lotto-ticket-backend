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

const listarPorPunto = async (req, res) => {
  try {
    // Obtenemos el ID desde los parámetros de la URL (:puntoVentaId)
    const { puntoVentaId } = req.params

    if (!puntoVentaId) {
      return res.status(400).json({
        message: 'El parámetro puntoVentaId es obligatorio.',
      })
    }

    // Llamamos al servicio pasando el ID y los filtros de la URL (req.query)
    const { code, sorteos, totalItems, totalPages, currentPage } =
      await sorteoServices.listarPorPunto(puntoVentaId, req.query)

    res.status(code).json({
      sorteos,
      totalItems,
      totalPages,
      currentPage,
    })
  } catch (error) {
    console.error('Error en listarPorPunto:', error)
    res.status(500).json({
      message: error.message || 'Error interno al consultar reportes por punto de venta',
    })
  }
}

const listarAbiertos = async (req, res) => {
  try {
    // 1. Extraemos los parámetros de forma segura
    const params = req.query || {}

    // 2. Imprimimos para depurar: Si aquí sale undefined, es tu frontend/router
    console.log('Controlador - Parámetros recibidos:', params)

    // 3. Llamamos al servicio pasando el objeto completo
    const { code, sorteos, totalItems, totalPages, currentPage } =
      await sorteoServices.listarAbiertos(params)

    // 4. Respondemos
    res.status(code || 200).json({
      sorteos,
      totalItems,
      totalPages,
      currentPage,
    })
  } catch (error) {
    console.error('Error en listarAbiertos:', error)
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

export { listarAbiertos, listarCerrados, listarPorPunto, listarTodos }
