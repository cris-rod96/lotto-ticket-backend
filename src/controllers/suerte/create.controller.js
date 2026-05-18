import { suerteServices } from '../../services/index.services.js'

const crearSuerte = async (req, res) => {
  try {
    // Extraemos los datos del body
    const { descripcion, premio, CifraId } = req.body

    // Pasamos el objeto limpio al servicio
    // El servicio se encargará de crear la suerte maestra y propagar los premios a todos los puntos de venta
    const { code, message } = await suerteServices.crearSuerte({
      descripcion,
      premio,
      CifraId,
    })

    res.status(code).json({ message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { crearSuerte }
