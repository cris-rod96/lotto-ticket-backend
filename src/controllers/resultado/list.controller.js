import { resultadoServices } from '../../services/index.services.js'

const listarResultados = async (req, res) => {
  try {
    // 1. Capturamos los query params de paginación con valores por defecto eficientes
    const filtros = {
      fecha: req.query.fecha || null,
      page: req.query.page || 1,
      limit: req.query.limit || 10, // Puedes ajustar el límite por defecto que prefieras
    }

    // 2. Desestructuramos la nueva respuesta enriquecida del servicio
    const { code, message, data, totalItems, totalPages, currentPage } =
      await resultadoServices.listarResultados(filtros)

    // 3. Si todo sale bien, enviamos la data junto con los metadatos de paginación
    if (data) {
      return res.status(code).json({
        data, // El array de resultados (rows)
        totalItems, // Cantidad de registros totales en la base de datos
        totalPages, // Cantidad de páginas totales
        currentPage, // Confirmación de la página actual servida
      })
    }

    // En caso de que el servicio retorne un código de error controlado
    return res.status(code).json({ message })
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

export { listarResultados }
