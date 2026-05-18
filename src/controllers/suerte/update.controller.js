import { suerteServices } from '../../services/index.services.js'

const actualizarPremio = async (req, res) => {
  try {
    const { id } = req.params
    // Ahora recibimos también el PuntoVentaId desde el body del request
    const { premio, PuntoVentaId } = req.body

    // Enviamos el objeto completo al servicio para que pueda validar el sorteo activo y el punto de venta
    const { code, message } = await suerteServices.actualizarPremio(id, {
      premio,
      PuntoVentaId,
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

export { actualizarPremio }
